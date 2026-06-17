'use client'

import { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { SupabaseProvider } from './supabase-provider'
import { ThemeProvider } from './theme-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryProvider>{children}</QueryProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
}
