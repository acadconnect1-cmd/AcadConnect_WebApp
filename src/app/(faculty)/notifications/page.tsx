import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationsClient } from './NotificationsClient'

export const metadata = {
  title: 'Notifications Hub | AcadConnect',
  description: 'Track updates from university search committees and platform alerts.',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id

  // Fetch all alerts matching the current user profile
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })

  return (
    <NotificationsClient
      initialNotifications={(notifications as any[]) || []}
    />
  )
}
