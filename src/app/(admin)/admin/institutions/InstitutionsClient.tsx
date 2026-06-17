'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyInstitutionAction } from '@/features/admin/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Building,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Calendar,
  X,
  Loader2,
  ShieldCheck,
  Check
} from 'lucide-react'

interface Institution {
  id: string
  name: string
  slug: string
  website_url: string | null
  logo_url: string | null
  description: string | null
  country: string
  state: string
  city: string
  address: string
  institution_type: string
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended'
  verification_notes: string | null
  created_at: string
}

interface InstitutionsClientProps {
  initialInstitutions: Institution[]
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended'

export function InstitutionsClient({ initialInstitutions }: InstitutionsClientProps) {
  const router = useRouter()
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  
  // Modal State
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filter Logic
  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase()) ||
      inst.state.toLowerCase().includes(search.toLowerCase())
    
    const matchesTab = activeTab === 'all' || inst.verification_status === activeTab
    return matchesSearch && matchesTab
  })

  const handleOpenReview = (inst: Institution) => {
    setSelectedInst(inst)
    setNotes(inst.verification_notes || '')
    setToast(null)
  }

  const handleCloseReview = () => {
    setSelectedInst(null)
    setNotes('')
    setToast(null)
  }

  const handleVerify = async (status: 'approved' | 'rejected' | 'suspended') => {
    if (!selectedInst) return
    setIsSubmitting(true)
    setToast(null)

    const res = await verifyInstitutionAction({
      institutionId: selectedInst.id,
      status,
      notes: notes.trim(),
    })

    setIsSubmitting(false)

    if (res.success) {
      setToast({ type: 'success', text: `Institution successfully marked as ${status}!` })
      // Update local state
      setInstitutions((prev) =>
        prev.map((inst) =>
          inst.id === selectedInst.id
            ? { ...inst, verification_status: status, verification_notes: notes.trim() }
            : inst
        )
      )
      setTimeout(() => {
        handleCloseReview()
        router.refresh()
      }, 1500)
    } else {
      setToast({ type: 'error', text: res.error })
    }
  }

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected' | 'suspended') => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 dark:bg-emerald-950/35 text-emerald-800 dark:text-emerald-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-rose-100 dark:bg-rose-950/35 text-rose-800 dark:text-rose-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      case 'suspended':
        return (
          <Badge className="bg-amber-100 dark:bg-amber-950/35 text-amber-800 dark:text-amber-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <AlertTriangle className="h-3 w-3" /> Suspended
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-100 dark:bg-blue-950/35 text-blue-800 dark:text-blue-400 border-none font-bold rounded-lg px-2.5 py-1 text-[11px] gap-1 flex items-center w-fit">
            <Building className="h-3 w-3" /> Pending Verification
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Institution Verifications
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Review academic organization profiles and verify their platform registration access.
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs font-semibold"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/50 border border-border/80 rounded-xl w-full md:w-auto">
          {(['pending', 'approved', 'suspended', 'rejected', 'all'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst) => (
            <Card 
              key={inst.id}
              className="border border-border/80 hover:border-primary/40 bg-card rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-foreground text-sm sm:text-base leading-tight truncate">
                      {inst.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                      {inst.institution_type}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-medium text-muted-foreground">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    {inst.city}, {inst.state}, {inst.country}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    Joined: {new Date(inst.created_at).toLocaleDateString()}
                  </p>
                  {inst.website_url && (
                    <a
                      href={inst.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline font-bold text-xs"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t border-border/80 pt-4 mt-5 flex justify-between items-center gap-3">
                {getStatusBadge(inst.verification_status)}
                
                <Button
                  size="sm"
                  onClick={() => handleOpenReview(inst)}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground text-[11px] font-bold rounded-lg px-3 py-1.5 shrink-0"
                >
                  Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No institutions found"
          description={`No academic profiles match the status filters "${activeTab}" under keyword search.`}
        />
      )}

      {/* Review Dialog Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-5 border-b border-border/80 bg-muted/20">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Verification Review</p>
                <h3 className="text-base font-extrabold text-foreground mt-1">
                  {selectedInst.name}
                </h3>
              </div>
              <button
                onClick={handleCloseReview}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <p className="text-foreground mt-0.5">{selectedInst.institution_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Website</span>
                  {selectedInst.website_url ? (
                    <a
                      href={selectedInst.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 mt-0.5 font-bold"
                    >
                      Visit site <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground mt-0.5">None</p>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Address</span>
                  <p className="text-foreground mt-0.5">{selectedInst.address}, {selectedInst.city}, {selectedInst.state}, {selectedInst.country}</p>
                </div>
                {selectedInst.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description</span>
                    <p className="text-foreground mt-1 font-medium leading-relaxed bg-muted/20 border border-border/50 rounded-xl p-3">
                      {selectedInst.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Note input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                  Verification Notes / Status Remark
                </label>
                <Textarea
                  placeholder="Enter moderation remarks or details regarding the decision status..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-card border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs font-medium min-h-[80px]"
                />
              </div>

              {/* Alert / Toast info */}
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
            <div className="p-5 border-t border-border/80 bg-muted/10 flex flex-wrap gap-2.5 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseReview}
                disabled={isSubmitting}
                className="text-xs font-bold rounded-lg"
              >
                Cancel
              </Button>

              {/* Suspend Button */}
              {selectedInst.verification_status !== 'suspended' && (
                <Button
                  size="sm"
                  onClick={() => handleVerify('suspended')}
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg px-3.5 py-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Suspend'}
                </Button>
              )}

              {/* Reject Button */}
              {selectedInst.verification_status !== 'rejected' && (
                <Button
                  size="sm"
                  onClick={() => handleVerify('rejected')}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg px-3.5 py-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Reject'}
                </Button>
              )}

              {/* Approve Button */}
              {selectedInst.verification_status !== 'approved' && (
                <Button
                  size="sm"
                  onClick={() => handleVerify('approved')}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg px-3.5 py-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Approve'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
