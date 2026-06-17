import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface InstitutionLayoutProps {
  children: React.ReactNode
}

export default async function InstitutionLayout({ children }: InstitutionLayoutProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Gatekeeper: Check authentication
  if (!session) {
    redirect('/auth/login')
  }

  // Gatekeeper: Check role permissions
  const userRole = session.user.user_metadata?.role as string | undefined
  
  if (userRole !== 'institution_member' && userRole !== 'admin') {
    if (userRole === 'faculty') {
      redirect('/dashboard')
    }
    // Fallback if role is corrupt or missing
    redirect('/auth/login')
  }

  return <>{children}</>
}
