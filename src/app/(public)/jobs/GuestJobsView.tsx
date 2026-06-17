'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Lock, 
  ArrowRight, 
  Building2, 
  ShieldCheck,
  Briefcase
} from 'lucide-react'

export function GuestJobsView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center space-y-12">
      {/* Decorative top badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/15 text-primary text-xs font-semibold shadow-xs"
      >
        <Lock className="h-3.5 w-3.5" />
        <span>Exclusive Academic Opportunities</span>
      </motion.div>

      {/* Hero Header */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          Unlock the Academic <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">Jobs Board</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
        >
          Connecting educational institutions with top-tier educators. Sign up or log in to search vacancies, filter by department, and submit your verified academic credentials.
        </motion.p>
      </div>

      {/* Creative Teaser Cards Overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative border border-border/70 rounded-3xl bg-card/65 backdrop-blur-xs p-6 md:p-8 max-w-3xl mx-auto shadow-md overflow-hidden"
      >
        {/* Absolute overlay to create the blurred lock screen */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/25 to-background/95 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[4px]">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-lg animate-bounce mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Member Authentication Required</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-6 font-medium">
            This vacancy search board is private and only available to registered candidate profiles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              render={<Link href="/auth/register?role=faculty" />}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-primary/10 rounded-xl px-6"
            >
              Create Candidate Account <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              render={<Link href="/auth/login?next=/jobs" />}
              className="border-border hover:bg-muted font-bold rounded-xl px-6"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Blurred representation of the job search board */}
        <div className="space-y-6 opacity-30 select-none pointer-events-none">
          {/* Mock search header */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 h-10 bg-muted rounded-xl" />
            <div className="w-32 h-10 bg-muted rounded-xl" />
          </div>

          {/* Mock job list item */}
          <div className="border border-border p-5 rounded-2xl space-y-3 text-left">
            <div className="h-4 w-1/3 bg-muted rounded-md" />
            <div className="h-6 w-1/2 bg-muted rounded-md" />
            <div className="h-4 w-1/4 bg-muted rounded-md" />
          </div>

          {/* Mock job list item 2 */}
          <div className="border border-border p-5 rounded-2xl space-y-3 text-left">
            <div className="h-4 w-1/3 bg-muted rounded-md" />
            <div className="h-6 w-1/2 bg-muted rounded-md" />
            <div className="h-4 w-1/4 bg-muted rounded-md" />
          </div>
        </div>
      </motion.div>

      {/* Feature highlights grid */}
      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-2 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-foreground">Verified Openings</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Browse genuine teaching, lecturing, and research roles verified by our administrative team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-2 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Building2 className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-foreground">Top Institutions</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Connect directly with verified academic institutions and university search committees.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-2 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-foreground">Smart Screening</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Securely upload your academic resume, credentials, and cover letters once and apply globally.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
