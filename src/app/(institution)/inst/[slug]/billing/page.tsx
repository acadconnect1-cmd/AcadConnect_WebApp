import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BillingClient } from './BillingClient'

interface BillingPageProps {
  params: Promise<{ slug: string }>
}

export default async function BillingPage({ params }: BillingPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id
  const userRole = session.user.user_metadata?.role

  // 1. Fetch institution details
  const { data: inst } = (await supabase
    .from('institutions')
    .select('id, name')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  // 2. Fetch active subscription details
  const { data: sub } = (await supabase
    .from('subscriptions')
    .select(`
      id,
      status,
      current_period_end,
      subscription_plans (
        id,
        name,
        features,
        tier
      )
    `)
    .eq('institution_id', inst.id)
    .maybeSingle()) as any

  const currentSub = sub || null

  // 3. Resolve active member role
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
    <BillingClient
      institutionId={inst.id}
      institutionName={inst.name}
      slug={slug}
      activeSubscription={currentSub}
      activeUserRole={memberRole}
      isPlatformAdmin={userRole === 'admin'}
    />
  )
}
