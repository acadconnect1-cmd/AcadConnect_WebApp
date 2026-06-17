'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Plus,
  Edit2,
  ExternalLink
} from 'lucide-react'

interface JobItem {
  id: string
  title: string
  department: string
  employment_type: string
  work_mode: string
  location: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  created_at: string
  application_deadline: string | null
  applicantCount: number
}

interface JobsClientProps {
  initialJobs: JobItem[]
  slug: string
}

export function JobsClient({ initialJobs, slug }: JobsClientProps) {
  const [jobs] = useState<JobItem[]>(initialJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all')

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Manage Vacancies
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
            Create new openings, view candidate counts, and toggle publication status.
          </p>
        </div>
        <Button render={<Link href={`/inst/${slug}/jobs/new`} />} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shrink-0 gap-1.5 shadow-md rounded-xl">
          <Plus className="h-4 w-4" /> Post a Vacancy
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-sm shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
          <Input
            placeholder="Search positions, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Status Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 border border-border/60 rounded-xl w-full md:w-auto">
          {(['all', 'published', 'draft', 'closed'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className="capitalize text-xs font-bold px-3 py-1.5 rounded-lg w-full sm:w-auto"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Vacancy list feed */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const deadlineStr = job.application_deadline
                ? new Date(job.application_deadline).toLocaleDateString()
                : 'Open Roll'

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-border/80 bg-card hover:border-primary/45 p-6 rounded-2xl hover:shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Job metadata details */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={
                          job.status === 'published' ? 'secondary' : 
                          job.status === 'draft' ? 'outline' : 'destructive'
                        } className="capitalize text-[9px] font-bold tracking-wider py-0.5 px-2">
                          {job.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          {job.employment_type} ({job.work_mode})
                        </span>
                      </div>
                      
                      <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                        {job.title}
                      </h2>
                      
                      <p className="text-xs font-semibold text-muted-foreground">
                        {job.department}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80 font-medium pt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                          {job.location}
                        </span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                          Deadline: {deadlineStr}
                        </span>
                      </div>
                    </div>

                    {/* Actions and candidates overview */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 shrink-0 border-t md:border-t-0 border-border/60 pt-4 md:pt-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <span>{job.applicantCount} applicants</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/inst/${slug}/jobs/${job.id}/edit`} />}
                          className="h-9 px-3 rounded-xl gap-1 hover:bg-muted text-xs"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/inst/${slug}/jobs/${job.id}/applicants`} />}
                          className="h-9 px-3 rounded-xl gap-1 text-xs bg-slate-50 dark:bg-zinc-900"
                        >
                          Screen Candidates <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <div className="py-12 border border-dashed border-border/80 bg-muted/10 rounded-2xl">
              <EmptyState
                title="No vacancies match filters"
                description="Try tweaking your keyword queries or status switches, or post a new vacancy from the button above."
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
