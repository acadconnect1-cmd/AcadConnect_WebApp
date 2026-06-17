'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createInstitutionAction, CreateInstitutionInput } from '@/features/institutions/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Loader2, 
  Building2, 
  UserPlus, 
  LogOut, 
  MapPin, 
  Sparkles, 
  Plus, 
  Check, 
  ArrowRight, 
  Mail, 
  Info 
} from 'lucide-react'

// Validation schema for creating a new institution
const institutionFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  websiteUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  logoUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters.').or(z.literal('')),
  country: z.string().min(2, 'Country is required.'),
  state: z.string().min(2, 'State is required.'),
  city: z.string().min(2, 'City is required.'),
  address: z.string().min(5, 'Address is required.'),
  institutionType: z.string().min(2, 'Institution Type is required.'),
})

interface OnboardingClientProps {
  user: {
    email: string
    name: string
  }
}

export function OnboardingClient({ user }: OnboardingClientProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'wait'>('create')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInstitutionInput>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      name: '',
      websiteUrl: '',
      logoUrl: '',
      description: '',
      country: '',
      state: '',
      city: '',
      address: '',
      institutionType: 'university',
    },
  })

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Handle Status Refresh (Recheck membership)
  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      // Re-fetch memberships
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: memberships } = await supabase
          .from('institution_members')
          .select('institution_id, institutions(slug)')
          .eq('profile_id', session.user.id)

        const activeSlugs = memberships
          ?.map((m: any) => m.institutions?.slug)
          .filter(Boolean) as string[]

        if (activeSlugs && activeSlugs.length > 0) {
          router.push(`/inst/${activeSlugs[0]}/dashboard`)
          router.refresh()
          return
        }
      }
      // If still no membership
      setTimeout(() => {
        setIsRefreshing(false)
      }, 800)
    } catch {
      setIsRefreshing(false)
      setError('Failed to refresh status. Please try again.')
    }
  }

  // Handle Institution Registration
  const onSubmit = async (data: CreateInstitutionInput) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await createInstitutionAction(data)
      if (res.success) {
        // Redirect to new dashboard
        router.push(`/inst/${res.data}/dashboard`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to register institution.')
        setIsSubmitting(false)
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/20 to-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header Profile / Sign Out Action */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-foreground">{user.name}</p>
          <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="rounded-xl h-9 border-border/80 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 gap-1.5 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </Button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        {/* Brand Logo & Headline */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to AcadConnect
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            You are logged in as a recruiter. Setup your institution or wait for an invitation to get started.
          </p>
        </div>

        {/* Dynamic Card Container */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-xl overflow-hidden backdrop-blur-xs">
          {/* Custom Tabs */}
          <div className="border-b border-border/80 grid grid-cols-2 bg-muted/20">
            <button
              onClick={() => {
                setActiveTab('create')
                setError(null)
              }}
              className={`py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'border-primary text-primary bg-card'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Plus className="h-4 w-4" /> Register Institution
            </button>
            <button
              onClick={() => {
                setActiveTab('wait')
                setError(null)
              }}
              className={`py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'wait'
                  ? 'border-primary text-primary bg-card'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <UserPlus className="h-4 w-4" /> Awaiting Invitation
            </button>
          </div>

          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'create' ? (
              /* CREATE INSTITUTION FORM */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                    <Sparkles className="h-4 w-4" /> Institution Specifications
                  </h3>
                  
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Institution Name</label>
                      <Input
                        placeholder="e.g. Stanford University"
                        {...register('name')}
                        className="rounded-xl"
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive font-semibold">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Institution Type</label>
                      <select
                        {...register('institutionType')}
                        className="w-full h-8 px-2.5 bg-background border border-input rounded-xl text-xs sm:text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="university">University</option>
                        <option value="college">Liberal Arts College</option>
                        <option value="institute">Research Institute</option>
                        <option value="school">Community College</option>
                      </select>
                      {errors.institutionType && (
                        <p className="text-xs text-destructive font-semibold">{errors.institutionType.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Website URL</label>
                      <Input
                        placeholder="https://example.edu"
                        {...register('websiteUrl')}
                        className="rounded-xl"
                      />
                      {errors.websiteUrl && (
                        <p className="text-xs text-destructive font-semibold">{errors.websiteUrl.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Logo URL</label>
                      <Input
                        placeholder="https://example.edu/logo.png"
                        {...register('logoUrl')}
                        className="rounded-xl"
                      />
                      {errors.logoUrl && (
                        <p className="text-xs text-destructive font-semibold">{errors.logoUrl.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-5">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                    <MapPin className="h-4 w-4" /> Location Details
                  </h3>
                  
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Street Address</label>
                      <Input
                        placeholder="450 Serra Mall"
                        {...register('address')}
                        className="rounded-xl"
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive font-semibold">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">City</label>
                      <Input
                        placeholder="Stanford"
                        {...register('city')}
                        className="rounded-xl"
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive font-semibold">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">State / Province</label>
                      <Input
                        placeholder="California"
                        {...register('state')}
                        className="rounded-xl"
                      />
                      {errors.state && (
                        <p className="text-xs text-destructive font-semibold">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Country</label>
                      <Input
                        placeholder="United States"
                        {...register('country')}
                        className="rounded-xl"
                      />
                      {errors.country && (
                        <p className="text-xs text-destructive font-semibold">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Brief Description</label>
                    <Textarea
                      placeholder="Describe your institution's profile, academic scope, and core focus..."
                      {...register('description')}
                      className="rounded-xl min-h-24"
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive font-semibold">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 rounded-xl shadow-md transition-all gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                      </>
                    ) : (
                      <>
                        Create & Onboard <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* AWAITING INVITATION VIEW */
              <div className="space-y-6 py-4 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-foreground">Waiting for an invite?</h3>
                  <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                    If your colleagues have already registered your institution, ask them to send an invitation to your email:
                  </p>
                  <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-muted border border-border/80 text-xs font-bold text-foreground gap-1.5 select-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {user.email}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 max-w-md mx-auto">
                  <p className="text-xs text-muted-foreground font-medium mb-4">
                    Once they send the invitation, refresh your status below to be redirect automatically to the dashboard.
                  </p>
                  
                  <Button
                    onClick={handleRefreshStatus}
                    disabled={isRefreshing}
                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-10 rounded-xl border border-border/80 shadow-xs transition-all gap-1.5"
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Checking invitation status...
                      </>
                    ) : (
                      <>
                        Refresh Status <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
