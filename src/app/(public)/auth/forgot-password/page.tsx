import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | AcadConnect',
  description: 'Enter your email address to recover your AcadConnect password and regain access to your account.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 bg-muted/20 relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
