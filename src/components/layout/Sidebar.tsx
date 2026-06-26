'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  Settings,
  Briefcase,
  Users,
  CreditCard,
  Building,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/theme-provider'
import { useSupabase } from '@/providers/supabase-provider'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { UserRole } from '@/types'

interface SidebarProps {
  role?: UserRole
  slug?: string
  className?: string
  isOpen?: boolean // Controlled externally on mobile
  onClose?: () => void
}

export function Sidebar({
  role: propRole,
  slug: propSlug,
  className,
  isOpen = false,
  onClose
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const { supabase } = useSupabase()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Extract slug from route params if not explicitly provided
  const slug = propSlug || (params?.slug as string) || ''

  // Sync user state & settings
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Read collapsed settings from local storage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('acadconnect-sidebar-collapsed')
      setTimeout(() => {
        setIsCollapsed(saved === 'true')
        setMounted(true)
      }, 0)
    } else {
      setTimeout(() => setMounted(true), 0)
    }

    return () => subscription.unsubscribe()
  }, [supabase])

  const toggleCollapse = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem('acadconnect-sidebar-collapsed', String(nextState))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  // Resolve user role
  const resolvedRole = propRole || (user?.user_metadata?.role as UserRole) || 'faculty'

  // Define sidebar links based on active persona
  const links = {
    faculty: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/profile', label: 'My Profile', icon: User },
      { href: '/applications', label: 'My Applications', icon: FileText },
      { href: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
    institution_member: [
      { href: `/inst/${slug || 'dashboard'}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { href: `/inst/${slug || 'dashboard'}/jobs`, label: 'Manage Jobs', icon: Briefcase },
      { href: `/inst/${slug || 'dashboard'}/members`, label: 'Team Members', icon: Users },
      { href: `/inst/${slug || 'dashboard'}/billing`, label: 'Billing & Plan', icon: CreditCard },
      { href: `/inst/${slug || 'dashboard'}/settings`, label: 'Institution Settings', icon: Settings },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/institutions', label: 'Verifications', icon: Building },
      { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
      { href: '/admin/activities', label: 'System Logs', icon: Activity },
    ],
  }[resolvedRole] || []

  // Helper to check if a link is active
  const isLinkActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false
    return pathname?.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-card text-card-foreground">
      {/* Top Branding Section */}
      <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/15 shrink-0">
            <GraduationCap className="h-5 w-5 shrink-0" />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap font-semibold text-lg tracking-tight"
              >
                Acad<span className="text-primary font-bold">Connect</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Mobile close button (only displayed inside drawer container overlays) */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-muted rounded-xl"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const active = isLinkActive(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              {/* Left active accent bar (only visible if collapsed and active) */}
              {active && isCollapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r" />
              )}
              
              <Icon className={cn('h-5 w-5 shrink-0 transition-transform group-hover:scale-105', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
              
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
        {mounted && (
          <button
            onClick={toggleTheme}
            className={cn(
              'w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-muted/65 hover:text-foreground cursor-pointer mt-3 border border-transparent hover:border-border/30',
              isCollapsed && 'justify-center'
            )}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <Moon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
            )}
            {!isCollapsed && (
              <span className="overflow-hidden whitespace-nowrap">
                Theme Toggle
              </span>
            )}
          </button>
        )}
      </nav>

      {/* Bottom Profile / Quick Logout Section */}
      <div className="border-t border-border/60 p-4">
        {mounted && user ? (
          <div className="flex flex-col gap-4">
            {/* User Profile Summary */}
            <div className={cn('flex items-center gap-3 overflow-hidden', isCollapsed ? 'justify-center' : 'px-2')}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted text-sm font-semibold text-muted-foreground shadow-xs">
                {user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
              </div>
              
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-semibold leading-tight text-foreground">
                    {user.user_metadata?.first_name || 'User'} {user.user_metadata?.last_name || ''}
                  </span>
                  <span className="truncate text-[10px] leading-tight text-muted-foreground">
                    {user.email}
                  </span>
                  <span className="mt-1 w-max rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary capitalize">
                    {resolvedRole.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Logout Trigger */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                'w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl',
                isCollapsed && 'justify-center p-0'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="ml-3 text-sm font-medium">Log out</span>}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" render={<Link href="/auth/login" />} className="w-full rounded-xl">
              Sign In
            </Button>
          </div>
        )}
      </div>

      {/* Collapse Action Toggle (Desktop only) */}
      <div className="hidden border-t border-border/60 p-2 lg:flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar Slide-Over Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Drawer Sheet panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 flex w-[280px] max-w-xs flex-col shadow-2xl h-full"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className={cn(
          'hidden border-r border-border/60 h-screen sticky top-0 lg:flex flex-col overflow-hidden shrink-0 z-30 shadow-xs',
          className
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}
