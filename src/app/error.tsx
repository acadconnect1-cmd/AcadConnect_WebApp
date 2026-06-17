'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldAlert, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center shadow-lg border border-destructive/20">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Application Error</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this page. The system administrator has been notified.
          </p>
        </div>

        {error.message && (
          <div className="p-4 bg-muted rounded-xl text-left border border-border">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            className="flex items-center justify-center gap-2 px-6 rounded-xl font-bold border-border bg-background text-foreground hover:bg-muted"
          >
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
