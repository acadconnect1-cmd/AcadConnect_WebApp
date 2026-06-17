import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

interface SettingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id
  const userRole = session.user.user_metadata?.role

  // 1. Fetch institution details by slug
  const { data: inst } = (await supabase
    .from('institutions')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  // 2. Fetch active member role
  let memberRole = 'admin'
  if (userRole !== 'admin') {
    const { data: member } = (await supabase
      .from('institution_members')
      .select('role')
      .eq('institution_id', inst.id)
      .eq('profile_id', userId)
      .maybeSingle()) as any

    if (!member) {
      redirect('/inst/dashboard')
    }
    memberRole = member.role
  }

  return (
    <SettingsClient
      institution={inst}
      slug={slug}
      activeUserRole={memberRole}
      isPlatformAdmin={userRole === 'admin'}
    />
  )
}
