import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FacultyLayoutClient } from './FacultyLayoutClient'

interface FacultyLayoutProps {
  children: React.ReactNode
}

export default async function FacultyLayout({ children }: FacultyLayoutProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Gatekeeper: Check authentication
  if (!session) {
    redirect('/auth/login')
  }

  // Gatekeeper: Check role permissions
  const userRole = session.user.user_metadata?.role as string | undefined
  
  if (userRole !== 'faculty' && userRole !== 'admin') {
    if (userRole === 'institution_member') {
      // Find recruiter's first active institution membership
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
      redirect('/inst/dashboard')
    }
    // Fallback if role is corrupt or missing
    redirect('/auth/login')
  }

  return <FacultyLayoutClient>{children}</FacultyLayoutClient>
}
