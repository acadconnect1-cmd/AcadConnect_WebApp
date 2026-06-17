import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new Response('Unauthorized. Please log in.', { status: 401 })
    }

    const currentUserId = session.user.id
    const currentUserRole = session.user.user_metadata?.role

    // 2. Parse storage path parameters
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return new Response('Missing path parameter.', { status: 400 })
    }

    // Path shape: {candidateId}/{filename}
    const pathParts = filePath.split('/')
    if (pathParts.length < 2) {
      return new Response('Invalid file path format.', { status: 400 })
    }
    const candidateId = pathParts[0]

    // 3. Authorization Check
    let isAuthorized = false

    // Case A: Current user is the candidate themselves
    if (currentUserId === candidateId) {
      isAuthorized = true
    }

    // Case B: Current user is a recruiter or admin
    if (!isAuthorized && (currentUserRole === 'institution_member' || currentUserRole === 'admin')) {
      if (currentUserRole === 'admin') {
        isAuthorized = true
      } else {
        // Check if there is an active application from this candidate to any job at the recruiter's institution
        // First get recruiter's memberships
        const { data: memberships } = await supabase
          .from('institution_members')
          .select('institution_id')
          .eq('profile_id', currentUserId)

        const instIds = memberships?.map((m: any) => m.institution_id) || []

        if (instIds.length > 0) {
          // Check if there is an application for a job belonging to one of these institutions
          const { data: apps } = await supabase
            .from('applications')
            .select(`
              id,
              jobs (
                institution_id
              )
            `)
            .eq('faculty_id', candidateId)
            .is('deleted_at', null)

          const matches = apps?.filter((app: any) => instIds.includes(app.jobs?.institution_id)) || []
          if (matches.length > 0) {
            isAuthorized = true
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response('Forbidden. You do not have permission to view this document.', { status: 403 })
    }

    // 4. Download and stream the file from Supabase Private Storage using Admin Client
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from('resumes')
      .download(filePath)

    if (downloadError || !fileBlob) {
      console.error('Storage download error:', downloadError)
      return new Response('File not found in storage.', { status: 404 })
    }

    // Convert Blob to ArrayBuffer to stream response
    const arrayBuffer = await fileBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pathParts[pathParts.length - 1]}"`,
      },
    })
  } catch (err: any) {
    console.error('Download route catch error:', err)
    return new Response(err?.message || 'An unexpected error occurred.', { status: 500 })
  }
}
