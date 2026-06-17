'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types'
import * as z from 'zod'

const billingUpgradeSchema = z.object({
  institutionId: z.string().uuid(),
  tier: z.enum(['free', 'growth', 'enterprise']),
})

export type BillingUpgradeInput = z.infer<typeof billingUpgradeSchema>

export async function simulateSubscriptionUpgradeAction(
  rawInput: BillingUpgradeInput
): Promise<ActionResponse<{ planName: string }>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    const parsed = billingUpgradeSchema.safeParse(rawInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const data = parsed.data

    // 1. Validate permissions on this institution (Admins bypass validation lookups)
    if (userRole !== 'admin') {
      const { data: membership } = await (supabase
        .from('institution_members') as any)
        .select('role')
        .eq('institution_id', data.institutionId)
        .eq('profile_id', userId)
        .maybeSingle()

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return { success: false, error: 'Only institution owners or admins can modify billing plans.' }
      }
    }

    // 2. Fetch or seed subscription plan record
    const plan = await (supabase
      .from('subscription_plans')
      .select('id, name')
      .eq('tier', data.tier)
      .maybeSingle() as any)

    if (!plan.data) {
      // Seed dynamically to satisfy FK checks
      const { data: newPlan, error: seedError } = await (supabase
        .from('subscription_plans') as any)
        .insert({
          name: data.tier.charAt(0).toUpperCase() + data.tier.slice(1) + ' Plan',
          description: `Simulated subscription plan for ${data.tier} tier.`,
          stripe_price_id: `price_mock_${data.tier}`,
          active: true,
          features: {
            vacanciesLimit: data.tier === 'free' ? 1 : data.tier === 'growth' ? 5 : 9999,
            membersLimit: data.tier === 'free' ? 1 : data.tier === 'growth' ? 5 : 9999,
          },
          tier: data.tier,
        })
        .select('id, name')
        .single()

      if (seedError) {
        return { success: false, error: 'Failed to configure subscription products.' }
      }
      plan.data = newPlan
    }

    const planId = plan.data.id
    const planName = plan.data.name

    // 3. Check if institution has existing subscription record
    const { data: existingSub } = await (supabase
      .from('subscriptions') as any)
      .select('id')
      .eq('institution_id', data.institutionId)
      .maybeSingle()

    const start = new Date().toISOString()
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 Days

    if (existingSub) {
      // Update
      const { error: updateError } = await (supabase
        .from('subscriptions') as any)
        .update({
          plan_id: planId,
          status: 'active',
          current_period_start: start,
          current_period_end: end,
          updated_at: start,
        })
        .eq('id', existingSub.id)

      if (updateError) {
        return { success: false, error: 'Failed to update plan subscription.' }
      }
    } else {
      // Insert
      const { error: insertError } = await (supabase
        .from('subscriptions') as any)
        .insert({
          institution_id: data.institutionId,
          plan_id: planId,
          status: 'active',
          stripe_subscription_id: `sub_mock_${data.institutionId.slice(0, 8)}_${data.tier}`,
          current_period_start: start,
          current_period_end: end,
        })

      if (insertError) {
        return { success: false, error: 'Failed to activate plan subscription.' }
      }
    }

    // 4. Resolve slug for revalidation
    const { data: inst } = await (supabase
      .from('institutions') as any)
      .select('slug')
      .eq('id', data.institutionId)
      .single()

    if (inst) {
      revalidatePath(`/inst/${inst.slug}/billing`)
      revalidatePath(`/inst/${inst.slug}/dashboard`)
    }

    return { success: true, data: { planName } }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
