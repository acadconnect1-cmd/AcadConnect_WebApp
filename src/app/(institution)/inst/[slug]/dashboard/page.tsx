import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Users,
  ArrowRight,
  Plus,
  ArrowUpRight,
  UserCheck2,
  Inbox
} from 'lucide-react'

interface RecruiterDashboardProps {
  params: Promise<{ slug: string }>
}

export default async function RecruiterDashboard({ params }: RecruiterDashboardProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

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

  // 2. Fetch all jobs for this institution
  const { data: jobs } = (await supabase
    .from('jobs')
    .select('*')
    .eq('institution_id', inst.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })) as any

  const jobsList = jobs || []
  const activeJobs = jobsList.filter((j: any) => j.status === 'published')
  const jobIds = jobsList.map((j: any) => j.id)

  // 3. Fetch applications for these jobs
  let apps: any[] = []
  if (jobIds.length > 0) {
    const { data: appsData } = (await supabase
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        faculty_profiles (
          profiles (
            first_name,
            last_name,
            email
          )
        ),
        jobs (
          id,
          title,
          department
        )
      `)
      .in('job_id', jobIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)) as any
    apps = appsData || []
  }

  // Fetch total applications count
  let totalAppsCount = 0
  let shortlistedAppsCount = 0
  if (jobIds.length > 0) {
    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds)
      .is('deleted_at', null)
    totalAppsCount = count || 0

    const { count: shortlisted } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds)
      .eq('status', 'shortlisted')
      .is('deleted_at', null)
    shortlistedAppsCount = shortlisted || 0
  }



  return (
    <div className="space-y-8 pb-12">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
            {"Manage your institution's academic postings and review recent candidates."}
          </p>
        </div>
        <Button render={<Link href={`/inst/${slug}/jobs/new`} />} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shrink-0 gap-1.5 shadow-md shadow-primary/5 rounded-xl">
          <Plus className="h-4 w-4" /> Post a Vacancy
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Listings</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{activeJobs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Applicants</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{totalAppsCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500">
              <UserCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shortlisted</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{shortlistedAppsCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Applications & Active Postings */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Recent Applications</h2>
          </div>

          <div className="space-y-4">
            {apps.length > 0 ? (
              apps.map((app: any) => {
                const profiles = app.faculty_profiles?.profiles as any
                const name = profiles ? `${profiles.first_name} ${profiles.last_name}` : 'Academic Candidate'
                const jobTitle = app.jobs?.title || 'Academic Position'

                return (
                  <Card key={app.id} className="border border-border/80 bg-card hover:border-primary/40 p-5 rounded-2xl transition-all flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Applied for: {jobTitle}
                      </p>
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        Submitted on {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary" className="capitalize text-[10px] font-bold py-0.5 px-2">
                        {app.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        render={<Link href={`/inst/${slug}/jobs/${app.jobs?.id}/applicants`} />}
                        className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 border border-border"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="border border-dashed border-border/85 bg-muted/20 py-12 text-center rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <Inbox className="h-8 w-8 text-muted-foreground/60 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">No applications received yet</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-[280px]">
                    Once educators submit credentials for your active openings, they will show up here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Active Jobs Feed */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Active Postings</h2>
            <Button variant="link" render={<Link href={`/inst/${slug}/jobs`} />} className="text-primary text-xs gap-1 group">
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {activeJobs.length > 0 ? (
              activeJobs.slice(0, 3).map((job: any) => (
                <Card key={job.id} className="border border-border/80 bg-card p-5 rounded-2xl hover:border-primary/40 transition-all">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {job.department}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {job.employment_type}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/inst/${slug}/jobs/${job.id}/applicants`} />}
                      className="text-xs h-7 rounded-lg"
                    >
                      Screen Candidates
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border border-dashed border-border/85 bg-muted/20 py-12 text-center rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <Briefcase className="h-8 w-8 text-muted-foreground/60 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">No active postings</p>
                  <Button
                    variant="link"
                    render={<Link href={`/inst/${slug}/jobs/new`} />}
                    className="text-xs text-primary mt-1"
                  >
                    Post your first vacancy
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
