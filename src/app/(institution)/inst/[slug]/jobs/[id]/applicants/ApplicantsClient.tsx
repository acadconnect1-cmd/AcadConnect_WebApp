'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { updateApplicationStatusAction } from '@/features/applications/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  ArrowLeft,
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  Inbox,
  AlertCircle
} from 'lucide-react'

interface ApplicationItem {
  id: string
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  resume_url: string
  cover_letter: string | null
  created_at: string
  faculty_profiles: {
    id: string
    highest_degree: string | null
    major_discipline: string | null
    current_institution: string | null
    profiles: {
      first_name: string
      last_name: string
      email: string
    }
  }
  application_status_history: Array<{
    id: string
    old_status: string
    new_status: string
    comments: string | null
    created_at: string
    changed_by: {
      first_name: string
      last_name: string
    } | null
  }>
}

interface ApplicantsClientProps {
  job: {
    id: string
    title: string
    department: string
  }
  initialApplications: ApplicationItem[]
  slug: string
}

export function ApplicantsClient({ job, initialApplications, slug }: ApplicantsClientProps) {
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications)
  const [activeApp, setActiveApp] = useState<ApplicationItem | null>(null)
  
  // Status update form states
  const [newStatus, setNewStatus] = useState<'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'>('applied')
  const [comments, setComments] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSelectApplicant = (app: ApplicationItem) => {
    setActiveApp(app)
    setNewStatus(app.status)
    setComments('')
    setMessage(null)
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeApp) return

    setIsUpdating(true)
    setMessage(null)

    const res = await updateApplicationStatusAction({
      applicationId: activeApp.id,
      status: newStatus,
      comments,
    })

    setIsUpdating(false)

    if (res.success) {
      setMessage({ type: 'success', text: `Applicant status successfully updated to ${newStatus}!` })
      
      // Update local state list
      const updatedList = applications.map((item) => {
        if (item.id === activeApp.id) {
          const updatedHistory = [
            {
              id: Math.random().toString(),
              old_status: item.status,
              new_status: newStatus,
              comments: comments || null,
              created_at: new Date().toISOString(),
              changed_by: {
                first_name: 'You',
                last_name: '(Recruiter)'
              }
            },
            ...(item.application_status_history || [])
          ]
          return {
            ...item,
            status: newStatus,
            application_status_history: updatedHistory
          }
        }
        return item
      })

      setApplications(updatedList)

      // Sync active app view
      const updatedActive = updatedList.find(i => i.id === activeApp.id) || null
      setActiveApp(updatedActive)
      setComments('')

      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Header section */}
      <div className="space-y-4 border-b border-border/80 pb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/inst/${slug}/jobs`} />}
          className="text-muted-foreground hover:text-foreground gap-1.5 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Vacancies
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Applicants: {job.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-1">
            {job.department}
          </p>
        </div>
      </div>

      {/* Main Grid: Applicants Feed & Detail Drawer */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Candidates list */}
        <div className="lg:col-span-2 space-y-4">
          {applications.length > 0 ? (
            applications.map((app) => {
              const profiles = app.faculty_profiles?.profiles as any
              const name = profiles ? `${profiles.first_name} ${profiles.last_name}` : 'Educator Candidate'
              const degree = app.faculty_profiles?.highest_degree || 'Unknown Degree'
              const discipline = app.faculty_profiles?.major_discipline || 'General Discipline'
              const dateStr = new Date(app.created_at).toLocaleDateString()

              return (
                <Card 
                  key={app.id} 
                  className={`border hover:border-primary/45 p-5 rounded-2xl transition-all flex items-center justify-between gap-4 cursor-pointer select-none ${
                    activeApp?.id === app.id ? 'border-primary bg-slate-50/50 dark:bg-zinc-950/20' : 'border-border/80 bg-card'
                  }`}
                  onClick={() => handleSelectApplicant(app)}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="secondary" className="capitalize text-[8px] font-bold py-0.5 px-2">
                        {app.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Applied {dateStr}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {name}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground font-semibold mt-1 truncate">
                      {degree} in {discipline}
                    </p>
                    
                    {app.faculty_profiles?.current_institution && (
                      <p className="text-[10px] text-muted-foreground/85 font-medium mt-0.5">
                        Current: {app.faculty_profiles.current_institution}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-xs gap-1 hover:bg-muted font-bold"
                  >
                    Review <ChevronRight className="h-4 w-4" />
                  </Button>
                </Card>
              )
            })
          ) : (
            <div className="py-12 border border-dashed border-border/80 bg-muted/10 rounded-2xl">
              <EmptyState
                title="No candidates have applied yet"
                description="This vacancy is active. Once academic candidates submit their credentials, they will be listed here."
              />
            </div>
          )}
        </div>

        {/* Right Column: Slide-Over Applicant Detail Drawer */}
        <AnimatePresence>
          {activeApp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <Card className="border border-border bg-card rounded-2xl shadow-md overflow-hidden sticky top-6">
                {/* Header panel */}
                <div className="flex justify-between items-start border-b border-border/80 p-5 bg-muted/30">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Candidate Profile</p>
                    <h3 className="text-sm font-extrabold text-foreground truncate mt-1">
                      {activeApp.faculty_profiles?.profiles?.first_name} {activeApp.faculty_profiles?.profiles?.last_name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {activeApp.faculty_profiles?.profiles?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveApp(null)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Body Details */}
                <CardContent className="p-5 space-y-6">
                  {/* Message Alert Banner */}
                  {message && (
                    <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs leading-relaxed ${
                      message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/30'
                    }`}>
                      {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />}
                      <span>{message.text}</span>
                    </div>
                  )}

                  {/* Candidate metadata info */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Academic Credentials</h4>
                    <div className="bg-muted/30 border border-border/40 p-3 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        Degree: <span className="font-normal text-muted-foreground">{activeApp.faculty_profiles?.highest_degree || 'N/A'}</span>
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        Discipline: <span className="font-normal text-muted-foreground">{activeApp.faculty_profiles?.major_discipline || 'N/A'}</span>
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        Institution: <span className="font-normal text-muted-foreground">{activeApp.faculty_profiles?.current_institution || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Submitted Cover Letter */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Cover Letter</h4>
                    <div className="bg-slate-50/50 dark:bg-zinc-950/20 border border-border/60 p-3.5 rounded-xl max-h-[160px] overflow-y-auto text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {activeApp.cover_letter || 'No cover letter was submitted.'}
                    </div>
                  </div>

                  {/* Submitted CV link */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">CV Attachment</h4>
                    <div className="flex items-center justify-between p-3 border border-border/80 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-[10px] font-semibold text-foreground truncate">
                          {activeApp.resume_url.split('/').pop() || 'Submitted_CV.pdf'}
                        </span>
                      </div>
                      <Button
                        render={
                          <a
                            href={activeApp.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-7 rounded-lg shrink-0"
                      >
                        Download CV
                      </Button>
                    </div>
                  </div>

                  {/* Status update form */}
                  <form onSubmit={handleStatusSubmit} className="space-y-3 pt-4 border-t border-border/60">
                    <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Screening Decision</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <select
                          value={newStatus}
                          onChange={(e: any) => setNewStatus(e.target.value)}
                          className="w-full h-9 px-2 bg-background border border-input rounded-lg text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="applied">Applied</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlist (Interview)</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <Textarea
                          placeholder="Add screening logs, decision details, or interview dates..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={2.5}
                          className="text-xs rounded-lg resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="col-span-2 h-9 text-xs bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                        Apply Decision
                      </Button>
                    </div>
                  </form>

                  {/* Status Log history */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" /> Status Trail Logs
                    </h4>
                    <div className="relative border-l border-border pl-3 space-y-4 ml-1.5 max-h-[160px] overflow-y-auto py-1">
                      {activeApp.application_status_history && activeApp.application_status_history.length > 0 ? (
                        activeApp.application_status_history.map((log) => (
                          <div key={log.id} className="relative space-y-0.5">
                            <span className="absolute -left-[16px] top-1 flex h-1.5 w-1.5 rounded-full bg-primary" />
                            <div className="flex justify-between items-center gap-2">
                              <Badge variant="secondary" className="capitalize text-[7px] font-bold py-0.2 px-1">
                                {log.new_status}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground font-medium">
                                {new Date(log.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {log.comments && (
                              <p className="text-[10px] text-muted-foreground/90 bg-muted/40 p-1.5 rounded-lg border border-border/30 mt-1">
                                {log.comments}
                              </p>
                            )}
                            <p className="text-[8px] text-muted-foreground font-medium mt-0.5">
                              By: {log.changed_by?.first_name || 'Recruiter'} {log.changed_by?.last_name || ''}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-muted-foreground font-semibold">No status changes logged yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
