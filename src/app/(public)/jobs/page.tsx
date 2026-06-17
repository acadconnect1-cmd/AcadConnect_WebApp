import { createClient } from '@/lib/supabase/server'
import { JobsClient } from './JobsClient'
import { GuestJobsView } from './GuestJobsView'

export const metadata = {
  title: 'Academic Jobs Board | Find Faculty Vacancies',
  description: 'Explore academic vacancies, teaching posts, tenure track roles, and research assistant positions at top universities globally.',
}

interface SearchParams {
  q?: string
  location?: string
  institution?: string
}

export default async function JobsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  // 1. Fetch Active Session
  const { data: { session } } = await supabase.auth.getSession()

  // If user is a guest, show the invitation to join page
  if (!session) {
    return <GuestJobsView />
  }

  // Query all published jobs from Supabase
  const { data: rawJobs } = await supabase
    .from('jobs')
    .select(`
      id,
      institution_id,
      title,
      subject_area,
      department,
      location,
      work_mode,
      employment_type,
      salary_range_min,
      salary_range_max,
      salary_currency,
      vacancies,
      required_qualification,
      preferred_qualification,
      description,
      requirements,
      application_deadline,
      created_at,
      institutions (
        id,
        name,
        slug,
        logo_url,
        description,
        website_url,
        country,
        state,
        city
      )
    `)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const jobs = (rawJobs || []).map((job: any) => ({
    id: job.id,
    institution_id: job.institution_id,
    title: job.title,
    subject_area: job.subject_area,
    department: job.department,
    location: job.location,
    work_mode: job.work_mode,
    employment_type: job.employment_type,
    salary_range_min: Number(job.salary_range_min || 0),
    salary_range_max: Number(job.salary_range_max || 0),
    salary_currency: job.salary_currency,
    vacancies: job.vacancies,
    required_qualification: job.required_qualification,
    preferred_qualification: job.preferred_qualification || '',
    description: job.description,
    requirements: job.requirements,
    application_deadline: job.application_deadline,
    created_at: job.created_at,
    institution: {
      id: job.institutions?.id || '',
      name: job.institutions?.name || 'Unknown Institution',
      slug: job.institutions?.slug || '',
      logo_url: job.institutions?.logo_url || null,
      description: job.institutions?.description || '',
      website_url: job.institutions?.website_url || '',
      country: job.institutions?.country || '',
      state: job.institutions?.state || '',
      city: job.institutions?.city || '',
    }
  }))

  return (
    <JobsClient
      initialJobs={jobs}
      initialSearch={resolvedParams.q || ''}
      initialLocation={resolvedParams.location || ''}
      initialInstitution={resolvedParams.institution || ''}
    />
  )
}
