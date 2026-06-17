'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  GraduationCap
} from 'lucide-react'

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

interface JobsClientProps {
  initialJobs: Job[]
  initialSearch: string
  initialLocation: string
  initialInstitution: string
}

const SUBJECT_AREAS = [
  'Computer Science',
  'Engineering',
  'Physics',
  'Mathematics',
  'Biology'
]

const WORK_MODES = [
  { label: 'On-site', value: 'on-site' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Remote', value: 'remote' }
]

const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Adjunct', value: 'adjunct' }
]

const JOBS_PER_PAGE = 4

export function JobsClient({
  initialJobs,
  initialSearch,
  initialLocation,
  initialInstitution
}: JobsClientProps) {
  // Filters State
  const [search, setSearch] = useState(initialSearch)
  const [location, setLocation] = useState(initialLocation)
  const [institution, setInstitution] = useState(initialInstitution)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedModes, setSelectedModes] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [maxSalary, setMaxSalary] = useState(250000)
  
  // Sorting & Mobile Drawer State
  const [sortBy, setSortBy] = useState<'recent' | 'salary_desc' | 'salary_asc'>('recent')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearch('')
    setLocation('')
    setInstitution('')
    setSelectedSubjects([])
    setSelectedModes([])
    setSelectedTypes([])
    setMaxSalary(250000)
    setCurrentPage(1)
  }

  // Handle subject toggle
  const toggleSubject = (subj: string) => {
    setCurrentPage(1)
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    )
  }

  // Handle mode toggle
  const toggleMode = (mode: string) => {
    setCurrentPage(1)
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    )
  }

  // Handle type toggle
  const toggleType = (type: string) => {
    setCurrentPage(1)
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  // Filtered & Sorted Jobs computed property
  const filteredJobs = useMemo(() => {
    let result = [...initialJobs]

    // 1. Search Query filter (matches Title, Description, Department, requirements)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.department.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.requirements.toLowerCase().includes(q)
      )
    }

    // 2. Location filter
    if (location.trim()) {
      const loc = location.toLowerCase()
      result = result.filter(
        (job) =>
          job.location.toLowerCase().includes(loc) ||
          job.institution.city.toLowerCase().includes(loc) ||
          job.institution.state.toLowerCase().includes(loc) ||
          job.institution.country.toLowerCase().includes(loc)
      )
    }

    // 3. Institution filter
    if (institution.trim()) {
      const inst = institution.toLowerCase()
      result = result.filter((job) =>
        job.institution.name.toLowerCase().includes(inst)
      )
    }

    // 4. Subject Area filter
    if (selectedSubjects.length > 0) {
      result = result.filter((job) =>
        selectedSubjects.includes(job.subject_area)
      )
    }

    // 5. Work Mode filter
    if (selectedModes.length > 0) {
      result = result.filter((job) => selectedModes.includes(job.work_mode))
    }

    // 6. Employment Type filter
    if (selectedTypes.length > 0) {
      result = result.filter((job) =>
        selectedTypes.includes(job.employment_type)
      )
    }

    // 7. Salary slider filter
    result = result.filter((job) => job.salary_range_min <= maxSalary)

    // 8. Sorting logic
    if (sortBy === 'recent') {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (sortBy === 'salary_desc') {
      result.sort((a, b) => b.salary_range_max - a.salary_range_max)
    } else if (sortBy === 'salary_asc') {
      result.sort((a, b) => a.salary_range_min - b.salary_range_min)
    }

    return result
  }, [
    initialJobs,
    search,
    location,
    institution,
    selectedSubjects,
    selectedModes,
    selectedTypes,
    maxSalary,
    sortBy
  ])

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE))
  const paginatedJobs = useMemo(() => {
    const startIdx = (currentPage - 1) * JOBS_PER_PAGE
    return filteredJobs.slice(startIdx, startIdx + JOBS_PER_PAGE)
  }, [filteredJobs, currentPage])

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header Search Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/0 to-transparent border-b border-border/40 py-16 px-6 md:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/0.03,_transparent)]" />
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Explore <span className="text-gradient">Academic Opportunities</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Find your next teaching, research, or leadership role in premier global universities and colleges.
          </p>
          
          <div className="grid md:grid-cols-12 gap-3 bg-card/70 border border-border/70 p-2.5 rounded-2xl shadow-sm focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all duration-300 backdrop-blur-md mt-6">
            <div className="md:col-span-5 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-border/60">
              <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Job title, keywords, or department..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-transparent border-none outline-hidden text-sm focus:ring-0 text-foreground placeholder:text-muted-foreground/80"
              />
            </div>
            
            <div className="md:col-span-4 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-border/60">
              <MapPin className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
              <input
                type="text"
                placeholder="City, State, Country..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-transparent border-none outline-hidden text-sm focus:ring-0 text-foreground placeholder:text-muted-foreground/80"
              />
            </div>

            <div className="md:col-span-3 flex items-center px-3 py-2">
              <Building2 className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Institution name..."
                value={institution}
                onChange={(e) => {
                  setInstitution(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-transparent border-none outline-hidden text-sm focus:ring-0 text-foreground placeholder:text-muted-foreground/80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          
          {/* Filters Panel - Desktop */}
          <aside className="hidden lg:flex flex-col space-y-8 sticky top-24 max-h-[85vh] overflow-y-auto pr-2">
            {/* Subject Area filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground/95 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Subject Area
              </h3>
              <div className="flex flex-col gap-2.5 pl-3.5">
                {SUBJECT_AREAS.map((subj) => (
                  <label key={subj} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subj)}
                      onChange={() => toggleSubject(subj)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {subj}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode filter */}
            <div className="space-y-4 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-foreground/95 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Work Mode
              </h3>
              <div className="flex flex-col gap-2.5 pl-3.5">
                {WORK_MODES.map((mode) => (
                  <label key={mode.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedModes.includes(mode.value)}
                      onChange={() => toggleMode(mode.value)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {mode.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type filter */}
            <div className="space-y-4 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-foreground/95 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Job Type
              </h3>
              <div className="flex flex-col gap-2.5 pl-3.5">
                {EMPLOYMENT_TYPES.map((type) => (
                  <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => toggleType(type.value)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary filter slider */}
            <div className="space-y-4 pt-6 border-t border-border/60">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground/95 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Min Salary Target
                </h3>
                <span className="text-xs font-bold text-primary">${(maxSalary / 1000).toFixed(0)}k</span>
              </div>
              <input
                type="range"
                min="40000"
                max="250000"
                step="5000"
                value={maxSalary}
                onChange={(e) => {
                  setMaxSalary(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase">
                <span>$40k</span>
                <span>$250k+</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-primary transition-colors hover:no-underline font-semibold justify-start p-0 h-fit"
            >
              Reset All Filters
            </Button>
          </aside>

          {/* Main List column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header Control Row */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border/50">
              <p className="text-sm text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{filteredJobs.length}</span> positions matching your criteria
              </p>
              
              <div className="flex items-center gap-4">
                {/* Mobile Filter toggle button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 rounded-xl border-border/80"
                >
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  Filters
                </Button>
                
                <div className="flex items-center gap-2 shrink-0">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'salary_desc' | 'salary_asc')}
                    className="bg-transparent border-none text-sm font-semibold text-primary focus:ring-0 focus:outline-hidden cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="salary_desc">Salary: High to Low</option>
                    <option value="salary_asc">Salary: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List block */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {paginatedJobs.length > 0 ? (
                  paginatedJobs.map((job) => (
                    <motion.article
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-card/60 backdrop-blur-xs border border-border/70 hover:border-primary/30 p-6 rounded-2xl hover-premium group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="space-y-3.5 flex-1 w-full">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary text-sm shrink-0 shadow-xs ring-1 ring-primary/5 transition-transform group-hover:scale-105 duration-300">
                            {job.institution.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-foreground/80">{job.institution.name}</span>
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-border/80" />
                              <span>{job.location}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1 pl-0 md:pl-16">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold border-border/80 text-muted-foreground">
                            {job.subject_area}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase font-semibold bg-muted/60 text-muted-foreground hover:bg-muted border border-border/30">
                            {job.employment_type}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase font-semibold bg-primary/10 text-primary hover:bg-primary/15 border-transparent">
                            {job.work_mode}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 border-border/50 pt-4 md:pt-0 gap-4 pl-0 md:pl-0">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">Target salary</p>
                          <p className="text-sm md:text-base font-extrabold text-foreground mt-0.5">
                            {job.salary_currency} {job.salary_range_min.toLocaleString()} - {job.salary_range_max.toLocaleString()}
                          </p>
                        </div>
                        
                        <Button render={<Link href={`/jobs/${job.id}`} />} className="px-5 rounded-xl font-semibold shadow-xs group-hover:shadow-sm">
                          View details
                        </Button>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12"
                  >
                    <EmptyState
                      title="No vacancy found"
                      description="No jobs match your current search filters. Try clearing some tags or broadening your range."
                      icon={GraduationCap}
                      actionText="Reset All Filters"
                      onAction={handleResetFilters}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) setCurrentPage(currentPage - 1)
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={pageNum === currentPage}
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(pageNum)
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Mobile Filters Drawer Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Drawer Content */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-xs bg-background h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10"
            >
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                    className="rounded-xl"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Subject Area filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Subject Area
                  </h3>
                  <div className="flex flex-col gap-2.5 pl-3.5">
                    {SUBJECT_AREAS.map((subj) => (
                      <label key={subj} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subj)}
                          onChange={() => toggleSubject(subj)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm text-muted-foreground font-medium">
                          {subj}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Mode filter */}
                <div className="space-y-4 pt-6 border-t border-border/60">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Work Mode
                  </h3>
                  <div className="flex flex-col gap-2.5 pl-3.5">
                    {WORK_MODES.map((mode) => (
                      <label key={mode.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedModes.includes(mode.value)}
                          onChange={() => toggleMode(mode.value)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm text-muted-foreground font-medium">
                          {mode.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Employment Type filter */}
                <div className="space-y-4 pt-6 border-t border-border/60">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Job Type
                  </h3>
                  <div className="flex flex-col gap-2.5 pl-3.5">
                    {EMPLOYMENT_TYPES.map((type) => (
                      <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type.value)}
                          onChange={() => toggleType(type.value)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm text-muted-foreground font-medium">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Salary filter slider */}
                <div className="space-y-4 pt-6 border-t border-border/60">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Min Salary Target
                    </h3>
                    <span className="text-xs font-bold text-primary">${(maxSalary / 1000).toFixed(0)}k</span>
                  </div>
                  <input
                    type="range"
                    min="40000"
                    max="250000"
                    step="5000"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase">
                    <span>$40k</span>
                    <span>$250k+</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <Button onClick={handleResetFilters} variant="outline" className="w-full justify-center rounded-xl">
                  Reset Filters
                </Button>
                <Button onClick={() => setShowMobileFilters(false)} className="w-full justify-center rounded-xl font-semibold">
                  Apply & Close
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
