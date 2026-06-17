'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateProfileAction, uploadCVAction, UpdateProfileInput } from '@/features/profiles/actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  GraduationCap,
  Link as LinkIcon,
  FileText,
  Loader2,
  CheckCircle2,
  Upload,
  AlertCircle,
  Globe2
} from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  title: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  currentInstitution: z.string().nullable().optional(),
  highestDegree: z.string().nullable().optional(),
  majorDiscipline: z.string().nullable().optional(),
  websiteUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).nullable().optional(),
  linkedinUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).nullable().optional(),
  githubUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).nullable().optional(),
  searchStatus: z.string(),
})

interface ProfileClientProps {
  userId: string
  initialProfile: {
    first_name: string
    last_name: string
    email: string
  }
  initialFacultyProfile: {
    title: string | null
    phone: string | null
    bio: string | null
    current_institution: string | null
    highest_degree: string | null
    major_discipline: string | null
    website_url: string | null
    linkedin_url: string | null
    github_url: string | null
    search_status: string
    resume_filename: string | null
    resume_uploaded_at: string | null
    cv_url: string | null
    profile_completion_percentage: number
  }
}

export function ProfileClient({ userId, initialProfile, initialFacultyProfile }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'academic' | 'links' | 'cv'>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Real CV upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploadingCV, setIsUploadingCV] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialProfile.first_name,
      lastName: initialProfile.last_name,
      title: initialFacultyProfile.title || '',
      phone: initialFacultyProfile.phone || '',
      bio: initialFacultyProfile.bio || '',
      currentInstitution: initialFacultyProfile.current_institution || '',
      highestDegree: initialFacultyProfile.highest_degree || '',
      majorDiscipline: initialFacultyProfile.major_discipline || '',
      websiteUrl: initialFacultyProfile.website_url || '',
      linkedinUrl: initialFacultyProfile.linkedin_url || '',
      githubUrl: initialFacultyProfile.github_url || '',
      searchStatus: initialFacultyProfile.search_status,
    }
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true)
    setMessage(null)

    const res = await updateProfileAction(data)
    setIsSubmitting(false)

    if (res.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      // Auto-clear message
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  const handleCVUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploadingCV(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      // File path shape: resumes/{userId}/{timestamp}-{filename}
      const fileExt = selectedFile.name.split('.').pop()
      const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')
      const filePath = `${userId}/${Date.now()}-${cleanName}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, selectedFile, {
          upsert: true,
          contentType: 'application/pdf',
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        setMessage({ type: 'error', text: `Failed to upload CV: ${uploadError.message}` })
        setIsUploadingCV(false)
        return
      }

      const res = await uploadCVAction(selectedFile.name, uploadData.path)
      setIsUploadingCV(false)

      if (res.success) {
        setMessage({ type: 'success', text: `CV "${selectedFile.name}" uploaded successfully!` })
        setSelectedFile(null)
        // Refresh page to get latest server values
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: res.error })
      }
    } catch (err: any) {
      console.error('Upload catch error:', err)
      setMessage({ type: 'error', text: err?.message || 'An unexpected error occurred.' })
      setIsUploadingCV(false)
    }
  }

  const completion = initialFacultyProfile.profile_completion_percentage

  return (
    <div className="space-y-8 pb-12">
      {/* Header Profile Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            My Academic Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build and manage your professional identity, curriculum vitae, and job search parameters.
          </p>
        </div>
        
        {/* Completion Indicator */}
        <div className="bg-card border border-border/80 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completion</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">{completion}%</p>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-border/80 overflow-x-auto gap-2 shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'basic'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          Basic Info
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'academic'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Academic Details
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'links'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          Web Links
        </button>

        <button
          onClick={() => setActiveTab('cv')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cv'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          CV / Resume
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Forms Area */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Tab: Basic Info */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">First Name</label>
                    <Input
                      type="text"
                      placeholder="Jane"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                    />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Last Name</label>
                    <Input
                      type="text"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                    />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Academic Title</label>
                    <Input
                      type="text"
                      placeholder="Assistant Professor"
                      {...register('title')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 0199"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Biography & Research Focus</label>
                  <Textarea
                    placeholder="Provide a brief overview of your academic focus, publications history, and teaching interests..."
                    rows={5}
                    {...register('bio')}
                  />
                </div>
              </div>
            )}

            {/* Tab: Academic Details */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Highest Degree</label>
                    <select
                      {...register('highestDegree')}
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50 text-foreground"
                    >
                      <option value="">Select Degree</option>
                      <option value="Ph.D.">Ph.D. / Doctorate</option>
                      <option value="Master of Science">Master of Science (M.S.)</option>
                      <option value="Master of Arts">Master of Arts (M.A.)</option>
                      <option value="Bachelor of Science">Bachelor of Science (B.S.)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Major Discipline</label>
                    <select
                      {...register('majorDiscipline')}
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50 text-foreground"
                    >
                      <option value="">Select Discipline</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Current Institution</label>
                    <Input
                      type="text"
                      placeholder="Massachusetts Institute of Technology"
                      {...register('currentInstitution')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Job Search Status</label>
                    <select
                      {...register('searchStatus')}
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50 text-foreground"
                    >
                      <option value="active">Active (Actively applying & matching)</option>
                      <option value="passive">Passive (Open to offers but not active)</option>
                      <option value="hidden">Hidden (Do not display profile in searches)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Web Links */}
            {activeTab === 'links' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Globe2 className="h-4 w-4 text-muted-foreground" /> Personal Website
                  </label>
                  <Input
                    type="text"
                    placeholder="https://janedoe.com"
                    {...register('websiteUrl')}
                    className={errors.websiteUrl ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                  />
                  {errors.websiteUrl && <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="h-4 w-4 fill-current text-muted-foreground" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn Profile</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="https://linkedin.com/in/janedoe"
                    {...register('linkedinUrl')}
                    className={errors.linkedinUrl ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                  />
                  {errors.linkedinUrl && <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="h-4 w-4 fill-current text-muted-foreground" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub Profile</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="https://github.com/janedoe"
                    {...register('githubUrl')}
                    className={errors.githubUrl ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                  />
                  {errors.githubUrl && <p className="text-xs text-destructive">{errors.githubUrl.message}</p>}
                </div>
              </div>
            )}

            {/* Tab: CV / Resume Manager */}
            {activeTab === 'cv' && (
              <div className="space-y-6">
                
                {/* Active CV display */}
                <div className="border border-border/80 p-5 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-border">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Resume CV</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                        {initialFacultyProfile.resume_filename ? (
                          <a
                            href={initialFacultyProfile.cv_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline hover:text-primary/95 transition-colors"
                          >
                            {initialFacultyProfile.resume_filename}
                          </a>
                        ) : (
                          'No CV document uploaded.'
                        )}
                      </p>
                      {initialFacultyProfile.resume_uploaded_at && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Uploaded on: {new Date(initialFacultyProfile.resume_uploaded_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {initialFacultyProfile.resume_filename && (
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        render={
                          <a
                            href={initialFacultyProfile.cv_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-xl"
                      >
                        View CV
                      </Button>
                      <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-bold">
                        Verified Active
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Real Upload Input */}
                <div className="space-y-4 pt-4 border-t border-border/60">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Upload new academic credentials</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload your official curriculum vitae (PDF format only, max 5MB).
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <div className="flex-1 w-full relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-xs file:font-bold file:text-primary file:uppercase file:tracking-wider text-foreground file:mr-4 file:px-2.5 file:py-0.5 file:rounded-md file:bg-primary/5 hover:file:bg-primary/10 file:cursor-pointer"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      disabled={isUploadingCV || !selectedFile}
                      onClick={handleCVUpload}
                      className="w-full sm:w-auto h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shrink-0 gap-2"
                    >
                      {isUploadingCV ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload CV
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Actions - Hidden inside CV tab as it has its own upload trigger */}
            {activeTab !== 'cv' && (
              <div className="flex justify-end pt-4 border-t border-border/60">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl gap-2 shadow-xs shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Profile Details'
                  )}
                </Button>
              </div>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
