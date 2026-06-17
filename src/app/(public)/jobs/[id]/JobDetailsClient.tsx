'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import {
  MapPin,
  Building2,
  Calendar,
  Share2,
  Bookmark,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  CheckCircle
} from 'lucide-react'
import { submitApplicationAction } from '@/features/applications/actions'
import { toggleSaveJobAction } from '@/features/jobs/actions'

interface JobInstitution {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string
  website_url: string
  country: string
  state: string
  city: string
}

interface Job {
  id: string
  institution_id: string
  title: string
  subject_area: string
  department: string
  location: string
  work_mode: 'on-site' | 'hybrid' | 'remote'
  employment_type: 'full-time' | 'part-time' | 'contract' | 'adjunct' | 'temporary'
  salary_range_min: number
  salary_range_max: number
  salary_currency: string
  vacancies: number
  required_qualification: string
  preferred_qualification: string
  description: string
  requirements: string
  application_deadline: string
  created_at: string
  institution: JobInstitution
}

interface RelatedJob {
  id: string
  title: string
  employment_type: string
  location: string
}

interface JobDetailsClientProps {
  job: Job | undefined
  userRole: string | null
  resumeFilename: string | null
  relatedJobs: RelatedJob[]
  initialBookmarked: boolean
}

// Job application schema
const applySchema = z.object({
  coverLetter: z.string().min(5, { message: 'Cover letter must be at least 5 characters.' }),
})

type ApplyFormValues = z.infer<typeof applySchema>

export function JobDetailsClient({
  job,
  userRole,
  resumeFilename,
  relatedJobs,
  initialBookmarked
}: JobDetailsClientProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isCopied, setIsCopied] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      coverLetter: '',
    }
  })

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 w-full">
        <ErrorState
          title="Job Vacancy Not Found"
          message="The faculty position you are looking for does not exist, or has been filled."
          showBackButton
          backButtonLink="/jobs"
          backButtonText="Back to Jobs Board"
        />
      </div>
    )
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleBookmarkToggle = async () => {
    if (!userRole) {
      router.push(`/auth/login?next=/jobs/${job.id}`)
      return
    }
    if (userRole !== 'faculty') {
      alert('Only faculty profiles can bookmark positions.')
      return
    }
    try {
      const res = await toggleSaveJobAction(job.id)
      if (res.success && res.data) {
        setIsBookmarked(res.data.saved)
      } else if (!res.success) {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenDialogClick = () => {
    if (!userRole) {
      router.push(`/auth/login?next=/jobs/${job.id}`)
      return
    }
    if (userRole !== 'faculty') {
      alert('Only faculty candidates can apply to job vacancies.')
      return
    }
    setOpenDialog(true)
  }

  const onApplySubmit = async (data: ApplyFormValues) => {
    setIsApplying(true)
    setErrorMessage(null)
    try {
      const res = await submitApplicationAction({
        jobId: job.id,
        coverLetter: data.coverLetter,
      })
      if (res.success) {
        setApplySuccess(true)
        reset()
      } else {
        setErrorMessage(res.error || 'Failed to submit application.')
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.')
    } finally {
      setIsApplying(false)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setApplySuccess(false)
    setErrorMessage(null)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Sticky Quick Action Bar - Desktop */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/60 hidden md:block shadow-xs">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center font-bold text-primary text-xs shrink-0 ring-1 ring-primary/5">
              {job.institution.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{job.title}</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {job.institution.name} • {job.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              title="Copy share link"
              className="rounded-xl relative hover:bg-muted"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              {isCopied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleBookmarkToggle}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
              className="rounded-xl hover:bg-muted"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </Button>

            <Button onClick={handleOpenDialogClick} className="px-6 rounded-xl font-bold ml-2">
              Apply Now
            </Button>
          </div>
        </div>
      </div>

      {/* Main Details Viewport */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
        <div className="grid lg:grid-cols-4 gap-12 items-start">
          
          {/* Left Column: Job Info */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Header info - visible on all screens */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Link href="/jobs" className="hover:underline hover:text-foreground">Jobs Board</Link>
                <span>/</span>
                <span className="text-foreground">{job.subject_area}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary/70 shrink-0" />
                  {job.institution.name}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                  {job.location}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                  Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="text-[10px] uppercase font-semibold border-border/80 text-muted-foreground">
                  {job.subject_area}
                </Badge>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold bg-muted/60 text-muted-foreground border border-border/30">
                  {job.employment_type}
                </Badge>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold bg-primary/10 text-primary hover:bg-primary/15 border-transparent">
                  {job.work_mode}
                </Badge>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold bg-secondary text-secondary-foreground border border-border/30">
                  {job.salary_currency} {job.salary_range_min.toLocaleString()} - {job.salary_range_max.toLocaleString()}
                </Badge>
              </div>
            </div>

            {/* Main Description */}
            <Card className="border border-border/70 bg-card p-6 md:p-8 rounded-2xl space-y-8 shadow-xs">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Position Overview</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line font-medium">
                  {job.description}
                </p>
              </section>
              
              <section className="space-y-4 pt-6 border-t border-border/60">
                <h2 className="text-xl font-bold text-foreground">Qualifications Required</h2>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">{job.required_qualification}</p>
                </div>
              </section>

              <section className="space-y-4 pt-6 border-t border-border/60">
                <h2 className="text-xl font-bold text-foreground">Preferred Qualifications</h2>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">{job.preferred_qualification}</p>
                </div>
              </section>

              <section className="space-y-4 pt-6 border-t border-border/60">
                <h2 className="text-xl font-bold text-foreground">Application Requirements</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line font-medium">
                  {job.requirements}
                </p>
              </section>
            </Card>
            
            {/* Action Card Bottom */}
            <Card className="border border-border/60 bg-muted/40 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-bold text-foreground">Ready to shape the future?</h3>
                <p className="text-muted-foreground text-xs font-medium">
                  Applications for this position close on {new Date(job.application_deadline).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto justify-center">
                <Button onClick={handleOpenDialogClick} className="font-bold px-8 rounded-xl shadow-xs w-full sm:w-auto">
                  Apply Now
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Sidebar: Institution Details & Related Jobs */}
          <aside className="space-y-8 sticky top-24">
            
            {/* Institution Card */}
            <Card className="border border-border/70 bg-card/65 backdrop-blur-xs p-6 rounded-2xl space-y-6 shadow-xs">
              <h3 className="text-base font-bold text-foreground">About the Institution</h3>
              
              <div className="space-y-5">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-foreground">{job.institution.city}, {job.institution.state}</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-border/60 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {job.institution.description}
                </p>
                <a
                  href={job.institution.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  Visit site <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </Card>

            {/* Related openings */}
            {relatedJobs.length > 0 && (
              <Card className="border border-border/70 bg-card/65 backdrop-blur-xs p-6 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Other Openings</h3>
                <div className="space-y-4">
                  {relatedJobs.map((rj) => (
                    <Link key={rj.id} href={`/jobs/${rj.id}`} className="block group space-y-1">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {rj.title}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {rj.employment_type} • {rj.location}
                      </p>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Safety report listing */}
            <div className="px-2 space-y-2 text-muted-foreground">
              <button className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-destructive transition-colors">
                <ShieldAlert className="h-3.5 w-3.5" /> Report listing
              </button>
              <p className="text-[10px]">Posted recently • Job ID: {job.id}</p>
            </div>

          </aside>
          
        </div>
      </main>
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Apply to Position</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your academic credentials to <span className="font-semibold">{job.institution.name}</span>.
            </DialogDescription>
          </DialogHeader>

          {applySuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Application Submitted</h3>
              <p className="text-muted-foreground text-xs max-w-sm leading-relaxed">
                Your credentials and cover letter have been submitted to the university search committee. You can track this application inside your candidate dashboard.
              </p>
              <DialogClose render={<Button onClick={handleCloseDialog} className="mt-4" />}>
                Done
              </DialogClose>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-5 py-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Academic Resume</label>
                {resumeFilename ? (
                  <div className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-semibold text-foreground truncate">{resumeFilename}</p>
                      <p className="text-[10px] text-muted-foreground">Uploaded in profile</p>
                    </div>
                    <Link href="/profile" className="text-xs text-primary font-bold hover:underline shrink-0">
                      Edit Resume
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex flex-col gap-2">
                    <p className="text-xs font-semibold">No resume found in your profile.</p>
                    <p className="text-[10px]">Please upload a resume in your profile builder first before applying.</p>
                    <Link href="/profile" className="text-xs font-bold underline">
                      Go to Profile Builder →
                    </Link>
                  </div>
                )}
              </div>

              {resumeFilename && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Cover Letter / Statement of Interest</label>
                    <Textarea
                      placeholder="Detail your research alignment, teaching history, and interest in this department..."
                      rows={6}
                      {...register('coverLetter')}
                      className={errors.coverLetter ? 'border-destructive focus-visible:ring-destructive/20 text-xs' : 'text-xs'}
                    />
                    {errors.coverLetter && (
                      <p className="text-xs text-destructive">{errors.coverLetter.message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Must be at least 5 characters. Be concise and reference key publication records.
                    </p>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-destructive font-semibold">{errorMessage}</p>
                  )}

                  <DialogFooter className="pt-2">
                    <DialogClose render={<Button variant="outline" onClick={handleCloseDialog} />}>
                      Cancel
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isApplying}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg gap-2"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
