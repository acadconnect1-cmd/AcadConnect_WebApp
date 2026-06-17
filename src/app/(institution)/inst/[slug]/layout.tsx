import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InstitutionLayoutClient } from './InstitutionLayoutClient'

interface InstitutionTenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function InstitutionTenantLayout({
  children,
  params,
}: InstitutionTenantLayoutProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id
  const userRole = session.user.user_metadata?.role as string | undefined

  // 1. Fetch institution details by slug
  const { data: inst } = (await supabase
    .from('institutions')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!inst) {
    redirect('/inst/dashboard')
  }

  // 2. Fetch active membership details (Admins bypass verification)
  let memberRole = 'admin' // If platform admin
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
    <InstitutionLayoutClient
      institution={inst}
      memberRole={memberRole}
    >
      {children}
    </InstitutionLayoutClient>
  )
}
