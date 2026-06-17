'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types'

// Mark a single notification alert as read
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    const { error } = await (supabase
      .from('notifications') as any)
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('recipient_id', userId)

    if (error) {
      return { success: false, error: 'Failed to update notification status.' }
    }

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

// Mark all active notifications for the current user as read
export async function markAllNotificationsAsReadAction(): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' }
    }
    const userId = session.user.id

    const { error } = await (supabase
      .from('notifications') as any)
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('recipient_id', userId)
      .is('read_at', null)

    if (error) {
      return { success: false, error: 'Failed to clear notifications.' }
    }

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return { success: true, data: undefined }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
