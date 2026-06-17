import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  MapPin,
  Building2,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export const metadata = {
  title: 'Application Details | AcadConnect',
  description: 'View status history and communication log for your academic application.',
}

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const resolvedParams = await params
  const appId = resolvedParams.id

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id

  // 1. Query application details
  const { data: app } = (await supabase
    .from('applications')
    .select(`
      id,
      status,
      resume_url,
      cover_letter,
      created_at,
      jobs (
        id,
        title,
        department,
        location,
        salary_currency,
        salary_range_min,
        salary_range_max,
        employment_type,
        institutions (
          name,
          logo_url
        )
      )
    `)
    .eq('id', appId)
    .eq('faculty_id', userId)
    .is('deleted_at', null)
    .maybeSingle()) as any

  if (!app) {
    return (
      <div className="py-12">
        <ErrorState
          title="Application Not Found"
          message="The application you are trying to view does not exist, or you do not have permission to view it."
          showBackButton
          backButtonLink="/applications"
          backButtonText="Back to My Applications"
        />
      </div>
    )
  }

  // 2. Query application status history
  const { data: history } = await supabase
    .from('application_status_history')
    .select(`
      id,
      old_status,
      new_status,
      comments,
      created_at,
      changed_by (
        first_name,
        last_name
      )
    `)
    .eq('application_id', appId)
    .order('created_at', { ascending: false })

  const job = app.jobs as any
  const inst = job?.institutions as any

  // Define steps for progress trail
  const statuses = ['applied', 'reviewed', 'shortlisted', 'hired']
  const isRejected = app.status === 'rejected'
  
  // Calculate active index of steps
  const activeIdx = statuses.indexOf(app.status)

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs & Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Link href="/dashboard" className="hover:underline hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/applications" className="hover:underline hover:text-foreground">Applications</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Details</span>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border/80">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            {job?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary/70 shrink-0" />
              {inst?.name}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
              {job?.location}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
            {job?.employment_type}
          </Badge>
          <Badge variant={isRejected ? 'destructive' : 'secondary'} className="capitalize text-[10px] font-bold py-1 px-3">
            {app.status}
          </Badge>
        </div>
      </div>

      {/* Stepper Progress Timeline */}
      <Card className="border border-border/80 bg-card p-6 md:p-8 rounded-2xl shadow-xs">
        <CardContent className="p-0">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-8">
            Application Pipeline Progress
          </h2>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
            {/* Visual connector line (Desktop only) */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted hidden md:block z-0" />
            {/* Active connector fill */}
            {activeIdx >= 0 && !isRejected && (
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary hidden md:block z-0 transition-all duration-500"
                style={{
                  width: `${(activeIdx / (statuses.length - 1)) * 92}%`
                }}
              />
            )}

            {statuses.map((step, idx) => {
              const isCompleted = isRejected ? false : idx <= activeIdx
              const isActive = isRejected ? false : idx === activeIdx

              return (
                <div key={step} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 z-10 w-full relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-xs shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                        : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-bold capitalize ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* If application is rejected, render rejection notification badge */}
            {isRejected && (
              <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 z-10 w-full relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-destructive border border-destructive text-destructive-foreground shrink-0 shadow-md">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="text-left md:text-center">
                  <p className="text-xs font-bold text-destructive capitalize">Rejected</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main details contents */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Cover letter & CV info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 bg-card p-6 md:p-8 rounded-2xl shadow-xs">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Submitted Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cover Letter</h3>
                <div className="bg-muted/30 border border-border/60 p-4 rounded-xl text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {app.cover_letter || 'No cover letter was submitted with this application.'}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/60">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">CV / Resume Attachment</h3>
                <div className="flex items-center justify-between p-3 border border-border/80 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-xs font-bold text-foreground truncate">
                      {app.resume_url.split('/').pop() || 'Submitted_Resume.pdf'}
                    </span>
                  </div>
                  <Button
                    render={
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-lg shrink-0"
                  >
                    Download CV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: History logs */}
        <div className="space-y-6">
          <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary shrink-0" /> Status History
              </CardTitle>
              <CardDescription className="text-xs">
                Recruiter transitions and search committee notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative border-l border-border pl-4 space-y-6 py-2 ml-2">
                {history && history.length > 0 ? (
                  history.map((log: any) => (
                    <div key={log.id} className="relative space-y-1">
                      {/* Floating marker dot */}
                      <span className="absolute -left-[21px] top-1 flex h-2 w-2 rounded-full bg-primary" />
                      
                      <div className="flex justify-between items-center gap-2">
                        <Badge variant="secondary" className="capitalize text-[8px] font-bold py-0.5 px-2">
                          {log.new_status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {log.comments && (
                        <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40 mt-1.5 leading-relaxed">
                          {log.comments}
                        </p>
                      )}
                      
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">
                        Updated by: {log.changed_by?.first_name || 'System'} {log.changed_by?.last_name || ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-1">
                    <span className="absolute -left-[21px] top-1 flex h-2 w-2 rounded-full bg-primary" />
                    <p className="text-xs font-semibold text-foreground">Application Submitted</p>
                    <p className="text-[10px] text-muted-foreground">
                      Your application has been received. Committee screening is currently pending.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
