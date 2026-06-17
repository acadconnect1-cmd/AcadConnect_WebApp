'use client'

import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Loading AcadConnect...
        </p>
      </div>
    </div>
  )
}
