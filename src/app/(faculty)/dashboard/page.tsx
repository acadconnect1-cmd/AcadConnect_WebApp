import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Bookmark,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  AlertCircle
} from 'lucide-react'

export const metadata = {
  title: 'Candidate Dashboard | AcadConnect',
  description: 'Track your faculty application pipeline, bookmarked jobs, and profile completions.',
}

export default async function CandidateDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id

  // 1. Fetch user profiles (with self-healing if missing)
  let { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()) as any

  if (!profile) {
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
      .select('*')
      .single()

    if (!insertError && newProfile) {
      profile = newProfile
    } else if (insertError) {
      console.error('Failed to create missing base profile on dashboard. Details:', {
        message: (insertError as any)?.message,
        code: (insertError as any)?.code,
        details: (insertError as any)?.details,
        hint: (insertError as any)?.hint,
      })
    }
  }

  let { data: facultyProfile } = (await supabase
    .from('faculty_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()) as any

  if (!facultyProfile && profile) {
    const { data: newFacultyProfile, error: insertError } = await (supabase
      .from('faculty_profiles') as any)
      .insert({ id: userId })
      .select('*')
      .single()

    if (!insertError && newFacultyProfile) {
      facultyProfile = newFacultyProfile
    } else if (insertError) {
      console.error('Failed to create missing faculty profile on dashboard. Details:', {
        message: (insertError as any)?.message,
        code: (insertError as any)?.code,
        details: (insertError as any)?.details,
        hint: (insertError as any)?.hint,
      })
    }
  }

  // 2. Fetch Metrics counts
  const { count: appCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('faculty_id', userId)
    .is('deleted_at', null)

  const { count: interviewCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('faculty_id', userId)
    .eq('status', 'shortlisted')
    .is('deleted_at', null)

  const { count: savedCount } = await supabase
    .from('saved_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('faculty_id', userId)

  const { count: notificationCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null)

  // 3. Fetch recent applications
  const { data: recentApps } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      jobs (
        title,
        department,
        institutions (
          name,
          logo_url
        )
      )
    `)
    .eq('faculty_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(3)

  // 4. Fetch recommended jobs based on discipline
  let recommendedQuery = supabase
    .from('jobs')
    .select(`
      id,
      title,
      location,
      salary_currency,
      salary_range_min,
      salary_range_max,
      employment_type,
      work_mode,
      institutions (
        name
      )
    `)
    .eq('status', 'published')
    .is('deleted_at', null)

  if (facultyProfile?.major_discipline) {
    recommendedQuery = recommendedQuery.eq('subject_area', facultyProfile.major_discipline)
  }

  const { data: recommendedJobs } = await recommendedQuery.limit(3)
  
  let jobsList = recommendedJobs || []
  if (jobsList.length === 0) {
    // Fallback if no matching discipline or zero matches
    const { data: fallbackJobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        location,
        salary_currency,
        salary_range_min,
        salary_range_max,
        employment_type,
        work_mode,
        institutions (
          name
        )
      `)
      .eq('status', 'published')
      .is('deleted_at', null)
      .limit(3)
    jobsList = fallbackJobs || []
  }

  const completionRate = facultyProfile?.profile_completion_percentage ?? 0
  const isProfileIncomplete = completionRate < 100

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {profile?.first_name || 'Educator'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here is an overview of your active academic recruitment pipeline.
          </p>
        </div>
        
        <Badge variant="outline" className="w-fit bg-primary/5 border-primary/20 text-primary py-1 px-3 text-xs rounded-full">
          Faculty Candidate Portal
        </Badge>
      </div>

      {/* Profile Completion Warning */}
      {isProfileIncomplete && (
        <Card className="border border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3 items-start md:items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                Your profile is only {completionRate}% complete
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-0.5">
                Complete your publication records, links, and upload a verified CV to improve visibility to search committees.
              </p>
            </div>
          </div>
          <Button render={<Link href="/profile" />} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
            Complete Profile
          </Button>
        </Card>
      )}

      {/* Analytical Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Applications</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{appCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shortlisted</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{interviewCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-500">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bookmarked</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{savedCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unread Alerts</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{notificationCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Applications vs Recommended matches */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Recent Applications</h2>
            <Button variant="link" render={<Link href="/applications" />} className="text-primary text-xs gap-1 group">
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {recentApps && recentApps.length > 0 ? (
              recentApps.map((app: any) => (
                <Card key={app.id} className="border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs p-5 rounded-2xl transition-all group flex items-center justify-between gap-4">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-bold text-primary text-xs shrink-0 border border-border">
                      {app.jobs?.institutions?.name?.substring(0, 2).toUpperCase() || 'UN'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        <Link href={`/applications/${app.id}`}>{app.jobs?.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {app.jobs?.institutions?.name} • {app.jobs?.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Applied on</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Badge variant="secondary" className="capitalize text-[10px] font-bold py-1 px-2.5">
                      {app.status}
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border border-dashed border-border bg-card/40 p-8 rounded-2xl text-center">
                <CardContent className="p-0 py-4 space-y-3">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No active applications</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    You haven&apos;t applied to any roles yet. Explore open academic vacancies on our job board.
                  </p>
                  <Button render={<Link href="/jobs" />} size="sm" className="mt-2">
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Recommended Job matches */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary shrink-0" /> Job Matches
            </h2>
            <Button variant="link" render={<Link href="/jobs" />} className="text-primary text-xs gap-1 group">
              Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {jobsList.map((job: any) => (
              <Card key={job.id} className="border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs p-5 rounded-2xl transition-all group flex flex-col justify-between h-full">
                <CardHeader className="p-0">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded w-fit">
                    {job.work_mode}
                  </span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mt-2 line-clamp-1">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.institutions?.name}
                  </p>
                </CardHeader>
                <CardContent className="p-0 mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{job.location}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {job.salary_currency} {Math.round(job.salary_range_max / 1000)}k
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
