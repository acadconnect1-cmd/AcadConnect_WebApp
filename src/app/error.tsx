'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  RotateCcw, 
  Home, 
  ChevronDown, 
  ChevronUp,
  Terminal,
  GraduationCap
} from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-16 md:py-24 overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-destructive/3 via-transparent to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[350px] w-[350px] rounded-full bg-destructive/2 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 text-center">
        
        {/* Logo Header */}
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/15">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Acad<span className="text-primary font-bold">Connect</span>
            </span>
          </Link>
        </div>

        {/* Error Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-0.5 text-xs font-semibold tracking-wide text-destructive uppercase">
            Runtime Error
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            Application Exception
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this view. Our monitoring system has captured the logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center max-w-xs mx-auto">
          <Button
            onClick={() => reset()}
            className="w-full rounded-xl font-semibold gap-2 justify-center shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            className="w-full rounded-xl font-semibold gap-2 border-border/80 hover:bg-muted justify-center"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            Return Home
          </Button>
        </div>

        {/* Collapsible Diagnostics Section */}
        <div className="border-t border-border/50 pt-6 mt-4 space-y-3">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Technical Diagnostics
            </span>
            {showDiagnostics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDiagnostics && (
            <div className="p-4 rounded-xl border border-border bg-card text-left space-y-3 shadow-inner">
              {error.message && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Exception Message</p>
                  <p className="text-xs font-mono text-foreground break-all bg-muted/40 p-2 rounded-lg border border-border/50">
                    {error.message}
                  </p>
                </div>
              )}
              {error.digest && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Error Digest ID</p>
                  <p className="text-xs font-mono text-foreground break-all bg-muted/40 p-2 rounded-lg border border-border/50">
                    {error.digest}
                  </p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                If the error persists after resetting, please share these details when contacting the support team at <strong>support@acadconnect.org</strong>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
