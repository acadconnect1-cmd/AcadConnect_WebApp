'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types'
import * as z from 'zod'

const updateApplicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['applied', 'reviewed', 'shortlisted', 'rejected', 'hired']),
  comments: z.string().optional(),
})

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>

export async function updateApplicationStatusAction(
  rawInput: UpdateApplicationStatusInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = updateApplicationStatusSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    // 1. Fetch application details to verify institution link & get old status / candidate id
    const { data: app } = (await (supabase
      .from('applications') as any)
      .select(`
        id,
        status,
        faculty_id,
        job_id,
        jobs (
          id,
          title,
          institution_id,
          institutions (
            slug
          )
        )
      `)
      .eq('id', data.applicationId)
      .is('deleted_at', null)
      .maybeSingle()) as any

    if (!app) {
      return { success: false, error: 'Application not found.' }
    }

    const job = app.jobs as any
    const institutionId = job?.institution_id
    const slug = job?.institutions?.slug

    // 2. Validate recruiter permissions on this institution
    if (userRole !== 'admin') {
      const { data: membership } = await (supabase
        .from('institution_members') as any)
        .select('role')
        .eq('institution_id', institutionId)
        .eq('profile_id', userId)
        .maybeSingle()

      if (!membership) {
        return { success: false, error: 'Access denied. You do not belong to this hiring institution.' }
      }
    }

    const oldStatus = app.status
    const newStatus = data.status

    if (oldStatus === newStatus) {
      return { success: true, data: undefined }
    }

    // 3. Update application status
    const { error: updateError } = await (supabase
      .from('applications') as any)
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.applicationId)

    if (updateError) {
      return { success: false, error: 'Failed to update application status.' }
    }

    // 4. Record in status history log
    const { error: historyError } = await (supabase
      .from('application_status_history') as any)
      .insert({
        application_id: data.applicationId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: userId,
        comments: data.comments || null,
      })

    if (historyError) {
      console.error('Failed to write to status history:', historyError)
    }

    // 5. Create notification alert for candidate
    const { error: notificationError } = await (supabase
      .from('notifications') as any)
      .insert({
        recipient_id: app.faculty_id,
        type: 'application_status_change',
        title: 'Application Status Update',
        content: `Your application status for "${job?.title}" has been updated to "${newStatus}".`,
        link_url: `/applications/${data.applicationId}`,
      })

    if (notificationError) {
      console.error('Failed to dispatch applicant notification:', notificationError)
    }

    // 6. Revalidate cache boundaries
    if (slug) {
      revalidatePath(`/inst/${slug}/jobs/${job.id}/applicants`)
      revalidatePath(`/inst/${slug}/dashboard`)
    }
    revalidatePath(`/applications/${data.applicationId}`)
    revalidatePath('/applications')

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// 7. Submit Application Action (Candidate)
const submitApplicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().min(5, 'Cover letter must be at least 5 characters.'),
})

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>

export async function submitApplicationAction(
  rawInput: SubmitApplicationInput
): Promise<ActionResponse<{ applicationId: string }>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    if (userRole !== 'faculty') {
      return { success: false, error: 'Only faculty candidates can apply to job vacancies.' }
    }

    const parsed = submitApplicationSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const { jobId, coverLetter } = parsed.data

    // 1. Retrieve faculty profile CV details
    const { data: faculty } = await (supabase
      .from('faculty_profiles') as any)
      .select('cv_url, resume_filename')
      .eq('id', userId)
      .maybeSingle()

    if (!faculty || !faculty.cv_url) {
      return { success: false, error: 'Please upload a resume in your profile builder before submitting applications.' }
    }

    // 2. Check if already applied
    const { data: existingApp } = await (supabase
      .from('applications') as any)
      .select('id')
      .eq('job_id', jobId)
      .eq('faculty_id', userId)
      .is('deleted_at', null)
      .maybeSingle()

    if (existingApp) {
      return { success: false, error: 'You have already submitted an application for this vacancy.' }
    }

    // 3. Create application
    const { data: newApp, error: insertError } = await (supabase
      .from('applications') as any)
      .insert({
        job_id: jobId,
        faculty_id: userId,
        resume_url: faculty.cv_url,
        cover_letter: coverLetter,
        status: 'applied',
      })
      .select('id')
      .single()

    if (insertError || !newApp) {
      return { success: false, error: 'Failed to submit application. Database insert failed.' }
    }

    // 4. Record status history
    await (supabase.from('application_status_history') as any).insert({
      application_id: newApp.id,
      old_status: 'applied',
      new_status: 'applied',
      changed_by: userId,
      comments: 'Application initially submitted by candidate.',
    })

    // 5. Get job details to notify recruiter
    const { data: job } = await (supabase
      .from('jobs') as any)
      .select('title, institution_id, institutions(name, slug)')
      .eq('id', jobId)
      .single()

    if (job) {
      // Find recruiters of this institution to notify
      const { data: members } = await (supabase
        .from('institution_members') as any)
        .select('profile_id')
        .eq('institution_id', job.institution_id)

      if (members && members.length > 0) {
        const notificationsData = members.map((m: any) => ({
          recipient_id: m.profile_id,
          type: 'system_alert',
          title: 'New Job Application',
          content: `A candidate has applied for the vacancy: "${job.title}".`,
          link_url: `/inst/${job.institutions?.slug}/jobs/${jobId}/applicants`,
        }))
        
        await (supabase.from('notifications') as any).insert(notificationsData)
      }

      // Revalidate recruiter cache
      if (job.institutions?.slug) {
        revalidatePath(`/inst/${job.institutions.slug}/jobs/${jobId}/applicants`)
        revalidatePath(`/inst/${job.institutions.slug}/dashboard`)
      }
    }

    revalidatePath('/applications')
    revalidatePath('/dashboard')

    return { success: true, data: { applicationId: newApp.id } }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
