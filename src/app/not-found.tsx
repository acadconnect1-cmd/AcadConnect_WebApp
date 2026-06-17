'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
          <GraduationCap className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">404 - Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The university page or workspace you are trying to access does not exist or has been moved to a new route.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center justify-center gap-2 px-6 rounded-xl font-bold border-border bg-background text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button
            render={<Link href="/" />}
            className="flex items-center justify-center gap-2 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
