import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobsClient } from './JobsClient'

interface JobsManagerPageProps {
  params: Promise<{ slug: string }>
}

export default async function JobsManagerPage({ params }: JobsManagerPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  // 1. Fetch institution details
  const { data: inst } = (await supabase
    .from('institutions')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  // 2. Fetch jobs
  const { data: jobs } = (await supabase
    .from('jobs')
    .select('*')
    .eq('institution_id', inst.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })) as any

  const jobsList = jobs || []
  const jobIds = jobsList.map((j: any) => j.id)

  // 3. Fetch applications to count candidates
  const appsCountMap: Record<string, number> = {}
  if (jobIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select('job_id')
      .in('job_id', jobIds)
      .is('deleted_at', null)

    if (apps) {
      apps.forEach((app: any) => {
        appsCountMap[app.job_id] = (appsCountMap[app.job_id] || 0) + 1
      })
    }
  }

  // Map jobs with applicant counts
  const enrichedJobs = jobsList.map((job: any) => ({
    ...job,
    applicantCount: appsCountMap[job.id] || 0,
  }))

  return (
    <JobsClient
      initialJobs={enrichedJobs}
      slug={slug}
    />
  )
}
