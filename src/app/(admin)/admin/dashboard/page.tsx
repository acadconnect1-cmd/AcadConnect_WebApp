import Link from 'next/link'
import { getAdminDashboardStatsAction } from '@/features/admin/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building,
  Users,
  Briefcase,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Clock,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const res = await getAdminDashboardStatsAction()

  if (!res.success) {
    return (
      <ErrorState
        title="Failed to load platform metrics"
        message={res.error}
      />
    )
  }

  const stats = res.data

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Platform Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Monitor platform metrics, process university credentials, and oversee billing plans.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Institutions Card */}
        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-500">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Institutions</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {stats.metrics.totalInstitutions}
                </span>
                {stats.metrics.pendingVerifications > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/25 dark:text-amber-500 px-2 py-0.5 rounded-full">
                    {stats.metrics.pendingVerifications} pending
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Candidates Card */}
        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faculty Profiles</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                {stats.metrics.totalCandidates}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Jobs Card */}
        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Postings</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                {stats.metrics.activeJobs}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions Card */}
        <Card className="border border-border/80 bg-card p-5 rounded-2xl shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Premium Members</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                {stats.metrics.activePremiumPlans}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Panel: 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Funnel Card */}
        <Card className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/80 p-5 bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Application Pipeline & Conversion
            </CardTitle>
            <CardDescription className="text-xs">
              System ratios of applicant activity relative to total jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Avg Applications per job */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Avg Applications / Vacancy</span>
                <span className="text-primary">{stats.funnel.applicationsPerJob} apps</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(stats.funnel.applicationsPerJob * 10, 100)}%` }}
                />
              </div>
            </div>

            {/* Shortlist rate */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Shortlist Selection Rate</span>
                <span className="text-amber-600">{stats.funnel.shortlistRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${stats.funnel.shortlistRate}%` }}
                />
              </div>
            </div>

            {/* Hire rate */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Hire Placement Rate</span>
                <span className="text-emerald-600">{stats.funnel.hireRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${stats.funnel.hireRate}%` }}
                />
              </div>
            </div>

            {/* Rejection rate */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Rejection Rate</span>
                <span className="text-red-600">{stats.funnel.rejectionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${stats.funnel.rejectionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Share Card */}
        <Card className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/80 p-5 bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Platform Demographics
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of authenticated users and institutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* User roles ratio */}
            <div>
              <div className="text-sm font-bold mb-3">User Base Distribution</div>
              <div className="flex h-4 rounded-full overflow-hidden w-full">
                <div 
                  className="bg-emerald-500 h-full flex items-center justify-center text-[9px] text-white font-extrabold"
                  style={{ width: `${stats.demographics.candidates + stats.demographics.recruiters > 0 ? (stats.demographics.candidates / (stats.demographics.candidates + stats.demographics.recruiters)) * 100 : 50}%` }}
                >
                  Faculty
                </div>
                <div 
                  className="bg-blue-500 h-full flex items-center justify-center text-[9px] text-white font-extrabold"
                  style={{ width: `${stats.demographics.candidates + stats.demographics.recruiters > 0 ? (stats.demographics.recruiters / (stats.demographics.candidates + stats.demographics.recruiters)) * 100 : 50}%` }}
                >
                  Recruiters
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" /> Candidates ({stats.demographics.candidates})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-xs inline-block" /> Recruiters ({stats.demographics.recruiters})</span>
              </div>
            </div>

            {/* Institution statuses */}
            <div>
              <div className="text-sm font-bold mb-3">Institution Profile Statuses</div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex justify-between items-center border border-border/80 rounded-xl p-3 bg-muted/10">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Approved</span>
                  <span className="text-foreground text-sm font-extrabold">{stats.institutionStatusDistribution.approved}</span>
                </div>
                <div className="flex justify-between items-center border border-border/80 rounded-xl p-3 bg-muted/10">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Pending</span>
                  <span className="text-foreground text-sm font-extrabold">{stats.institutionStatusDistribution.pending}</span>
                </div>
                <div className="flex justify-between items-center border border-border/80 rounded-xl p-3 bg-muted/10">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full" /> Suspended</span>
                  <span className="text-foreground text-sm font-extrabold">{stats.institutionStatusDistribution.suspended}</span>
                </div>
                <div className="flex justify-between items-center border border-border/80 rounded-xl p-3 bg-muted/10">
                  <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 bg-zinc-400 rounded-full" /> Rejected</span>
                  <span className="text-foreground text-sm font-extrabold">{stats.institutionStatusDistribution.rejected}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs Snip Card */}
      <Card className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/80 p-5 bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent System Activities
            </CardTitle>
            <CardDescription className="text-xs">
              Snippet of recent admin audit logs.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-bold gap-1 rounded-lg hover:bg-muted"
            render={<Link href="/admin/activities" />}
          >
            All Logs <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/80">
            {stats.recentLogs.length > 0 ? (
              stats.recentLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-muted/10">
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {log.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-primary"><ShieldCheck className="h-3.5 w-3.5" /> {log.profile?.email || 'System'}</span>
                      <span>•</span>
                      <span>Target: {log.target_entity}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No platform activity logged yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
