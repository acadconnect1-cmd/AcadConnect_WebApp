'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types'
import { jobFormSchema, JobFormInput } from '@/schemas/jobs'

// Server Action to toggle bookmark status on a job vacancy
export async function toggleSaveJobAction(
  jobId: string
): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    // Check if the user role is faculty
    const userRole = session.user.user_metadata?.role
    if (userRole !== 'faculty') {
      return { success: false, error: 'Only faculty profiles can bookmark positions.' }
    }

    // 1. Query if already bookmarked
    const { data: existingBookmark, error: queryError } = await (supabase
      .from('saved_jobs') as any)
      .select('id')
      .eq('faculty_id', userId)
      .eq('job_id', jobId)
      .maybeSingle()

    if (queryError) {
      return { success: false, error: 'Database verification failed.' }
    }

    if (existingBookmark) {
      // 2. Already exists -> Remove it
      const { error: deleteError } = await (supabase
        .from('saved_jobs') as any)
        .delete()
        .eq('faculty_id', userId)
        .eq('job_id', jobId)

      if (deleteError) {
        return { success: false, error: 'Failed to remove job bookmark.' }
      }

      // Revalidate pages
      revalidatePath('/saved-jobs')
      revalidatePath(`/jobs/${jobId}`)
      revalidatePath('/jobs')

      return { success: true, data: { saved: false } }
    } else {
      // 3. Not bookmarked -> Add it
      const { error: insertError } = await (supabase
        .from('saved_jobs') as any)
        .insert({
          faculty_id: userId,
          job_id: jobId,
        })

      if (insertError) {
        return { success: false, error: 'Failed to bookmark job vacancy.' }
      }

      // Revalidate pages
      revalidatePath('/saved-jobs')
      revalidatePath(`/jobs/${jobId}`)
      revalidatePath('/jobs')

      return { success: true, data: { saved: true } }
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Server Action to explicitly remove a bookmark
export async function removeSavedJobAction(
  jobId: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    const { error } = await (supabase
      .from('saved_jobs') as any)
      .delete()
      .eq('faculty_id', userId)
      .eq('job_id', jobId)

    if (error) {
      return { success: false, error: 'Failed to delete saved job.' }
    }

    revalidatePath('/saved-jobs')
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath('/jobs')

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// -------------------------------------------------------------
// Recruiter Job Forms & Management Server Actions
// -------------------------------------------------------------

// (jobFormSchema and JobFormInput are imported from @/schemas/jobs)

async function checkJobPostingPermissions(
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
  return member.role === 'owner' || member.role === 'admin' || member.role === 'recruiter'
}

// Action: Create New Job Post
export async function createJobAction(
  rawInput: JobFormInput
): Promise<ActionResponse<{ jobId: string }>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = jobFormSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    const isAuthorized = await checkJobPostingPermissions(supabase, data.institutionId, userId, userRole)
    if (!isAuthorized) {
      return { success: false, error: 'Access denied. You do not have permissions to post positions for this institution.' }
    }

    // Gating check on subscription limits and verification status
    if (data.status === 'published') {
      const { data: inst, error: instError } = await (supabase
        .from('institutions') as any)
        .select('verification_status')
        .eq('id', data.institutionId)
        .maybeSingle()

      if (instError || !inst) {
        return { success: false, error: 'Institution verification status could not be validated.' }
      }

      if (inst.verification_status !== 'approved') {
        return {
          success: false,
          error: 'Your institution registration is pending verification. Postings must remain drafts until approved.',
        }
      }

      const { count } = await (supabase
        .from('jobs') as any)
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', data.institutionId)
        .eq('status', 'published')
        .is('deleted_at', null)

      const { data: sub } = await (supabase
        .from('subscriptions')
        .select('*, subscription_plans(tier)')
        .eq('institution_id', data.institutionId)
        .maybeSingle() as any)

      // Subscription plan checks are disabled for the sandbox phase to allow infinite postings
      const tier = sub?.subscription_plans?.tier || 'free'
      const limit = 999999 // Infinite posting limit for sandbox testing

      if (count && count >= limit) {
        return {
          success: false,
          error: `Failed to publish. You have reached the active listing limit (${limit} jobs) for your ${tier.toUpperCase()} plan. Please upgrade your billing plan.`,
        }
      }
    }

    const { data: job, error } = await (supabase
      .from('jobs') as any)
      .insert({
        institution_id: data.institutionId,
        title: data.title,
        department: data.department,
        subject_area: data.subjectArea,
        employment_type: data.employmentType,
        work_mode: data.workMode,
        location: data.location,
        salary_range_min: data.salaryRangeMin || null,
        salary_range_max: data.salaryRangeMax || null,
        salary_currency: data.salaryCurrency,
        vacancies: data.vacancies,
        description: data.description,
        requirements: data.requirements,
        required_qualification: data.requiredQualification,
        preferred_qualification: data.preferredQualification || null,
        application_deadline: data.applicationDeadline || null,
        status: data.status,
        created_by: userId,
      })
      .select('id, institutions(slug)')
      .single()

    if (error || !job) {
      return { success: false, error: 'Failed to create job posting.' }
    }

    const slug = (job as any).institutions?.slug

    if (slug) {
      revalidatePath(`/inst/${slug}/jobs`)
      revalidatePath(`/inst/${slug}/dashboard`)
    }
    revalidatePath('/jobs')

    return { success: true, data: { jobId: job.id } }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Action: Update Existing Job Post
export async function updateJobAction(
  jobId: string,
  rawInput: JobFormInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = jobFormSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    const isAuthorized = await checkJobPostingPermissions(supabase, data.institutionId, userId, userRole)
    if (!isAuthorized) {
      return { success: false, error: 'Access denied. You do not have permissions to modify positions for this institution.' }
    }

    // Verify job belongs to institution
    const { data: existingJob } = await (supabase
      .from('jobs') as any)
      .select('id, status, institution_id')
      .eq('id', jobId)
      .maybeSingle()

    if (!existingJob || existingJob.institution_id !== data.institutionId) {
      return { success: false, error: 'Vacancy record not found.' }
    }

    // Gating check on subscription limits and verification status (only if changing from not published to published)
    if (data.status === 'published' && existingJob.status !== 'published') {
      const { data: inst, error: instError } = await (supabase
        .from('institutions') as any)
        .select('verification_status')
        .eq('id', data.institutionId)
        .maybeSingle()

      if (instError || !inst) {
        return { success: false, error: 'Institution verification status could not be validated.' }
      }

      if (inst.verification_status !== 'approved') {
        return {
          success: false,
          error: 'Your institution registration is pending verification. Postings must remain drafts until approved.',
        }
      }

      const { count } = await (supabase
        .from('jobs') as any)
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', data.institutionId)
        .eq('status', 'published')
        .is('deleted_at', null)

      const { data: sub } = await (supabase
        .from('subscriptions')
        .select('*, subscription_plans(tier)')
        .eq('institution_id', data.institutionId)
        .maybeSingle() as any)

      // Subscription plan checks are disabled for the sandbox phase to allow infinite postings
      const tier = sub?.subscription_plans?.tier || 'free'
      const limit = 999999 // Infinite posting limit for sandbox testing

      if (count && count >= limit) {
        return {
          success: false,
          error: `Failed to publish. You have reached the active listing limit (${limit} jobs) for your ${tier.toUpperCase()} plan. Please upgrade your billing plan.`,
        }
      }
    }

    const { error } = await (supabase
      .from('jobs') as any)
      .update({
        title: data.title,
        department: data.department,
        subject_area: data.subjectArea,
        employment_type: data.employmentType,
        work_mode: data.workMode,
        location: data.location,
        salary_range_min: data.salaryRangeMin || null,
        salary_range_max: data.salaryRangeMax || null,
        salary_currency: data.salaryCurrency,
        vacancies: data.vacancies,
        description: data.description,
        requirements: data.requirements,
        required_qualification: data.requiredQualification,
        preferred_qualification: data.preferredQualification || null,
        application_deadline: data.applicationDeadline || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    if (error) {
      return { success: false, error: 'Failed to update job posting.' }
    }

    const { data: updatedJob } = await (supabase
      .from('jobs') as any)
      .select('institutions(slug)')
      .eq('id', jobId)
      .single()

    const slug = (updatedJob as any)?.institutions?.slug

    if (slug) {
      revalidatePath(`/inst/${slug}/jobs`)
      revalidatePath(`/inst/${slug}/dashboard`)
    }
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath('/jobs')

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
