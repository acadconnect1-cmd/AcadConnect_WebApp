'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types'
import * as z from 'zod'

// 1. Institution settings schema
const institutionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  websiteUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  logoUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  country: z.string().min(2, 'Country is required.'),
  state: z.string().min(2, 'State is required.'),
  city: z.string().min(2, 'City is required.'),
  address: z.string().min(5, 'Address is required.'),
  institutionType: z.string().min(2, 'Institution Type is required.'),
})

export type UpdateInstitutionInput = z.infer<typeof institutionSchema>

// Helper check for owner/admin permissions
async function checkRecruiterPermission(
  supabase: any,
  institutionId: string,
  userId: string,
  userRole: string | undefined
): Promise<boolean> {
  if (userRole === 'admin') return true

  const { data: member } = await supabase
    .from('institution_members')
    .select('role')
    .eq('institution_id', institutionId)
    .eq('profile_id', userId)
    .maybeSingle()

  if (!member) return false
  return member.role === 'owner' || member.role === 'admin'
}

// Action: Update Institution Settings
export async function updateInstitutionAction(
  rawInput: UpdateInstitutionInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = institutionSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    // Check permissions
    const isAuthorized = await checkRecruiterPermission(supabase, data.id, userId, userRole)
    if (!isAuthorized) {
      return { success: false, error: 'Only institution owners or admins can update settings.' }
    }

    const { error } = await (supabase
      .from('institutions') as any)
      .update({
        name: data.name,
        website_url: data.websiteUrl || null,
        logo_url: data.logoUrl || null,
        description: data.description,
        country: data.country,
        state: data.state,
        city: data.city,
        address: data.address,
        institution_type: data.institutionType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    if (error) {
      return { success: false, error: 'Failed to update institution settings.' }
    }

    // Resolve slug for cache revalidation
    const { data: inst } = await (supabase
      .from('institutions') as any)
      .select('slug')
      .eq('id', data.id)
      .single()

    if (inst) {
      revalidatePath(`/inst/${inst.slug}/settings`)
      revalidatePath(`/inst/${inst.slug}/dashboard`)
    }

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Team management schemas
const inviteMemberSchema = z.object({
  institutionId: z.string().uuid(),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['owner', 'admin', 'recruiter', 'viewer']),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

// Action: Invite/Add Member
export async function inviteMemberAction(
  rawInput: InviteMemberInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = inviteMemberSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    const isAuthorized = await checkRecruiterPermission(supabase, data.institutionId, userId, userRole)
    if (!isAuthorized) {
      return { success: false, error: 'Only institution owners or admins can invite members.' }
    }

    // 1. Check if user profile with email exists
    const { data: targetProfile } = await (supabase
      .from('profiles') as any)
      .select('id')
      .eq('email', data.email.toLowerCase())
      .maybeSingle()

    const targetUserId = targetProfile?.id

    if (!targetUserId) {
      return { success: false, error: `A user with email ${data.email} is not registered on AcadConnect. They must sign up first.` }
    }

    // 2. Check if already a member
    const { data: existingMember } = await (supabase
      .from('institution_members') as any)
      .select('id')
      .eq('institution_id', data.institutionId)
      .eq('profile_id', targetUserId)
      .maybeSingle()

    if (existingMember) {
      return { success: false, error: 'This user is already a member of this institution.' }
    }

    // 3. Insert membership
    const { error: insertError } = await (supabase
      .from('institution_members') as any)
      .insert({
        institution_id: data.institutionId,
        profile_id: targetUserId,
        role: data.role,
      })

    if (insertError) {
      return { success: false, error: 'Failed to add team member.' }
    }

    // 4. Update Target User Profile's Metadata role to institution_member if it is faculty
    const { data: targetDetails } = await (supabase
      .from('profiles') as any)
      .select('role')
      .eq('id', targetUserId)
      .single()

    if (targetDetails && targetDetails.role === 'faculty') {
      await (supabase
        .from('profiles') as any)
        .update({ role: 'institution_member' })
        .eq('id', targetUserId)
    }

    // Resolve slug for revalidation
    const { data: inst } = await (supabase
      .from('institutions') as any)
      .select('slug')
      .eq('id', data.institutionId)
      .single()

    if (inst) {
      revalidatePath(`/inst/${inst.slug}/members`)
    }

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Update Member Role Action
const updateMemberRoleSchema = z.object({
  institutionId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'recruiter', 'viewer']),
})

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>

export async function updateMemberRoleAction(
  rawInput: UpdateMemberRoleInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = updateMemberRoleSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    const isAuthorized = await checkRecruiterPermission(supabase, data.institutionId, userId, userRole)
    if (!isAuthorized) {
      return { success: false, error: 'Only institution owners or admins can modify member roles.' }
    }

    // Guard: Prevent updating own role to avoid locking yourself out
    const { data: memberRecord } = await (supabase
      .from('institution_members') as any)
      .select('profile_id')
      .eq('id', data.memberId)
      .single()

    if (memberRecord && memberRecord.profile_id === userId && userRole !== 'admin') {
      return { success: false, error: 'You cannot modify your own membership role.' }
    }

    const { error } = await (supabase
      .from('institution_members') as any)
      .update({
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.memberId)

    if (error) {
      return { success: false, error: 'Failed to update member role.' }
    }

    const { data: inst } = await (supabase
      .from('institutions') as any)
      .select('slug')
      .eq('id', data.institutionId)
      .single()

    if (inst) {
      revalidatePath(`/inst/${inst.slug}/members`)
    }

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Remove Member Action
const removeMemberSchema = z.object({
  institutionId: z.string().uuid(),
  memberId: z.string().uuid(),
})

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>

export async function removeMemberAction(
  rawInput: RemoveMemberInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = removeMemberSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    const isAuthorized = await checkRecruiterPermission(supabase, data.institutionId, userId, userRole)
    if (!isAuthorized) {
      return { success: false, error: 'Only institution owners or admins can remove team members.' }
    }

    // Guard: Prevent removing yourself
    const { data: memberRecord } = await (supabase
      .from('institution_members') as any)
      .select('profile_id')
      .eq('id', data.memberId)
      .single()

    if (memberRecord && memberRecord.profile_id === userId && userRole !== 'admin') {
      return { success: false, error: 'You cannot remove yourself from the institution.' }
    }

    const { error } = await (supabase
      .from('institution_members') as any)
      .delete()
      .eq('id', data.memberId)

    if (error) {
      return { success: false, error: 'Failed to remove member.' }
    }

    const { data: inst } = await (supabase
      .from('institutions') as any)
      .select('slug')
      .eq('id', data.institutionId)
      .single()

    if (inst) {
      revalidatePath(`/inst/${inst.slug}/members`)
    }

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// 5. Create Institution schema
const createInstitutionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  websiteUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  logoUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters.').or(z.literal('')),
  country: z.string().min(2, 'Country is required.'),
  state: z.string().min(2, 'State is required.'),
  city: z.string().min(2, 'City is required.'),
  address: z.string().min(5, 'Address is required.'),
  institutionType: z.string().min(2, 'Institution Type is required.'),
})

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>

export async function createInstitutionAction(
  rawInput: CreateInstitutionInput
): Promise<ActionResponse<string>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    const parsed = createInstitutionSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    // Generate slug
    let slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    if (!slug) {
      slug = 'institution-' + Math.random().toString(36).substring(2, 6)
    }

    const adminClient = createAdminClient()

    // Ensure uniqueness of slug
    let uniqueSlug = slug
    let isUnique = false
    let attempt = 0
    while (!isUnique && attempt < 10) {
      const { data: existing } = await (adminClient
        .from('institutions') as any)
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle()

      if (!existing) {
        isUnique = true
      } else {
        attempt++
        uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
      }
    }

    // Insert institution using adminClient to bypass RLS policies
    const { data: newInst, error: instError } = await (adminClient
      .from('institutions') as any)
      .insert({
        name: data.name,
        slug: uniqueSlug,
        website_url: data.websiteUrl || null,
        logo_url: data.logoUrl || null,
        description: data.description || null,
        country: data.country,
        state: data.state,
        city: data.city,
        address: data.address,
        institution_type: data.institutionType,
        verification_status: 'pending',
      })
      .select('id, slug')
      .single()

    if (instError || !newInst) {
      return { success: false, error: instError?.message || 'Failed to register institution.' }
    }

    // Link the user as owner
    const { error: memberError } = await (adminClient
      .from('institution_members') as any)
      .insert({
        institution_id: newInst.id,
        profile_id: userId,
        role: 'owner',
      })

    if (memberError) {
      // Clean up the institution if linking fails (so we don't leave orphaned institutions)
      await (adminClient.from('institutions') as any).delete().eq('id', newInst.id)
      return { success: false, error: 'Failed to assign institution ownership.' }
    }

    // Update user profile role to 'institution_member' if they were 'faculty' or not set correctly
    const { data: profile } = await (adminClient
      .from('profiles') as any)
      .select('role')
      .eq('id', userId)
      .single()

    if (profile && profile.role !== 'institution_member' && profile.role !== 'admin') {
      await (adminClient
        .from('profiles') as any)
        .update({ role: 'institution_member' })
        .eq('id', userId)
      
      // Also update auth user metadata if possible
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { ...session.user.user_metadata, role: 'institution_member' }
      })
    }

    revalidatePath(`/inst/${newInst.slug}/dashboard`)

    return { success: true, data: newInst.slug }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
