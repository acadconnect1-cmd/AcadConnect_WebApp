'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSupabase } from '@/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  UserCheck
} from 'lucide-react'

const passwordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password confirmation must match.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
})

type PasswordFormValues = z.infer<typeof passwordSchema>

interface SettingsClientProps {
  email: string
  role: string
}

export function SettingsClient({ email, role }: SettingsClientProps) {
  const { supabase } = useSupabase()
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = async (data: PasswordFormValues) => {
    setIsUpdating(true)
    setMessage(null)

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password
    })

    setIsUpdating(false)

    if (updateError) {
      setMessage({ type: 'error', text: updateError.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      reset()
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account credentials, notifications, and security policies.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Update Password Form */}
        <div className="lg:col-span-2">
          <Card className="border border-border/80 bg-card rounded-2xl shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Update Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your account is using a secure password to prevent unauthorized access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg gap-2 shadow-xs shrink-0"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Account Details summary */}
        <div className="space-y-6">
          <Card className="border border-border/80 bg-muted/20 p-6 rounded-2xl space-y-6">
            <h3 className="text-sm font-bold text-foreground">Account Overview</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sign In Email</p>
                  <p className="text-xs font-bold text-foreground truncate mt-0.5">{email}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Type</p>
                  <Badge variant="secondary" className="capitalize text-[10px] font-bold py-0.5 px-2 mt-0.5">
                    {role}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
