'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RotateCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  showBackButton?: boolean
  backButtonLink?: string
  backButtonText?: string
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  showBackButton = false,
  backButtonLink = '/',
  backButtonText = 'Go Back Home',
  className
}: ErrorStateProps) {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-destructive/20 rounded-xl bg-destructive/5 backdrop-blur-sm',
        className
      )}
    >
      {/* Animated Alert Icon Wrapper */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Glow backdrop ring */}
        <div className="absolute -inset-1 rounded-full bg-destructive/10 blur-xl w-16 h-16 animate-pulse" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive"
        >
          <AlertCircle className="h-7 w-7" />
        </motion.div>
      </div>

      {/* Copywriting Details */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-lg font-semibold text-foreground tracking-tight mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8"
      >
        {message}
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {/* Retry Button */}
        <Button
          onClick={onRetry || handleReload}
          variant="outline"
          className="border-border hover:bg-muted font-medium flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          <span>{onRetry ? 'Try Again' : 'Refresh Page'}</span>
        </Button>

        {/* Optional Go Back Button */}
        {showBackButton && (
          <Button render={<Link href={backButtonLink} />} className="font-medium flex items-center gap-2 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>{backButtonText}</span>
          </Button>
        )}
      </motion.div>
    </div>
  )
}
