'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { createJobAction } from '@/features/jobs/actions'
import { jobFormSchema, JobFormInput } from '@/schemas/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

interface NewJobClientProps {
  institutionId: string
  institutionName: string
  slug: string
}

export function NewJobClient({ institutionId, institutionName, slug }: NewJobClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormInput>({
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: {
      institutionId,
      title: '',
      department: '',
      subjectArea: '',
      employmentType: 'full-time',
      workMode: 'on-site',
      location: '',
      salaryRangeMin: null,
      salaryRangeMax: null,
      salaryCurrency: 'USD',
      vacancies: 1,
      description: '',
      requirements: '',
      requiredQualification: '',
      preferredQualification: '',
      applicationDeadline: '',
      status: 'draft',
    },
  })

  const handlePost = async (status: 'draft' | 'published', data: JobFormInput) => {
    setIsSubmitting(true)
    setMessage(null)
    
    // Set status dynamically depending on which button was clicked
    const formData = { 
      ...data, 
      status,
      // Ensure numeric fields are numbers or null
      salaryRangeMin: (data.salaryRangeMin as any) === "" || isNaN(Number(data.salaryRangeMin)) ? null : Number(data.salaryRangeMin),
      salaryRangeMax: (data.salaryRangeMax as any) === "" || isNaN(Number(data.salaryRangeMax)) ? null : Number(data.salaryRangeMax)
    }

    const res = await createJobAction(formData as any)
    setIsSubmitting(false)

    if (res.success) {
      setMessage({ type: 'success', text: `Vacancy listing successfully saved as ${status}!` })
      setTimeout(() => {
        router.push(`/inst/${slug}/jobs`)
        router.refresh()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation and Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/inst/${slug}/jobs`} />}
          className="text-muted-foreground hover:text-foreground gap-1.5 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Vacancies
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Post Academic Position
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Publish an academic opening at {institutionName}.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
          message.type === 'success'
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400'
            : 'bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/5 dark:border-destructive/10 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main post form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Section 1: Basic Information */}
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">Basic Position Info</CardTitle>
            <CardDescription className="text-xs">Specify the listing title, department, and number of openings.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Position Title</label>
              <Input
                placeholder="e.g. Assistant Professor in Computer Science"
                {...register('title')}
                className="rounded-xl"
              />
              {errors.title && <p className="text-xs text-destructive font-semibold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Department</label>
              <Input
                placeholder="e.g. Department of Computer Science & Engineering"
                {...register('department')}
                className="rounded-xl"
              />
              {errors.department && <p className="text-xs text-destructive font-semibold">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Subject Area / Discipline</label>
              <Input
                placeholder="e.g. Computer Science"
                {...register('subjectArea')}
                className="rounded-xl"
              />
              {errors.subjectArea && <p className="text-xs text-destructive font-semibold">{errors.subjectArea.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Open Vacancies</label>
              <Input
                type="number"
                placeholder="1"
                {...register('vacancies', { valueAsNumber: true })}
                className="rounded-xl"
              />
              {errors.vacancies && <p className="text-xs text-destructive font-semibold">{errors.vacancies.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Application Deadline</label>
              <Input
                type="date"
                {...register('applicationDeadline')}
                className="rounded-xl"
              />
              {errors.applicationDeadline && <p className="text-xs text-destructive font-semibold">{errors.applicationDeadline.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Mode and Location */}
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">Location & Mode</CardTitle>
            <CardDescription className="text-xs">Specify employment type, work model, and location.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Employment Type</label>
              <select
                {...register('employmentType')}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs sm:text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="adjunct">Adjunct</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Work Mode</label>
              <select
                {...register('workMode')}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs sm:text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Location / Campus</label>
              <Input
                placeholder="e.g. Stanford, CA"
                {...register('location')}
                className="rounded-xl"
              />
              {errors.location && <p className="text-xs text-destructive font-semibold">{errors.location.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Salary Information */}
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">Compensation Range</CardTitle>
            <CardDescription className="text-xs">Specify the salary package details (optional).</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Salary Currency</label>
              <Input
                placeholder="USD"
                {...register('salaryCurrency')}
                className="rounded-xl"
              />
              {errors.salaryCurrency && <p className="text-xs text-destructive font-semibold">{errors.salaryCurrency.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Minimum Salary</label>
              <Input
                type="number"
                placeholder="e.g. 80000"
                {...register('salaryRangeMin')}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Maximum Salary</label>
              <Input
                type="number"
                placeholder="e.g. 120000"
                {...register('salaryRangeMax')}
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Position Scope & Details */}
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">Position Description & Scope</CardTitle>
            <CardDescription className="text-xs">Provide complete details regarding qualifications, responsibilities, and benefits.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Required Qualification</label>
              <Input
                placeholder="e.g. Ph.D. in Computer Science or related engineering field."
                {...register('requiredQualification')}
                className="rounded-xl"
              />
              {errors.requiredQualification && <p className="text-xs text-destructive font-semibold">{errors.requiredQualification.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Preferred Qualification</label>
              <Input
                placeholder="e.g. Prior post-doctoral research history and publication track records."
                {...register('preferredQualification')}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Detailed Description</label>
              <Textarea
                placeholder="Outline position duties, research projects, course teachings, and work dynamics..."
                rows={6}
                {...register('description')}
                className="rounded-xl resize-none"
              />
              {errors.description && <p className="text-xs text-destructive font-semibold">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Required Competencies & Skills</label>
              <Textarea
                placeholder="Outline specific academic fields, programming languages, laboratory practices, or course materials expected..."
                rows={6}
                {...register('requirements')}
                className="rounded-xl resize-none"
              />
              {errors.requirements && <p className="text-xs text-destructive font-semibold">{errors.requirements.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 border-t border-border/60 pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => handlePost('draft', data))}
            className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold gap-1 text-xs"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save as Draft'}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => handlePost('published', data))}
            className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl gap-1.5 shadow-md shadow-primary/5 text-xs"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish Listing'}
          </Button>
        </div>
      </form>
    </div>
  )
}
