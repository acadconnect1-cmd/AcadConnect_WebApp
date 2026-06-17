import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Initialize Supabase Client
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Fetch Active Session
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // 3. Routing Checks
  const isAuthRoute = pathname.startsWith('/auth')
  const isFacultyRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/applications') || 
    pathname.startsWith('/saved-jobs') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/notifications')
  
  const isInstitutionRoute = pathname.startsWith('/inst')
  const isAdminRoute = pathname.startsWith('/admin')

  // Case A: User is not authenticated
  if (!session) {
    if (isFacultyRoute || isInstitutionRoute || isAdminRoute) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // Case B: User is authenticated
  const userRole = session.user.user_metadata?.role as string | undefined

  // B1: Authenticated user attempting to access Auth pages
  if (isAuthRoute && pathname !== '/auth/callback') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    if (userRole === 'institution_member') {
      // Find recruiter's first active institution membership
      const { data: memberships } = await supabase
        .from('institution_members')
        .select('institution_id, institutions(slug)')
        .eq('profile_id', session.user.id)

      const activeSlugs = memberships
        ?.map((m: { institutions: { slug: string } | null }) => m.institutions?.slug)
        .filter(Boolean) as string[]

      if (activeSlugs && activeSlugs.length > 0) {
        return NextResponse.redirect(new URL(`/inst/${activeSlugs[0]}/dashboard`, request.url))
      }
      return NextResponse.redirect(new URL('/inst/onboarding', request.url))
    }
    
    // Default fallback is Faculty dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // B2: Role boundary checks

  // Faculty Gating
  if (isFacultyRoute && userRole !== 'faculty' && userRole !== 'admin') {
    if (userRole === 'institution_member') {
      const { data: memberships } = await supabase
        .from('institution_members')
        .select('institution_id, institutions(slug)')
        .eq('profile_id', session.user.id)

      const activeSlugs = memberships
        ?.map((m: { institutions: { slug: string } | null }) => m.institutions?.slug)
        .filter(Boolean) as string[]

      if (activeSlugs && activeSlugs.length > 0) {
        return NextResponse.redirect(new URL(`/inst/${activeSlugs[0]}/dashboard`, request.url))
      }
      return NextResponse.redirect(new URL('/inst/onboarding', request.url))
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Institution Gating & Tenant Validation
  if (isInstitutionRoute) {
    if (userRole !== 'institution_member' && userRole !== 'admin') {
      if (userRole === 'faculty') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // SPECIAL CASE: Redirect /inst/dashboard routing hub to dynamic /inst/[slug]/dashboard or /inst/onboarding
    if (pathname === '/inst/dashboard') {
      const { data: memberships } = await supabase
        .from('institution_members')
        .select('institution_id, institutions(slug)')
        .eq('profile_id', session.user.id)

      const activeSlugs = memberships
        ?.map((m: { institutions: { slug: string } | null }) => m.institutions?.slug)
        .filter(Boolean) as string[]

      if (activeSlugs && activeSlugs.length > 0) {
        return NextResponse.redirect(new URL(`/inst/${activeSlugs[0]}/dashboard`, request.url))
      }
      return NextResponse.redirect(new URL('/inst/onboarding', request.url))
    }

    // Tenant slug membership validation
    const instMatch = pathname.match(/^\/inst\/([^/]+)/)
    const slug = instMatch ? instMatch[1] : null
    const reservedSlugs = ['dashboard', 'onboarding', 'create']

    if (slug && !reservedSlugs.includes(slug)) {
      // 1. Fetch institution ID matching this slug
      const { data } = await supabase
        .from('institutions')
        .select('id')
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle()

      const instData = data as { id: string } | null

      if (!instData) {
        // Institution does not exist, redirect to onboarding / selection hub
        return NextResponse.redirect(new URL('/inst/onboarding', request.url))
      }

      // 2. Gate membership (Admins bypass validation lookups)
      if (userRole !== 'admin') {
        const { data: membership } = await supabase
          .from('institution_members')
          .select('id')
          .eq('institution_id', instData.id)
          .eq('profile_id', session.user.id)
          .maybeSingle()

        if (!membership) {
          // Recruiter does not belong to this institution. Query all memberships for redirects:
          const { data: memberships } = await supabase
            .from('institution_members')
            .select('institution_id, institutions(slug)')
            .eq('profile_id', session.user.id)

          const activeSlugs = memberships
            ?.map((m: { institutions: { slug: string } | null }) => m.institutions?.slug)
            .filter(Boolean) as string[]

          if (activeSlugs && activeSlugs.length > 0) {
            return NextResponse.redirect(new URL(`/inst/${activeSlugs[0]}/dashboard`, request.url))
          }
          // No memberships found, redirect to onboarding
          return NextResponse.redirect(new URL('/inst/onboarding', request.url))
        }
      }
    }
  }

  // Admin Gating
  if (isAdminRoute && userRole !== 'admin') {
    if (userRole === 'faculty') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if (userRole === 'institution_member') {
      const { data: memberships } = await supabase
        .from('institution_members')
        .select('institution_id, institutions(slug)')
        .eq('profile_id', session.user.id)

      const activeSlugs = memberships
        ?.map((m: { institutions: { slug: string } | null }) => m.institutions?.slug)
        .filter(Boolean) as string[]

      if (activeSlugs && activeSlugs.length > 0) {
        return NextResponse.redirect(new URL(`/inst/${activeSlugs[0]}/dashboard`, request.url))
      }
      return NextResponse.redirect(new URL('/inst/onboarding', request.url))
    }
    
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

// Config matching: static assets, images, webhooks (which shouldn't pass through RLS-middleware cookies checks)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (Stripe webhook endpoint)
     * - Feel free to include list of assets like svg, png, jpg if needed
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
