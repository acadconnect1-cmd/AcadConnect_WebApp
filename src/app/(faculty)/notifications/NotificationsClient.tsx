'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/features/notifications/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Briefcase,
  AlertCircle,
  MessageSquare,
  Loader2,
  ChevronRight
} from 'lucide-react'

interface NotificationItem {
  id: string
  type: 'application_status_change' | 'new_job_alert' | 'system_alert' | 'message'
  title: string
  content: string
  read_at: string | null
  link_url: string | null
  created_at: string
}

interface NotificationsClientProps {
  initialNotifications: NotificationItem[]
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMarkRead = async (id: string) => {
    setLoadingId(id)
    setError(null)

    const res = await markNotificationAsReadAction(id)
    setLoadingId(null)

    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
    } else {
      setError(res.error)
    }
  }

  const handleMarkAllRead = async () => {
    setIsClearingAll(true)
    setError(null)

    const res = await markAllNotificationsAsReadAction()
    setIsClearingAll(false)

    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      )
    } else {
      setError(res.error)
    }
  }

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read_at).length

  // Helper to render type icons
  const renderIcon = (type: string, isRead: boolean) => {
    const baseClass = `h-5 w-5 shrink-0 ${isRead ? 'text-muted-foreground' : 'text-primary'}`
    switch (type) {
      case 'application_status_change':
        return <Clock className={baseClass} />
      case 'new_job_alert':
        return <Briefcase className={baseClass} />
      case 'message':
        return <MessageSquare className={baseClass} />
      default:
        return <AlertCircle className={baseClass} />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-border/80">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Notifications Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track status updates, screening committee logs, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            disabled={isClearingAll}
            onClick={handleMarkAllRead}
            className="rounded-xl border-border text-xs font-semibold shrink-0 gap-1.5"
          >
            {isClearingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 text-primary" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Notifications list */}
      <AnimatePresence mode="popLayout">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((item) => {
              const isRead = !!item.read_at
              const isLoading = loadingId === item.id

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card
                    className={`border border-border/80 transition-all rounded-2xl relative shadow-xs overflow-hidden ${
                      isRead ? 'bg-card/70' : 'bg-card border-l-4 border-l-primary'
                    }`}
                  >
                    <CardContent className="p-5 flex gap-4 items-start justify-between">
                      <div className="flex gap-4 items-start min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border/60 ${
                            isRead ? 'bg-muted/50' : 'bg-primary/5'
                          }`}
                        >
                          {renderIcon(item.type, isRead)}
                        </div>
                        
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`text-sm font-bold text-foreground truncate ${isRead ? 'font-semibold' : ''}`}>
                              {item.title}
                            </h3>
                            <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.content}
                          </p>

                          {/* Related Link Action */}
                          {item.link_url && (
                            <Link
                              href={item.link_url}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-wider pt-1 shrink-0"
                            >
                              View details <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Read check action */}
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLoading}
                          onClick={() => handleMarkRead(item.id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl shrink-0 h-8 w-8"
                          title="Mark as read"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12"
          >
            <EmptyState
              title="All Clear!"
              description="You have no notifications or alerts. We will keep you updated when university search committees review your applications."
              icon={Bell}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
