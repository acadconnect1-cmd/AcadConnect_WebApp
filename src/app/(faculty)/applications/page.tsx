import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  MapPin,
  Calendar,
  GraduationCap
} from 'lucide-react'

export const metadata = {
  title: 'My Applications | AcadConnect',
  description: 'Monitor the status of your submitted academic job applications.',
}

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }
  const userId = session.user.id

  // Query database for user's applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      jobs (
        id,
        title,
        department,
        location,
        employment_type,
        institutions (
          name,
          logo_url
        )
      )
    `)
    .eq('faculty_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          My Applications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor active search committee reviews, timelines, and screening states.
        </p>
      </div>

      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const job = app.jobs
            const inst = job?.institutions
            
            return (
              <Card key={app.id} className="border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs p-6 rounded-2xl transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-center min-w-0">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-bold text-primary text-sm shrink-0 border border-border">
                    {inst?.name?.substring(0, 2).toUpperCase() || 'UN'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      <Link href={`/applications/${app.id}`}>{job?.title}</Link>
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                      <span>{inst?.name}</span>
                      <span className="inline-block w-1 h-1 rounded-full bg-border" />
                      <span>{job?.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-t-0 border-border/60 pt-4 md:pt-0">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                      <span>{job?.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                      <span>{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto mt-2 sm:mt-0">
                    <Badge variant="secondary" className="capitalize text-[10px] font-bold py-1 px-3">
                      {app.status}
                    </Badge>
                    
                    <Button render={<Link href={`/applications/${app.id}`} />} className="gap-1 rounded-xl font-semibold shrink-0">
                      View details
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="py-8">
          <EmptyState
            title="No Applications Found"
            description="You haven't submitted credentials to any faculty openings yet. Head over to our jobs board to begin your search."
            icon={GraduationCap}
            actionText="Browse Job Board"
            actionLink="/jobs"
          />
        </div>
      )}
    </div>
  )
}
