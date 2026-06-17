import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from './ProfileClient'

export const metadata = {
  title: 'Edit Profile & CV | AcadConnect',
  description: 'Manage your contact details, highest degrees, major disciplines, and academic CV attachments.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id

  // Fetch profiles matching the active session
  let { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) {
    // Self-healing: create the missing base profile record dynamically
    const firstName = session.user.user_metadata?.first_name || 'Educator'
    const lastName = session.user.user_metadata?.last_name || ''
    const email = session.user.email || ''

    const { data: newProfile, error: insertError } = await (supabase
      .from('profiles') as any)
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: (session.user.user_metadata?.role || 'faculty') as any
      })
      .select('first_name, last_name, email')
      .single()

    if (insertError || !newProfile) {
      console.error('Failed to create missing base profile. Details:', {
        message: (insertError as any)?.message,
        code: (insertError as any)?.code,
        details: (insertError as any)?.details,
        hint: (insertError as any)?.hint,
      })
      redirect('/auth/login')
    }
    profile = newProfile
  }

  let { data: facultyProfile } = await supabase
    .from('faculty_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (!facultyProfile) {
    // Self-healing: create the missing faculty profile record dynamically
    const { data: newFacultyProfile, error: insertError } = await (supabase
      .from('faculty_profiles') as any)
      .insert({ id: userId })
      .select('*')
      .single()

    if (insertError || !newFacultyProfile) {
      console.error('Failed to create missing faculty profile. Details:', {
        message: (insertError as any)?.message,
        code: (insertError as any)?.code,
        details: (insertError as any)?.details,
        hint: (insertError as any)?.hint,
      })
      redirect('/dashboard')
    }
    facultyProfile = newFacultyProfile
  }

  return (
    <ProfileClient
      userId={userId}
      initialProfile={profile!}
      initialFacultyProfile={facultyProfile!}
    />
  )
}
