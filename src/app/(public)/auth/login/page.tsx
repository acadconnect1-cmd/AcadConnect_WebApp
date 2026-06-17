import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { PageLoader } from '@/components/shared/LoadingState'

export const metadata: Metadata = {
  title: 'Sign In | AcadConnect',
  description: 'Sign in to your AcadConnect account to access your faculty dashboard or manage academic recruitment.',
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 bg-muted/20 relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={<PageLoader message="Loading authentication..." />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
