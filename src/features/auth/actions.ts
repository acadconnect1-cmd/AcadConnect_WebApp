'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { env } from '@/lib/env'
import { ActionResponse } from '@/types'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schemas'

/**
 * Sign In Action
 */
export async function signInAction(rawPayload: LoginInput): Promise<ActionResponse> {
  try {
    const parsed = loginSchema.safeParse(rawPayload)
    if (!parsed.success) {
      return { success: false, error: 'Invalid login credentials provided' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'An unexpected authentication error occurred' }
  }
}

/**
 * Sign Up Action
 */
export async function signUpAction(rawPayload: RegisterInput): Promise<ActionResponse> {
  try {
    const parsed = registerSchema.safeParse(rawPayload)
    if (!parsed.success) {
      return { success: false, error: 'Registration details failed validation validation checks' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.first_name,
          last_name: parsed.data.last_name,
          role: parsed.data.role,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'An error occurred during account registration' }
  }
}

/**
 * Sign Out Action
 */
export async function signOutAction(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Failed to sign out of active session' }
  }
}

/**
 * Forgot Password (Recovery Email) Action
 */
export async function forgotPasswordAction(rawPayload: ForgotPasswordInput): Promise<ActionResponse> {
  try {
    const parsed = forgotPasswordSchema.safeParse(rawPayload)
    if (!parsed.success) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    const supabase = await createClient()
    const redirectToUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`
    
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: redirectToUrl,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'An error occurred sending the password reset email' }
  }
}

/**
 * Reset Password Action
 */
export async function resetPasswordAction(rawPayload: ResetPasswordInput): Promise<ActionResponse> {
  try {
    const parsed = resetPasswordSchema.safeParse(rawPayload)
    if (!parsed.success) {
      return { success: false, error: 'Password does not meet validation criteria' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Failed to update user credentials' }
  }
}
