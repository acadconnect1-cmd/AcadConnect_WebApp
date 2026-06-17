import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SavedJobsClient } from './SavedJobsClient'

export const metadata = {
  title: 'Bookmarked Vacancies | AcadConnect',
  description: 'View and apply to your saved academic job vacancies.',
}

export default async function SavedJobsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id

  // Fetch bookmarks matching the active candidate profile
  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select(`
      id,
      job_id,
      created_at,
      jobs (
        id,
        title,
        location,
        salary_currency,
        salary_range_min,
        salary_range_max,
        employment_type,
        work_mode,
        department,
        institutions (
          name
        )
      )
    `)
    .eq('faculty_id', userId)
    .order('created_at', { ascending: false })

  return (
    <SavedJobsClient initialSavedJobs={(savedJobs as any[]) || []} />
  )
}
