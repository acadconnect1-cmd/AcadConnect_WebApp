'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas'
import { resetPasswordAction } from '../actions'

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const response = await resetPasswordAction(data)
      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.error || 'Failed to update your credentials.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success view block
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
          Password updated
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Your AcadConnect password has been changed successfully. You can now use your new password to sign in.
        </p>
        <Button render={<Link href="/auth/login" />} className="w-full justify-center">
          Go to Sign In
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
      {/* Title block */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Enter new password
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Create a strong, new password for your account
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
        
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              disabled={isSubmitting}
              placeholder="Min. 8 characters"
              className="pl-10 pr-10"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              tabIndex={-1}
              disabled={isSubmitting}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.password.message}
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
              Updating password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>

      </form>

    </motion.div>
  )
}
