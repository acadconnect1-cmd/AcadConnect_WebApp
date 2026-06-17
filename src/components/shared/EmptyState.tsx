'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  actionText?: string
  actionLink?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  actionLink,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border rounded-xl bg-card/40 backdrop-blur-sm',
        className
      )}
    >
      {/* Animated Icon/Illustration Wrapper */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Decorative backdrop glow */}
        <div className="absolute -inset-1 rounded-full bg-primary/5 blur-xl w-20 h-20" />
        
        {Icon ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary"
          >
            <Icon className="h-7 w-7" />
          </motion.div>
        ) : (
          /* Premium Default Floating SVG Illustration */
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 flex h-20 w-20 items-center justify-center"
          >
            <svg
              className="h-16 w-16 text-muted-foreground/60"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              {/* Outer Folder / Page Shape */}
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        )}
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
        className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6"
      >
        {description}
      </motion.p>

      {/* Interactive Call to Action */}
      {actionText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {actionLink ? (
            <Button render={<Link href={actionLink} />} className="shadow-sm font-medium">
              {actionText}
            </Button>
          ) : (
            <Button onClick={onAction} className="shadow-sm font-medium">
              {actionText}
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}
