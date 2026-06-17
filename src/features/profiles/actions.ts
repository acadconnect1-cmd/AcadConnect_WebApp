'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types'
import * as z from 'zod'

// Schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  title: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  currentInstitution: z.string().nullable().optional(),
  highestDegree: z.string().nullable().optional(),
  majorDiscipline: z.string().nullable().optional(),
  websiteUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).nullable().optional(),
  linkedinUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).nullable().optional(),
  githubUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).nullable().optional(),
  searchStatus: z.string(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Helper to compute profile completion percentage
function computeCompletion(profile: any, facultyProfile: any): number {
  const fields = [
    profile.first_name,
    profile.last_name,
    facultyProfile.title,
    facultyProfile.phone,
    facultyProfile.bio,
    facultyProfile.current_institution,
    facultyProfile.highest_degree,
    facultyProfile.major_discipline,
    facultyProfile.resume_filename,
    facultyProfile.linkedin_url || facultyProfile.website_url || facultyProfile.github_url
  ]
  
  const filledCount = fields.filter((f) => f !== null && f !== undefined && String(f).trim() !== '').length
  return Math.round((filledCount / fields.length) * 100)
}

export async function updateProfileAction(
  rawInput: UpdateProfileInput
): Promise<ActionResponse<void>> {
  try {
    // 1. Authenticate caller
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    // 2. Validate input schema
    const parsed = updateProfileSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    // 3. Update profiles table
    const { error: profileError } = await (supabase
      .from('profiles') as any)
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      return { success: false, error: 'Failed to update base profile.' }
    }

    // 4. Update faculty_profiles table
    const { error: facultyError } = await (supabase
      .from('faculty_profiles') as any)
      .update({
        title: data.title || null,
        phone: data.phone || null,
        bio: data.bio || null,
        current_institution: data.currentInstitution || null,
        highest_degree: data.highestDegree || null,
        major_discipline: data.majorDiscipline || null,
        website_url: data.websiteUrl || null,
        linkedin_url: data.linkedinUrl || null,
        github_url: data.githubUrl || null,
        search_status: data.searchStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (facultyError) {
      return { success: false, error: 'Failed to update academic profile details.' }
    }

    // 5. Query updated tables to recalculate completion percentage
    const { data: latestProfile } = await (supabase
      .from('profiles') as any)
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    const { data: latestFaculty } = await (supabase
      .from('faculty_profiles') as any)
      .select('*')
      .eq('id', userId)
      .single()

    if (latestProfile && latestFaculty) {
      const percentage = computeCompletion(latestProfile, latestFaculty)
      
      await (supabase
        .from('faculty_profiles') as any)
        .update({ profile_completion_percentage: percentage })
        .eq('id', userId)
    }

    // 6. Revalidate cache boundaries
    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Server Action to simulate CV uploads
export async function uploadCVAction(
  fileName: string,
  storagePath?: string
): Promise<ActionResponse<{ filename: string; uploadedAt: string }>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    const uploadedAt = new Date().toISOString()
    const cvUrl = storagePath 
      ? `/api/cv?path=${encodeURIComponent(storagePath)}`
      : `/uploads/cv/${userId}-${fileName}`

    // 1. Update faculty profile fields
    const { error } = await (supabase
      .from('faculty_profiles') as any)
      .update({
        resume_filename: fileName,
        cv_url: cvUrl,
        resume_uploaded_at: uploadedAt,
        updated_at: uploadedAt,
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: 'Failed to save CV details to profile.' }
    }

    // 2. Fetch records and recalculate completion percentage
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    const { data: faculty } = await (supabase
      .from('faculty_profiles') as any)
      .select('*')
      .eq('id', userId)
      .single()

    if (profile && faculty) {
      const percentage = computeCompletion(profile, faculty)
      await (supabase
        .from('faculty_profiles') as any)
        .update({ profile_completion_percentage: percentage })
        .eq('id', userId)
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { filename: fileName, uploadedAt },
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
