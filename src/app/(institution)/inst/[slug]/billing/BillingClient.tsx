'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Building2, 
  Zap 
} from 'lucide-react'

interface BillingClientProps {
  institutionId: string
  institutionName: string
  slug: string
  activeSubscription: {
    id: string
    status: string
    current_period_end: string
    subscription_plans: {
      id: string
      name: string
      features: any
      tier: 'free' | 'growth' | 'enterprise'
    }
  } | null
  activeUserRole: string
  isPlatformAdmin: boolean
}

export function BillingClient(props: BillingClientProps) {
  const { institutionName } = props

  const freeFeatures = [
    'Unlimited Vacancy Listings',
    'Standard Applicant Screening',
    'Interactive Candidate Profiles',
    'Academic Credentials Verification Support',
    'Full Team Recruiter Seats',
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Billing & Subscription
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Monitor your school subscription plans, renewal periods, and listing limits.
        </p>
      </div>

      {/* Active Subscription summary */}
      <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Plan Summary</p>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground">Free Tier</h2>
              <Badge variant="secondary" className="capitalize text-[8px] font-bold tracking-wider py-0.5 px-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-0">
                Active & Free
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Enjoy all core recruitment features for <span className="font-bold text-foreground">{institutionName}</span> at no cost.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice Card */}
      <Card className="border border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-primary/5 p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-0 space-y-6 max-w-xl">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Premium Plans Coming Soon</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-foreground">Academic Growth & Enterprise Packages</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are currently designing advanced capabilities for automated AI screening, deeper candidate matching metrics, priority listing exposure, and customizable department branding.
            </p>
          </div>

          <div className="pt-4 border-t border-border/60">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" /> Current Free Tier Benefits
            </h4>
            <ul className="grid sm:grid-cols-2 gap-3">
              {freeFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium">
                  <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information Card */}
      <Card className="border border-border/80 bg-card p-6 rounded-2xl shadow-xs">
        <CardContent className="p-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">No Credit Card Required</h4>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Your account will remain on the Free Tier. There are no limits to listing standard academic posts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
