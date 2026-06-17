import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingClient } from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Check for active memberships
  const { data: memberships } = await supabase
    .from('institution_members')
    .select('institution_id, institutions(slug)')
    .eq('profile_id', session.user.id)

  const activeSlugs = memberships
    ?.map((m: any) => m.institutions?.slug)
    .filter(Boolean) as string[]

  if (activeSlugs && activeSlugs.length > 0) {
    redirect(`/inst/${activeSlugs[0]}/dashboard`)
  }

  const user = {
    email: session.user.email || '',
    name: `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || 'Recruiter User'
  }

  return <OnboardingClient user={user} />
}
