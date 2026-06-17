'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { removeSavedJobAction } from '@/features/jobs/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  MapPin,
  Building2,
  BookmarkX,
  GraduationCap,
  Loader2
} from 'lucide-react'

interface SavedJobItem {
  id: string
  job_id: string
  created_at: string
  jobs: {
    id: string
    title: string
    location: string
    salary_currency: string
    salary_range_min: number
    salary_range_max: number
    employment_type: string
    work_mode: string
    department: string
    institutions: {
      name: string
    }
  }
}

interface SavedJobsClientProps {
  initialSavedJobs: SavedJobItem[]
}

export function SavedJobsClient({ initialSavedJobs }: SavedJobsClientProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>(initialSavedJobs)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRemove = async (jobId: string) => {
    setRemovingId(jobId)
    setError(null)

    const res = await removeSavedJobAction(jobId)
    setRemovingId(null)

    if (res.success) {
      setSavedJobs((prev) => prev.filter((j) => j.job_id !== jobId))
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Saved Jobs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage your bookmarked academic positions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {savedJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {savedJobs.map((item) => {
              const job = item.jobs
              const isRemoving = removingId === job.id

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-border/80 bg-card hover:border-primary/45 transition-all duration-300 group flex flex-col justify-between h-full rounded-2xl shadow-xs">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded w-fit block">
                            {job.work_mode}
                          </span>
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-2">
                            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                            {job.institutions?.name} • {job.department}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                      <div className="space-y-2 mb-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                          <span>{job.employment_type}</span>
                        </div>
                        <div className="text-sm font-extrabold text-foreground mt-2">
                          {job.salary_currency} {job.salary_range_min.toLocaleString()} - {job.salary_range_max.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                        <Button
                          render={<Link href={`/jobs/${job.id}`} />}
                          className="flex-1 justify-center rounded-xl font-semibold text-xs py-2"
                        >
                          View Details
                        </Button>
                        
                        <Button
                          variant="outline"
                          disabled={isRemoving}
                          onClick={() => handleRemove(job.id)}
                          className="px-3 rounded-xl border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1.5"
                          title="Remove bookmark"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BookmarkX className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline text-xs">Remove</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12"
          >
            <EmptyState
              title="No Bookmarked Vacancies"
              description="Keep track of academic vacancies that catch your interest by bookmarking them. They will appear here for easy access."
              icon={GraduationCap}
              actionText="Browse Job Board"
              actionLink="/jobs"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
