import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditJobClient } from './EditJobClient'

interface EditJobPageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
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

  return (
    <EditJobClient
      job={job}
      slug={slug}
    />
  )
}
