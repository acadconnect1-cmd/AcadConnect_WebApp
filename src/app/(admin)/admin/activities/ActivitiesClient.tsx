'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getActivityLogsAction, ActivityLogItem } from '@/features/admin/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
  Mail
} from 'lucide-react'

interface ActivitiesClientProps {
  initialLogsData: {
    logs: ActivityLogItem[]
    totalCount: number
  }
}

export function ActivitiesClient({ initialLogsData }: ActivitiesClientProps) {
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialLogsData.logs)
  const [totalCount, setTotalCount] = useState(initialLogsData.totalCount)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [emailFilter, setEmailFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')

  // Accordion details
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLogs = useCallback(async (targetPage: number) => {
    setIsLoading(true)
    const res = await getActivityLogsAction({
      emailFilter: emailFilter.trim() || undefined,
      actionFilter: actionFilter.trim() || undefined,
      entityFilter: entityFilter || undefined,
      page: targetPage,
      limit: 15,
    })

    setIsLoading(false)

    if (res.success) {
      setLogs(res.data.logs)
      setTotalCount(res.data.totalCount)
      setPage(targetPage)
    }
  }, [emailFilter, actionFilter, entityFilter])

  // Reload logs on search button triggers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLogs(1)
  }

  const handleClear = () => {
    setEmailFilter('')
    setActionFilter('')
    setEntityFilter('')
    setPage(1)
    
    // Fetch with empty values
    setTimeout(() => {
      setIsLoading(true)
      getActivityLogsAction({ page: 1, limit: 15 }).then((res) => {
        setIsLoading(false)
        if (res.success) {
          setLogs(res.data.logs)
          setTotalCount(res.data.totalCount)
          setPage(1)
        }
      })
    }, 0)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const totalPages = Math.ceil(totalCount / 15)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          System Activity Logs
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Review administrative actions, moderation audits, and monitor background security triggers.
        </p>
      </div>

      {/* Filter Form Panel */}
      <Card className="border border-border/85 bg-card p-5 rounded-2xl shadow-xs">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by admin email..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="pl-9 bg-muted/20 border-border/80 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Action filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Action Type
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="e.g. verify_institution_approved"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="pl-9 bg-muted/20 border-border/80 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Target Entity filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Target Entity
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-muted/20 border border-border/80 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary appearance-none cursor-pointer h-[34px]"
                >
                  <option value="">All Entities</option>
                  <option value="institutions">Institutions</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="profiles">Profiles</option>
                  <option value="jobs">Jobs</option>
                  <option value="applications">Applications</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs font-bold rounded-lg px-4 py-1.5"
            >
              Clear
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg px-5 py-1.5 gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" /> Search
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Logs Table / List */}
      <Card className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Actor</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80 text-xs font-medium text-foreground">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id

                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-muted/10 cursor-pointer ${isExpanded ? 'bg-muted/5' : ''}`}
                        onClick={() => toggleExpand(log.id)}
                      >
                        <td className="p-4 text-center">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-primary">
                          {log.profile?.email || 'System'}
                        </td>
                        <td className="p-4 font-bold">
                          {log.action.replace(/_/g, ' ')}
                        </td>
                        <td className="p-4">
                          <span className="bg-muted text-muted-foreground text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-border/40">
                            {log.target_entity}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">
                          {log.ip_address || 'local/internal'}
                        </td>
                      </tr>
                      
                      {/* Expanded JSON details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-muted/5 px-6 py-4 border-b border-border/80">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5 text-primary" /> Audit Payload Detail
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground font-semibold">User Agent:</span>
                                  <p className="text-foreground mt-0.5 break-all font-sans leading-relaxed">{log.user_agent || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground font-semibold">Target Record ID:</span>
                                  <p className="text-foreground font-mono text-[10px] mt-0.5 break-all">{log.target_id || 'N/A'}</p>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground">Event JSON data:</span>
                                <pre className="bg-zinc-950 text-zinc-200 dark:bg-black dark:text-zinc-400 font-mono text-[10.5px] p-4 rounded-xl border border-border/80 overflow-x-auto leading-relaxed max-w-full">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                    No platform audit log records match filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/80 flex justify-between items-center bg-muted/10 text-xs">
            <span className="text-muted-foreground font-semibold">
              Showing Page {page} of {totalPages} ({totalCount} total entries)
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1 || isLoading}
                onClick={() => fetchLogs(page - 1)}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages || isLoading}
                onClick={() => fetchLogs(page + 1)}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
