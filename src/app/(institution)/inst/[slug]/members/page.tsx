import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembersClient } from './MembersClient'

interface TeamMembersPageProps {
  params: Promise<{ slug: string }>
}

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
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
    .select('id, name')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  // 2. Fetch team members list
  const { data: members } = (await supabase
    .from('institution_members')
    .select(`
      id,
      role,
      created_at,
      profile_id,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq('institution_id', inst.id)
    .order('created_at', { ascending: true })) as any

  // 3. Resolve active user's recruiter role inside this institution
  let activeUserRecruiterRole = 'admin'
  if (userRole !== 'admin') {
    const activeMember = members?.find((m: any) => m.profile_id === userId)
    activeUserRecruiterRole = activeMember?.role || 'viewer'
  }

  return (
    <MembersClient
      institutionId={inst.id}
      slug={slug}
      initialMembers={members || []}
      activeUserId={userId}
      activeUserRole={activeUserRecruiterRole}
      isPlatformAdmin={userRole === 'admin'}
    />
  )
}
