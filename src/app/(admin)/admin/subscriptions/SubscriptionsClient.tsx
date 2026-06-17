'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSubscriptionStatusAction } from '@/features/admin/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  TrendingUp,
  Building,
  DollarSign
} from 'lucide-react'

interface Subscription {
  id: string
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing'
  stripe_subscription_id: string | null
  current_period_start: string
  current_period_end: string
  created_at: string
  institution_id: string
  institutions: {
    name: string
    slug: string
  } | null
  plan_id: string
  subscription_plans: {
    name: string
    tier: string
    description: string | null
  } | null
}

interface SubscriptionsClientProps {
  initialSubscriptions: Subscription[]
}

export function SubscriptionsClient({ initialSubscriptions }: SubscriptionsClientProps) {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [search, setSearch] = useState('')
  
  // Selected Subscription State for Drawer
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filters
  const filtered = subscriptions.filter((sub) => {
    const name = sub.institutions?.name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  // Calculations
  const totalFree = subscriptions.filter((s) => s.subscription_plans?.tier === 'free').length
  const totalGrowth = subscriptions.filter((s) => s.subscription_plans?.tier === 'growth' && s.status === 'active').length
  const totalEnterprise = subscriptions.filter((s) => s.subscription_plans?.tier === 'enterprise' && s.status === 'active').length

  const handleOpenManage = (sub: Subscription) => {
    setSelectedSub(sub)
    setToast(null)
  }

  const handleCloseManage = () => {
    setSelectedSub(null)
    setToast(null)
  }

  const handleUpdateStatus = async (status: 'active' | 'past_due' | 'canceled') => {
    if (!selectedSub) return
    setIsSubmitting(true)
    setToast(null)

    const res = await updateSubscriptionStatusAction({
      subscriptionId: selectedSub.id,
      status,
    })

    setIsSubmitting(false)

    if (res.success) {
      setToast({ type: 'success', text: `Subscription status updated to ${status}!` })
      
      // Update local state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSub.id
            ? { ...sub, status }
            : sub
        )
      )
      setTimeout(() => {
        handleCloseManage()
        router.refresh()
      }, 1500)
    } else {
      setToast({ type: 'error', text: res.error })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-100 dark:bg-emerald-950/35 text-emerald-800 dark:text-emerald-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <CheckCircle2 className="h-3 w-3" /> Active
          </Badge>
        )
      case 'past_due':
        return (
          <Badge className="bg-amber-100 dark:bg-amber-950/35 text-amber-800 dark:text-amber-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <AlertTriangle className="h-3 w-3" /> Past Due
          </Badge>
        )
      case 'canceled':
        return (
          <Badge className="bg-rose-100 dark:bg-rose-950/35 text-rose-800 dark:text-rose-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <XCircle className="h-3 w-3" /> Canceled
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-100 dark:bg-slate-900/35 text-slate-800 dark:text-slate-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] capitalize">
            {status}
          </Badge>
        )
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/25 dark:text-purple-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">Enterprise</span>
      case 'growth':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/25 dark:text-blue-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">Growth</span>
      default:
        return <span className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">Free</span>
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Subscription Monitoring
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Track institution customer billing plans, active licenses, and handle premium status modifications.
        </p>
      </div>

      {/* Sandbox Billing / Free Tier Notice Banner */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10 p-5 rounded-2xl">
        <CardContent className="p-0 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-850 dark:text-amber-400">
              Billing & Subscription Integration Deferred
            </h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 font-medium leading-relaxed">
              AcadConnect is currently in a testing/evaluation sandbox. All institutions default to the <strong>Free Tier</strong>, and all vacancy posting limits have been removed to allow unlimited postings. Paid subscription plans (Growth, Enterprise) and Stripe billing integration will be fully enabled in a future release.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Metrics cards */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <Card className="border border-border/85 bg-card p-4 rounded-xl shadow-xs">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
              <Building className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Free Tiers</p>
              <h3 className="text-xl font-extrabold text-foreground mt-0.5">{totalFree}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/85 bg-card p-4 rounded-xl shadow-xs">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Growth Active</p>
              <h3 className="text-xl font-extrabold text-foreground mt-0.5">{totalGrowth}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/85 bg-card p-4 rounded-xl shadow-xs">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enterprise Active</p>
              <h3 className="text-xl font-extrabold text-foreground mt-0.5">{totalEnterprise}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control panel & list */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by school name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs font-semibold"
          />
        </div>

        {/* Subscription listings */}
        <Card className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Institution</th>
                  <th className="p-4">Active Plan</th>
                  <th className="p-4">Stripe ID</th>
                  <th className="p-4">Current Period End</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 text-xs font-medium text-foreground">
                {filtered.length > 0 ? (
                  filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/10">
                      <td className="p-4 font-bold text-sm">
                        {sub.institutions?.name || 'Unknown School'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {getTierBadge(sub.subscription_plans?.tier || 'free')}
                          <span className="text-muted-foreground font-semibold">
                            {sub.subscription_plans?.name || 'Free Tier'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-muted-foreground">
                        {sub.stripe_subscription_id || 'N/A'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(sub.current_period_end).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenManage(sub)}
                          className="text-primary hover:text-primary/90 hover:bg-muted font-bold text-xs rounded-lg px-3 py-1.5"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                      No matching subscription customer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Moderation details modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-5 border-b border-border/80 bg-muted/20">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Subscription Console</p>
                <h3 className="text-base font-extrabold text-foreground mt-1">
                  Manage Subscription
                </h3>
              </div>
              <button
                onClick={handleCloseManage}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Institution</span>
                  <span className="text-foreground font-extrabold">{selectedSub.institutions?.name}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Active Plan</span>
                  <span className="text-foreground">{selectedSub.subscription_plans?.name}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Stripe Subscription ID</span>
                  <span className="text-foreground font-mono text-[10px]">{selectedSub.stripe_subscription_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Billing Period Start</span>
                  <span className="text-foreground">{new Date(selectedSub.current_period_start).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Billing Period End</span>
                  <span className="text-foreground">{new Date(selectedSub.current_period_end).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Status</span>
                  {getStatusBadge(selectedSub.status)}
                </div>
              </div>

              {/* Toast Messages */}
              {toast && (
                <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-bold leading-normal ${
                  toast.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/25 text-emerald-800 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/25 text-rose-800 dark:text-rose-400'
                }`}>
                  {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  {toast.text}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-border/80 bg-muted/10 flex flex-wrap gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseManage}
                disabled={isSubmitting}
                className="text-xs font-bold rounded-lg"
              >
                Close
              </Button>

              {/* Mark Past due */}
              {selectedSub.status !== 'past_due' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus('past_due')}
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg px-3.5 py-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Set Past Due'}
                </Button>
              )}

              {/* Cancel subscription */}
              {selectedSub.status !== 'canceled' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus('canceled')}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg px-3.5 py-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cancel Plan'}
                </Button>
              )}

              {/* Reactivate subscription */}
              {selectedSub.status !== 'active' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus('active')}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg px-3.5 py-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Reactivate'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
