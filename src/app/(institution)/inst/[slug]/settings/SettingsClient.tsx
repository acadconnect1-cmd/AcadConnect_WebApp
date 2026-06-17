'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateInstitutionAction, UpdateInstitutionInput } from '@/features/institutions/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Settings, CheckCircle2, AlertCircle } from 'lucide-react'
import * as z from 'zod'

const institutionFormSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  websiteUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  logoUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  country: z.string().min(2, 'Country is required.'),
  state: z.string().min(2, 'State is required.'),
  city: z.string().min(2, 'City is required.'),
  address: z.string().min(5, 'Address is required.'),
  institutionType: z.string().min(2, 'Institution Type is required.'),
})

interface SettingsClientProps {
  institution: {
    id: string
    name: string
    website_url: string | null
    logo_url: string | null
    description: string | null
    country: string
    state: string
    city: string
    address: string
    institution_type: string
  }
  slug: string
  activeUserRole: string
  isPlatformAdmin: boolean
}

export function SettingsClient({
  institution,
  slug,
  activeUserRole,
  isPlatformAdmin,
}: SettingsClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isWriteAuthorized = activeUserRole === 'owner' || activeUserRole === 'admin' || isPlatformAdmin

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateInstitutionInput>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      id: institution.id,
      name: institution.name,
      websiteUrl: institution.website_url || '',
      logoUrl: institution.logo_url || '',
      description: institution.description || '',
      country: institution.country,
      state: institution.state,
      city: institution.city,
      address: institution.address,
      institutionType: institution.institution_type,
    },
  })

  const onSubmit = async (data: UpdateInstitutionInput) => {
    setIsSubmitting(true)
    setMessage(null)

    const res = await updateInstitutionAction(data)
    setIsSubmitting(false)

    if (res.success) {
      setMessage({ type: 'success', text: 'Institution settings updated successfully!' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Institution Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Configure branding, website, and campus headquarters coordinates.
        </p>
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

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: General Details */}
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">General Specifications</CardTitle>
            <CardDescription className="text-xs">Specify the name, logo URL, and category profile details.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Institution Name</label>
              <Input
                disabled={!isWriteAuthorized}
                {...register('name')}
                className="rounded-xl"
              />
              {errors.name && <p className="text-xs text-destructive font-semibold">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Institution Type</label>
              <select
                disabled={!isWriteAuthorized}
                {...register('institutionType')}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs sm:text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="university">University</option>
                <option value="college">Liberal Arts College</option>
                <option value="institute">Research Institute</option>
                <option value="school">Community College</option>
              </select>
              {errors.institutionType && <p className="text-xs text-destructive font-semibold">{errors.institutionType.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Logo URL</label>
              <Input
                disabled={!isWriteAuthorized}
                placeholder="https://example.edu/logo.png"
                {...register('logoUrl')}
                className="rounded-xl"
              />
              {errors.logoUrl && <p className="text-xs text-destructive font-semibold">{errors.logoUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Website URL</label>
              <Input
                disabled={!isWriteAuthorized}
                placeholder="https://example.edu"
                {...register('websiteUrl')}
                className="rounded-xl"
              />
              {errors.websiteUrl && <p className="text-xs text-destructive font-semibold">{errors.websiteUrl.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Overview Description</label>
              <Textarea
                disabled={!isWriteAuthorized}
                placeholder="Provide a brief history and description of the institution's academic vision..."
                rows={5}
                {...register('description')}
                className="rounded-xl resize-none"
              />
              {errors.description && <p className="text-xs text-destructive font-semibold">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Campus Address info */}
        <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold text-foreground">Campus Headquarters</CardTitle>
            <CardDescription className="text-xs">Specify the location details.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Country</label>
              <Input
                disabled={!isWriteAuthorized}
                placeholder="e.g. United States"
                {...register('country')}
                className="rounded-xl"
              />
              {errors.country && <p className="text-xs text-destructive font-semibold">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">State / Region</label>
              <Input
                disabled={!isWriteAuthorized}
                placeholder="e.g. California"
                {...register('state')}
                className="rounded-xl"
              />
              {errors.state && <p className="text-xs text-destructive font-semibold">{errors.state.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">City</label>
              <Input
                disabled={!isWriteAuthorized}
                placeholder="e.g. Stanford"
                {...register('city')}
                className="rounded-xl"
              />
              {errors.city && <p className="text-xs text-destructive font-semibold">{errors.city.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-3">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Street Address</label>
              <Input
                disabled={!isWriteAuthorized}
                placeholder="e.g. 450 Serra Mall"
                {...register('address')}
                className="rounded-xl"
              />
              {errors.address && <p className="text-xs text-destructive font-semibold">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Action controls */}
        {isWriteAuthorized ? (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl gap-1.5 shadow-md shadow-primary/5 text-xs"
            >
              {isSubmitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Settings className="h-4.5 w-4.5" />}
              Save Configuration
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-muted/40 border border-border rounded-xl text-center text-xs text-muted-foreground">
            You are logged in as a <strong>Viewer</strong>. Setting changes can only be performed by Owners or Administrators.
          </div>
        )}
      </form>
    </div>
  )
}
