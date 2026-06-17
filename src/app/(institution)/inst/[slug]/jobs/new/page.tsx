import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewJobClient } from './NewJobClient'

interface NewJobPageProps {
  params: Promise<{ slug: string }>
}

export default async function NewJobPage({ params }: NewJobPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  // 1. Fetch institution details by slug
  const { data: inst } = (await supabase
    .from('institutions')
    .select('id, name')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  return (
    <NewJobClient
      institutionId={inst.id}
      institutionName={inst.name}
      slug={slug}
    />
  )
}
