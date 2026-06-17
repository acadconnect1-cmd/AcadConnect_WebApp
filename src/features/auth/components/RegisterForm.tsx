'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  GraduationCap,
  Building,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterInput } from '../schemas'
import { signUpAction } from '../actions'
import { cn } from '@/lib/utils'

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'faculty',
    },
  })

  // Track active role selection
  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterInput) => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const response = await signUpAction(data)
      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.error || 'Failed to create your account.')
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
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          We have sent a verification link to <span className="font-semibold text-foreground">{watch('email')}</span>. Please click the link to confirm your account and complete registration.
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
      className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 backdrop-blur-md"
    >
      {/* Title block */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Join AcadConnect to get started on your academic journey
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Role Selection Panel (Aesthetic Option Cards) */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Account Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Faculty Candidate Card */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setValue('role', 'faculty')}
              className={cn(
                'flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selectedRole === 'faculty'
                  ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className={cn('h-5 w-5', selectedRole === 'faculty' ? 'text-primary' : 'text-muted-foreground')} />
                <span className="text-sm font-bold text-foreground">Faculty Candidate</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                I am an educator or researcher searching for university job opportunities.
              </p>
            </button>

            {/* Recruiter Card */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setValue('role', 'institution_member')}
              className={cn(
                'flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selectedRole === 'institution_member'
                  ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Building className={cn('h-5 w-5', selectedRole === 'institution_member' ? 'text-primary' : 'text-muted-foreground')} />
                <span className="text-sm font-bold text-foreground">Institution Partner</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                I represent a school or university looking to post listings and recruit talent.
              </p>
            </button>

          </div>
          {errors.role && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* First & Last Name Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="Jane"
                className="pl-10"
                {...register('first_name')}
                aria-invalid={!!errors.first_name}
              />
            </div>
            {errors.first_name && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="Doe"
                className="pl-10"
                {...register('last_name')}
                aria-invalid={!!errors.last_name}
              />
            </div>
            {errors.last_name && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

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
              placeholder="jane.doe@university.edu"
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
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Password
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

      </form>

      {/* Redirect Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>

    </motion.div>
  )
}
