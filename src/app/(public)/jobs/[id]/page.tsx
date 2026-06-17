import { createClient } from '@/lib/supabase/server'
import { JobDetailsClient } from './JobDetailsClient'

interface RouteParams {
  id: string
}

export async function generateMetadata({
  params
}: {
  params: Promise<RouteParams>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: rawJob } = await supabase
    .from('jobs')
    .select(`
      title,
      department,
      salary_currency,
      salary_range_min,
      salary_range_max,
      institutions (
        name
      )
    `)
    .eq('id', resolvedParams.id)
    .is('deleted_at', null)
    .maybeSingle()
  
  if (!rawJob) {
    return {
      title: 'Job Vacancy Not Found | AcadConnect',
      description: 'The requested faculty vacancy could not be found.',
    }
  }

  const job = rawJob as any
  const instName = job.institutions?.name || 'Unknown Institution'

  return {
    title: `${job.title} - ${instName} | AcadConnect`,
    description: `Apply for the ${job.title} position in the ${job.department} at ${instName}. Target salary: ${job.salary_currency} ${Number(job.salary_range_min || 0).toLocaleString()} - ${Number(job.salary_range_max || 0).toLocaleString()}`,
  }
}

export default async function JobDetailsPage({
  params
}: {
  params: Promise<RouteParams>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // 1. Fetch Job details
  const { data: rawJobData } = await supabase
    .from('jobs')
    .select(`
      *,
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
    .eq('id', resolvedParams.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!rawJobData) {
    return <JobDetailsClient job={undefined} userRole={null} resumeFilename={null} relatedJobs={[]} initialBookmarked={false} />
  }

  const jobData = rawJobData as any

  const job = {
    id: jobData.id,
    institution_id: jobData.institution_id,
    title: jobData.title,
    subject_area: jobData.subject_area,
    department: jobData.department,
    location: jobData.location,
    work_mode: jobData.work_mode,
    employment_type: jobData.employment_type,
    salary_range_min: Number(jobData.salary_range_min || 0),
    salary_range_max: Number(jobData.salary_range_max || 0),
    salary_currency: jobData.salary_currency,
    vacancies: jobData.vacancies,
    required_qualification: jobData.required_qualification,
    preferred_qualification: jobData.preferred_qualification || '',
    description: jobData.description,
    requirements: jobData.requirements,
    application_deadline: jobData.application_deadline,
    created_at: jobData.created_at,
    institution: {
      id: (jobData.institutions as any)?.id || '',
      name: (jobData.institutions as any)?.name || 'Unknown Institution',
      slug: (jobData.institutions as any)?.slug || '',
      logo_url: (jobData.institutions as any)?.logo_url || null,
      description: (jobData.institutions as any)?.description || '',
      website_url: (jobData.institutions as any)?.website_url || '',
      country: (jobData.institutions as any)?.country || '',
      state: (jobData.institutions as any)?.state || '',
      city: (jobData.institutions as any)?.city || '',
    }
  }

  // 2. Fetch active session & faculty profile details
  const { data: { session } } = await supabase.auth.getSession()
  let userRole = null
  let resumeFilename = null
  let initialBookmarked = false
  if (session) {
    const userId = session.user.id
    const { data: rawProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (rawProfile) {
      const profile = rawProfile as any
      userRole = profile.role
      if (profile.role === 'faculty') {
        const { data: rawFaculty } = await supabase
          .from('faculty_profiles')
          .select('resume_filename')
          .eq('id', userId)
          .single()
        
        if (rawFaculty) {
          const faculty = rawFaculty as any
          resumeFilename = faculty.resume_filename
        }

        // Query bookmark status
        const { data: savedJob } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('faculty_id', userId)
          .eq('job_id', job.id)
          .maybeSingle()

        if (savedJob) {
          initialBookmarked = true
        }
      }
    }
  }

  // 3. Fetch related jobs (same subject area, up to 3)
  const { data: relatedJobsData } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      employment_type,
      location,
      subject_area
    `)
    .eq('status', 'published')
    .is('deleted_at', null)
    .eq('subject_area', job.subject_area)
    .neq('id', job.id)
    .limit(3)

  const relatedJobs = (relatedJobsData || []).map((rj: any) => ({
    id: rj.id,
    title: rj.title,
    employment_type: rj.employment_type,
    location: rj.location,
  }))

  return (
    <JobDetailsClient
      job={job}
      userRole={userRole}
      resumeFilename={resumeFilename}
      relatedJobs={relatedJobs}
      initialBookmarked={initialBookmarked}
    />
  )
}
