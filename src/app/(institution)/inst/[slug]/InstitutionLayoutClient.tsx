'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Menu, AlertTriangle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface InstitutionLayoutClientProps {
  children: React.ReactNode
  institution: {
    id: string
    name: string
    slug: string
    verification_status: 'pending' | 'approved' | 'rejected' | 'suspended'
  }
  memberRole: string
}

export function InstitutionLayoutClient({
  children,
  institution,
  memberRole,
}: InstitutionLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const status = institution.verification_status

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-zinc-950/50">
      {/* Sidebar */}
      <Sidebar
        role="institution_member"
        slug={institution.slug}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="shrink-0 border-r border-border/80"
      />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Verification Alert Banner */}
        {status === 'pending' && (
          <div className="bg-amber-500 text-amber-950 text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 select-none animate-pulse">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Verification Pending: Your institution profile is under review by administrator. Job postings will remain drafts.</span>
          </div>
        )}
        {status === 'rejected' && (
          <div className="bg-destructive text-destructive-foreground text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 select-none">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Registration Rejected: Your institution has been rejected by administrators. Please contact support.</span>
          </div>
        )}
        {status === 'suspended' && (
          <div className="bg-destructive text-destructive-foreground text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 select-none">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Profile Suspended: This institution profile has been suspended. Listings are offline.</span>
          </div>
        )}

        {/* Header (Top bar) */}
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-card px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
              <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                {institution.name}
              </span>
              <span className="hidden lg:inline-block w-1.5 h-1.5 rounded-full bg-border" />
              <span className="capitalize text-[10px] font-bold py-0.5 px-2 bg-secondary text-secondary-foreground rounded-full w-fit">
                {memberRole} Access
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href={`/inst/${institution.slug}/settings`} className="text-xs font-bold text-muted-foreground hover:text-foreground hidden sm:inline-block">
              Institution Settings
            </Link>
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto focus:outline-hidden p-6 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
