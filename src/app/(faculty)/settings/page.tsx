import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

export const metadata = {
  title: 'Account Settings | AcadConnect',
  description: 'Manage your password credentials and account overview settings.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  const user = session.user
  const email = user.email || ''
  const role = user.user_metadata?.role || 'faculty'

  return <SettingsClient email={email} role={role} />
}
