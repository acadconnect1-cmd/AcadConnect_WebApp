import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | AcadConnect',
  description: 'Enter a strong, new password to secure your AcadConnect account and complete the password recovery process.',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 bg-muted/20 relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
