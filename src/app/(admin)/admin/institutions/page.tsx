import { createAdminClient } from '@/lib/supabase/admin'
import { InstitutionsClient } from './InstitutionsClient'
import { ErrorState } from '@/components/shared/ErrorState'

export const dynamic = 'force-dynamic'

export default async function AdminInstitutionsPage() {
  let institutions: any[] = []
  let errorMsg: string | null = null

  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await (supabaseAdmin
      .from('institutions') as any)
      .select(`
        id,
        name,
        slug,
        website_url,
        logo_url,
        description,
        country,
        state,
        city,
        address,
        institution_type,
        verification_status,
        verification_notes,
        created_at
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      errorMsg = error.message
    } else {
      institutions = data || []
    }
  } catch (err: any) {
    errorMsg = err?.message || 'An unexpected error occurred.'
  }

  if (errorMsg) {
    return (
      <ErrorState
        title="Failed to load verifications panel"
        message={errorMsg}
      />
    )
  }

  return (
    <InstitutionsClient initialInstitutions={institutions} />
  )
}
