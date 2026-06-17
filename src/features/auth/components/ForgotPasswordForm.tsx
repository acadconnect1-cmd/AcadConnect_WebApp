'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas'
import { forgotPasswordAction } from '../actions'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const response = await forgotPasswordAction(data)
      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.error || 'Could not send reset link.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success Confirmation Card
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl backdrop-blur-md"
      >
        <div className="flex justify-center mb-6 text-success">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-3">
          Check your inbox
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          We have dispatched a password recovery email to <span className="font-semibold text-foreground">{watch('email')}</span>. Follow the link inside the email to reset your credentials.
        </p>
        <Button render={<Link href="/auth/login" />} className="w-full justify-center">
          Return to Sign In
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 backdrop-blur-md"
    >
      {/* Back button */}
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Login</span>
      </Link>

      {/* Title block */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email to receive a password recovery link
        </p>
      </div>

      {/* Form Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              disabled={isSubmitting}
              placeholder="name@university.edu"
              className="pl-10"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending recovery link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>

      </form>

    </motion.div>
  )
}
