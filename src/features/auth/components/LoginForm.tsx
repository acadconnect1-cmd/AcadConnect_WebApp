'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginInput } from '../schemas'
import { signInAction } from '../actions'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Read any error messages passed in parameters (e.g. from callback failures)
  const queryError = searchParams?.get('error')
  
  const [error, setError] = useState<string | null>(queryError ?? null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const response = await signInAction(data)
      if (response.success) {
        // Successful login: middleware handles role redirections; we can push to root
        // which triggers the middleware logic.
        router.push('/')
        router.refresh()
      } else {
        setError(response.error || 'Invalid email or password.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to your AcadConnect account to continue
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

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              disabled={isSubmitting}
              placeholder="••••••••"
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

      </form>

      {/* Redirect Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        New to AcadConnect?{' '}
        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>

    </motion.div>
  )
}
