'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ActionResponse } from '@/types'
import * as z from 'zod'

// Helper to check if current user is an Admin
async function checkAdminPermission(): Promise<{ isAdmin: boolean; adminId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { isAdmin: false, error: 'Unauthorized. Please log in.' }
    }
    const role = session.user.user_metadata?.role
    if (role !== 'admin') {
      return { isAdmin: false, error: 'Access denied. Administrator privileges required.' }
    }
    return { isAdmin: true, adminId: session.user.id }
  } catch (err: any) {
    return { isAdmin: false, error: err?.message || 'Authorization check failed.' }
  }
}

// Helper to log admin actions to activity_logs
async function logAdminActivity(
  adminId: string,
  action: string,
  targetEntity: string,
  targetId: string | null,
  details: Record<string, any> = {}
) {
  try {
    const supabaseAdmin = createAdminClient()
    const reqHeaders = await headers()
    const ipAddress = reqHeaders.get('x-forwarded-for') || null
    const userAgent = reqHeaders.get('user-agent') || null

    await (supabaseAdmin.from('activity_logs') as any).insert({
      profile_id: adminId,
      action,
      target_entity: targetEntity,
      target_id: targetId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    })
  } catch (err) {
    console.error('Failed to log admin activity:', err)
  }
}

// 1. Verify Institution Action
const verifyInstitutionSchema = z.object({
  institutionId: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  notes: z.string().optional(),
})

export type VerifyInstitutionInput = z.infer<typeof verifyInstitutionSchema>

export async function verifyInstitutionAction(
  rawInput: VerifyInstitutionInput
): Promise<ActionResponse<void>> {
  try {
    const authCheck = await checkAdminPermission()
    if (!authCheck.isAdmin) {
      return { success: false, error: authCheck.error || 'Access denied.' }
    }
    const adminId = authCheck.adminId!

    const parsed = verifyInstitutionSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const { institutionId, status, notes } = parsed.data

    const supabaseAdmin = createAdminClient()

    // Retrieve institution details first (to obtain slug for path revalidation)
    const { data: inst } = await (supabaseAdmin
      .from('institutions') as any)
      .select('name, slug, verification_status')
      .eq('id', institutionId)
      .single()

    if (!inst) {
      return { success: false, error: 'Institution not found.' }
    }

    // Update verification state
    const { error: updateError } = await (supabaseAdmin
      .from('institutions') as any)
      .update({
        verification_status: status,
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        verification_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', institutionId)

    if (updateError) {
      return { success: false, error: 'Failed to update verification status.' }
    }

    // Log admin action
    await logAdminActivity(
      adminId,
      `verify_institution_${status}`,
      'institutions',
      institutionId,
      {
        institution_name: inst.name,
        slug: inst.slug,
        previous_status: inst.verification_status,
        new_status: status,
        notes: notes || '',
      }
    )

    // Revalidate paths
    revalidatePath('/admin/institutions')
    revalidatePath('/admin/dashboard')
    if (inst.slug) {
      revalidatePath(`/inst/${inst.slug}/dashboard`)
    }

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// 2. Moderation: Update Subscription Status Action
const updateSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
  status: z.enum(['active', 'past_due', 'canceled', 'incomplete', 'trialing']),
})

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>

export async function updateSubscriptionStatusAction(
  rawInput: UpdateSubscriptionInput
): Promise<ActionResponse<void>> {
  try {
    const authCheck = await checkAdminPermission()
    if (!authCheck.isAdmin) {
      return { success: false, error: authCheck.error || 'Access denied.' }
    }
    const adminId = authCheck.adminId!

    const parsed = updateSubscriptionSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const { subscriptionId, status } = parsed.data

    const supabaseAdmin = createAdminClient()

    // Retrieve subscription details
    const { data: sub } = await (supabaseAdmin
      .from('subscriptions') as any)
      .select('id, status, institution_id, institutions(name, slug)')
      .eq('id', subscriptionId)
      .single()

    if (!sub) {
      return { success: false, error: 'Subscription record not found.' }
    }

    const instName = (sub as any)?.institutions?.name || 'Unknown'
    const instSlug = (sub as any)?.institutions?.slug || ''

    // Update status
    const { error: updateError } = await (supabaseAdmin
      .from('subscriptions') as any)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)

    if (updateError) {
      return { success: false, error: 'Failed to update subscription status.' }
    }

    // Log admin action
    await logAdminActivity(
      adminId,
      `update_subscription_${status}`,
      'subscriptions',
      subscriptionId,
      {
        institution_id: sub.institution_id,
        institution_name: instName,
        previous_status: sub.status,
        new_status: status,
      }
    )

    // Revalidate paths
    revalidatePath('/admin/subscriptions')
    revalidatePath('/admin/dashboard')
    if (instSlug) {
      revalidatePath(`/inst/${instSlug}/billing`)
      revalidatePath(`/inst/${instSlug}/dashboard`)
    }

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// 3. Get Dashboard Overview Metrics Server Action
export interface DashboardStats {
  metrics: {
    totalInstitutions: number
    pendingVerifications: number
    totalCandidates: number
    activeJobs: number
    activePremiumPlans: number
  }
  institutionStatusDistribution: {
    pending: number
    approved: number
    rejected: number
    suspended: number
  }
  funnel: {
    applicationsPerJob: number
    shortlistRate: number
    hireRate: number
    rejectionRate: number
  }
  demographics: {
    candidates: number
    recruiters: number
  }
  recentLogs: Array<{
    id: string
    created_at: string
    action: string
    target_entity: string
    details: any
    profile: {
      email: string
      first_name: string
      last_name: string
    } | null
  }>
}

export async function getAdminDashboardStatsAction(): Promise<ActionResponse<DashboardStats>> {
  try {
    const authCheck = await checkAdminPermission()
    if (!authCheck.isAdmin) {
      return { success: false, error: authCheck.error || 'Access denied.' }
    }

    const supabaseAdmin = createAdminClient()

    // 1. Query metrics counts
    // Total Institutions
    const { count: instCount } = await (supabaseAdmin
      .from('institutions') as any)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Pending Institutions
    const { count: pendingCount } = await (supabaseAdmin
      .from('institutions') as any)
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending')
      .is('deleted_at', null)

    // Approved Institutions
    const { count: approvedCount } = await (supabaseAdmin
      .from('institutions') as any)
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'approved')
      .is('deleted_at', null)

    // Rejected Institutions
    const { count: rejectedCount } = await (supabaseAdmin
      .from('institutions') as any)
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'rejected')
      .is('deleted_at', null)

    // Suspended Institutions
    const { count: suspendedCount } = await (supabaseAdmin
      .from('institutions') as any)
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'suspended')
      .is('deleted_at', null)

    // Candidates count
    const { count: candCount } = await (supabaseAdmin
      .from('profiles') as any)
      .select('*', { count: 'exact', head: true })
      .eq('role', 'faculty')
      .is('deleted_at', null)

    // Recruiters count
    const { count: recCount } = await (supabaseAdmin
      .from('profiles') as any)
      .select('*', { count: 'exact', head: true })
      .eq('role', 'institution_member')
      .is('deleted_at', null)

    // Active Jobs count
    const { count: jobCount } = await (supabaseAdmin
      .from('jobs') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .is('deleted_at', null)

    // Active Premium subscriptions count (subscriptions that are active and not free tier)
    const { data: subs } = await (supabaseAdmin
      .from('subscriptions') as any)
      .select('status, subscription_plans(tier)')
      .eq('status', 'active')

    const activePremiumCount = subs?.filter((s: any) => s.subscription_plans?.tier !== 'free').length || 0

    // 2. Query funnel stats
    const { count: totalApps } = await (supabaseAdmin
      .from('applications') as any)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    const { count: shortlistedApps } = await (supabaseAdmin
      .from('applications') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'shortlisted')
      .is('deleted_at', null)

    const { count: hiredApps } = await (supabaseAdmin
      .from('applications') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'hired')
      .is('deleted_at', null)

    const { count: rejectedApps } = await (supabaseAdmin
      .from('applications') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .is('deleted_at', null)

    const applicationsPerJob = jobCount && jobCount > 0 ? Number(((totalApps || 0) / jobCount).toFixed(1)) : 0
    const shortlistRate = totalApps && totalApps > 0 ? Math.round(((shortlistedApps || 0) / totalApps) * 100) : 0
    const hireRate = totalApps && totalApps > 0 ? Math.round(((hiredApps || 0) / totalApps) * 100) : 0
    const rejectionRate = totalApps && totalApps > 0 ? Math.round(((rejectedApps || 0) / totalApps) * 100) : 0

    // 3. Query last 5 logs
    const { data: logs } = await (supabaseAdmin
      .from('activity_logs') as any)
      .select(`
        id,
        created_at,
        action,
        target_entity,
        details,
        profiles (
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentLogs = (logs || []).map((l: any) => ({
      id: String(l.id),
      created_at: l.created_at,
      action: l.action,
      target_entity: l.target_entity,
      details: l.details,
      profile: l.profiles ? {
        email: l.profiles.email,
        first_name: l.profiles.first_name,
        last_name: l.profiles.last_name
      } : null
    }))

    return {
      success: true,
      data: {
        metrics: {
          totalInstitutions: instCount || 0,
          pendingVerifications: pendingCount || 0,
          totalCandidates: candCount || 0,
          activeJobs: jobCount || 0,
          activePremiumPlans: activePremiumCount
        },
        institutionStatusDistribution: {
          pending: pendingCount || 0,
          approved: approvedCount || 0,
          rejected: rejectedCount || 0,
          suspended: suspendedCount || 0,
        },
        funnel: {
          applicationsPerJob,
          shortlistRate,
          hireRate,
          rejectionRate,
        },
        demographics: {
          candidates: candCount || 0,
          recruiters: recCount || 0,
        },
        recentLogs
      }
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to calculate platform metrics.' }
  }
}

// 4. Query Paginated Activity Logs
export interface ActivityLogItem {
  id: string
  created_at: string
  action: string
  target_entity: string
  target_id: string | null
  ip_address: string | null
  user_agent: string | null
  details: any
  profile: {
    email: string
    first_name: string
    last_name: string
  } | null
}

export interface GetActivityLogsResponse {
  logs: ActivityLogItem[]
  totalCount: number
}

export async function getActivityLogsAction(params: {
  emailFilter?: string
  actionFilter?: string
  entityFilter?: string
  page?: number
  limit?: number
}): Promise<ActionResponse<GetActivityLogsResponse>> {
  try {
    const authCheck = await checkAdminPermission()
    if (!authCheck.isAdmin) {
      return { success: false, error: authCheck.error || 'Access denied.' }
    }

    const { emailFilter, actionFilter, entityFilter, page = 1, limit = 15 } = params
    const supabaseAdmin = createAdminClient()

    const offset = (page - 1) * limit

    // Base query for logs
    let query = supabaseAdmin
      .from('activity_logs')
      .select(`
        id,
        created_at,
        action,
        target_entity,
        target_id,
        ip_address,
        user_agent,
        details,
        profiles!inner (
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' }) as any

    if (actionFilter) {
      query = query.ilike('action', `%${actionFilter}%`)
    }
    if (entityFilter) {
      query = query.eq('target_entity', entityFilter)
    }
    if (emailFilter) {
      query = query.ilike('profiles.email', `%${emailFilter}%`)
    }

    const { data: logs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { success: false, error: 'Failed to retrieve system logs.' }
    }

    const formattedLogs = (logs || []).map((l: any) => ({
      id: String(l.id),
      created_at: l.created_at,
      action: l.action,
      target_entity: l.target_entity,
      target_id: l.target_id,
      ip_address: l.ip_address,
      user_agent: l.user_agent,
      details: l.details,
      profile: l.profiles ? {
        email: l.profiles.email,
        first_name: l.profiles.first_name,
        last_name: l.profiles.last_name
      } : null
    }))

    return {
      success: true,
      data: {
        logs: formattedLogs,
        totalCount: count || 0
      }
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to query activity logs.' }
  }
}
