import { createAdminClient } from '@/lib/supabase/admin'
import { SubscriptionsClient } from './SubscriptionsClient'
import { ErrorState } from '@/components/shared/ErrorState'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  let subscriptions: any[] = []
  let errorMsg: string | null = null

  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await (supabaseAdmin
      .from('subscriptions') as any)
      .select(`
        id,
        status,
        stripe_subscription_id,
        current_period_start,
        current_period_end,
        created_at,
        institution_id,
        institutions (
          name,
          slug
        ),
        plan_id,
        subscription_plans (
          name,
          tier,
          description
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      errorMsg = error.message
    } else {
      subscriptions = data || []
    }
  } catch (err: any) {
    errorMsg = err?.message || 'An unexpected error occurred.'
  }

  if (errorMsg) {
    return (
      <ErrorState
        title="Failed to load subscriptions console"
        message={errorMsg}
      />
    )
  }

  return (
    <SubscriptionsClient initialSubscriptions={subscriptions} />
  )
}
