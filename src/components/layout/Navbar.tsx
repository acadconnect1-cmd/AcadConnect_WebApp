'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { GraduationCap, Bell, Search, Menu, LogOut, User, Settings, X, Info, PhoneCall, Sun, Moon, Briefcase, Bookmark, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/providers/theme-provider'
import { useSupabase } from '@/providers/supabase-provider'
import { useMounted } from '@/hooks/use-mounted'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  onMenuClick?: () => void
  showHamburger?: boolean
}

export function Navbar({ onMenuClick, showHamburger = false }: NavbarProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMac, setIsMac] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mounted = useMounted()
  const { theme, toggleTheme } = useTheme()

  // Listen for active user auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Detect OS for shortcut indicator
    if (typeof window !== 'undefined') {
      const isMacUser = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
      setTimeout(() => setIsMac(isMacUser), 0)
    }

    // Keyboard shortcut handler for Ctrl+K / Cmd+K search focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-md shadow-xs">
        <div className="flex h-16 items-center justify-between px-6">
          
          {/* Left Side: Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-6">
            {showHamburger && onMenuClick ? (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-muted rounded-xl"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-muted rounded-xl"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
            
            <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/15 transition-transform duration-300 hover:rotate-3">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Acad<span className="text-primary font-bold">Connect</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 ml-2">
              <Link
                href="/jobs"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Explore Jobs
              </Link>
              <Link
                href="/about"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Center: Search Form Input */}
          <div className="hidden md:flex max-w-sm w-full px-6">
            <form action="/jobs" method="GET" className="relative w-full group">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300 pointer-events-none" />
              {!mounted ? (
                <div
                  className="w-full text-sm text-muted-foreground/75 bg-muted/40 border border-border/85 rounded-xl pl-10 pr-12 py-1.5 cursor-text select-none min-h-[34px] flex items-center font-medium"
                  aria-hidden="true"
                >
                  Search jobs, schools...
                </div>
              ) : (
                <input
                  ref={searchInputRef}
                  name="q"
                  type="text"
                  placeholder="Search jobs, schools..."
                  className="w-full text-sm text-foreground bg-muted/40 border border-border/85 rounded-xl pl-10 pr-12 py-1.5 focus:bg-background focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-hidden transition-all duration-300 shadow-sm placeholder:text-muted-foreground/70"
                  suppressHydrationWarning={true}
                />
              )}
              <kbd className="absolute right-2.5 top-2 pointer-events-none select-none inline-flex h-5 items-center gap-1 rounded-md border border-border bg-background px-2 font-mono text-[9px] font-medium text-muted-foreground shadow-xs">
                <span>{isMac ? '⌘' : 'Ctrl'}</span>K
              </kbd>
            </form>
          </div>

          {/* Right Side: Auth States & Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-xl shrink-0"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {user ? (
              <>
                {/* Notifications Alert Bell */}
                <Button variant="ghost" size="icon" render={<Link href="/notifications" />} className="relative text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-xl">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                </Button>

                {/* Profile Context Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border bg-muted overflow-hidden hover:scale-105 transition-transform" />
                    }
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl border-border/80 shadow-md" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(user.user_metadata?.role === 'faculty' ? '/profile' : '/inst/dashboard')}>
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    {user.user_metadata?.role === 'faculty' && (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/applications')}>
                          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>My Applications</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/saved-jobs')}>
                          <Bookmark className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Saved Jobs</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive font-medium">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" render={<Link href="/auth/login" />} className="rounded-xl font-medium px-4">
                  Sign In
                </Button>
                <Button render={<Link href="/auth/register" />} className="rounded-xl font-medium px-4 shadow-sm shadow-primary/10">
                  Get Started
                </Button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Mobile navigation drawer slide-over */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            {/* Drawer Sheet panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 flex w-[280px] max-w-xs flex-col bg-card h-full shadow-2xl border-r border-border/60"
            >
              {/* Header branding */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-border/60">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/15 shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-lg tracking-tight">
                    Acad<span className="text-primary font-bold">Connect</span>
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
                <Link
                  href="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                >
                  <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>Explore Jobs</span>
                </Link>
                {user && user.user_metadata?.role === 'faculty' && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                    >
                      <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                    >
                      <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>My Applications</span>
                    </Link>
                    <Link
                      href="/saved-jobs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                    >
                      <Bookmark className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Saved Jobs</span>
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                    >
                      <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Notifications</span>
                    </Link>
                  </>
                )}
                {user && user.user_metadata?.role === 'institution_member' && (
                  <>
                    <Link
                      href="/inst/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                    >
                      <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Workspace Dashboard</span>
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                    >
                      <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Notifications</span>
                    </Link>
                  </>
                )}
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                >
                  <Info className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>About Us</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                >
                  <PhoneCall className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>Contact Support</span>
                </Link>
                {mounted && (
                  <button
                    onClick={() => {
                      toggleTheme()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full group flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200 cursor-pointer"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>Switch to Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>Switch to Dark Mode</span>
                      </>
                    )}
                  </button>
                )}
              </nav>

              {/* Bottom auth shortcuts */}
              <div className="border-t border-border/60 p-4">
                {user ? (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      router.push(user.user_metadata?.role === 'faculty' ? '/profile' : '/inst/dashboard')
                    }}
                    className="w-full justify-center rounded-xl font-semibold shadow-xs"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Button
                      variant="outline"
                      render={<Link href="/auth/login" />}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full justify-center rounded-xl font-semibold"
                    >
                      Sign In
                    </Button>
                    <Button
                      render={<Link href="/auth/register" />}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full justify-center rounded-xl font-semibold shadow-xs"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

