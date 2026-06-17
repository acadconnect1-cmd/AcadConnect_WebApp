import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const metadata: Metadata = {
  title: 'Sign Up | AcadConnect',
  description: 'Create an AcadConnect account as a faculty candidate or university recruitment partner to get started.',
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 bg-muted/20 relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <RegisterForm />
      </div>
    </div>
  )
}
