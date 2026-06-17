'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Menu, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface FacultyLayoutClientProps {
  children: React.ReactNode
}

export function FacultyLayoutClient({ children }: FacultyLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-zinc-950/50">
      {/* Sidebar - Handles Collapsing on Desktop, Slide-Over on Mobile */}
      <Sidebar
        role="faculty"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="shrink-0 border-r border-border/80"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header (Visible on small screens only) */}
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-card px-6 lg:hidden shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>
                Acad<span className="text-primary">Connect</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto focus:outline-hidden p-6 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
