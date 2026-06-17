import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApplicantsClient } from './ApplicantsClient'

interface ApplicantsPageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function ApplicantsPage({ params }: ApplicantsPageProps) {
  const resolvedParams = await params
  const { slug, id } = resolvedParams

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  // 1. Fetch institution details by slug
  const { data: inst } = (await supabase
    .from('institutions')
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  // 2. Fetch the job details
  const { data: job } = (await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('institution_id', inst.id)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!job) {
    notFound()
  }

  // 3. Fetch applications for this job joined with profiles and history
  const { data: apps } = (await supabase
    .from('applications')
    .select(`
      id,
      status,
      resume_url,
      cover_letter,
      created_at,
      faculty_profiles (
        id,
        highest_degree,
        major_discipline,
        current_institution,
        profiles (
          first_name,
          last_name,
          email
        )
      ),
      application_status_history (
        id,
        old_status,
        new_status,
        comments,
        created_at,
        changed_by (
          first_name,
          last_name
        )
      )
    `)
    .eq('job_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })) as any

  return (
    <ApplicantsClient
      job={job}
      initialApplications={apps || []}
      slug={slug}
    />
  )
}
