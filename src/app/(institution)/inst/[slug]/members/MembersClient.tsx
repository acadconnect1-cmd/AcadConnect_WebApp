'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { inviteMemberAction, updateMemberRoleAction, removeMemberAction } from '@/features/institutions/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, UserPlus, Users, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'

interface TeamMemberItem {
  id: string
  role: 'owner' | 'admin' | 'recruiter' | 'viewer'
  created_at: string
  profile_id: string
  profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

interface MembersClientProps {
  institutionId: string
  slug: string
  initialMembers: TeamMemberItem[]
  activeUserId: string
  activeUserRole: string
  isPlatformAdmin: boolean
}

export function MembersClient({
  institutionId,
  slug,
  initialMembers,
  activeUserId,
  activeUserRole,
  isPlatformAdmin,
}: MembersClientProps) {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMemberItem[]>(initialMembers)
  const [emailInput, setEmailInput] = useState('')
  const [roleInput, setRoleInput] = useState<'owner' | 'admin' | 'recruiter' | 'viewer'>('recruiter')
  
  // Loader and Alert states
  const [isInviting, setIsInviting] = useState(false)
  const [actionMemberId, setActionMemberId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isWriteAuthorized = activeUserRole === 'owner' || activeUserRole === 'admin' || isPlatformAdmin

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return

    setIsInviting(true)
    setMessage(null)

    const res = await inviteMemberAction({
      institutionId,
      email: emailInput.trim(),
      role: roleInput,
    })

    setIsInviting(false)

    if (res.success) {
      setMessage({ type: 'success', text: `Roster invitation successfully added to ${emailInput}!` })
      setEmailInput('')
      
      // Auto-reload or re-fetch list to show the new member
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  const handleRoleChange = async (memberId: string, role: 'owner' | 'admin' | 'recruiter' | 'viewer') => {
    setActionMemberId(memberId)
    setMessage(null)

    const res = await updateMemberRoleAction({
      institutionId,
      memberId,
      role,
    })

    setActionMemberId(null)

    if (res.success) {
      setMessage({ type: 'success', text: 'Team member role updated successfully!' })
      setMembers(members.map(m => m.id === memberId ? { ...m, role } : m))
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the institution?')) return

    setActionMemberId(memberId)
    setMessage(null)

    const res = await removeMemberAction({
      institutionId,
      memberId,
    })

    setActionMemberId(null)

    if (res.success) {
      setMessage({ type: 'success', text: 'Team member removed successfully!' })
      setMembers(members.filter(m => m.id !== memberId))
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          Recruitment Team
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Manage recruiter access roles and coordinate applicant screening profiles.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
          message.type === 'success'
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400'
            : 'bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/5 dark:border-destructive/10 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Invite Panel vs Team list */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Invite Panel */}
        <div className="lg:col-span-1">
          {isWriteAuthorized ? (
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-xs">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary shrink-0" /> Invite Recruiter
                </CardTitle>
                <CardDescription className="text-xs">Add registered AcadConnect users to your school roster.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">User Email Address</label>
                    <Input
                      type="email"
                      placeholder="recruiter@university.edu"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Roster Access Role</label>
                    <select
                      value={roleInput}
                      onChange={(e: any) => setRoleInput(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs sm:text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="viewer">Viewer (Read-only)</option>
                      <option value="admin">Administrator</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isInviting}
                    className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl gap-1.5 shadow-md shadow-primary/5 text-xs mt-2"
                  >
                    {isInviting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                    Add Team Member
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-xs">
              <CardContent className="p-0 text-center py-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-sm font-bold text-foreground">Access Restricted</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Only owners or administrators can add team members or edit authorization settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Team Members List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary shrink-0" /> Active Roster ({members.length})
          </h2>

          <div className="space-y-4">
            {members.map((member) => {
              const profiles = member.profiles as any
              const name = profiles ? `${profiles.first_name} ${profiles.last_name}` : 'Academic Recruiter'
              const email = profiles?.email || 'email@university.edu'
              const isOwnAccount = member.profile_id === activeUserId
              const loading = actionMemberId === member.id

              return (
                <Card 
                  key={member.id} 
                  className="border border-border/80 bg-card p-5 rounded-2xl hover:shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                        {name}
                      </h3>
                      {isOwnAccount && (
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider py-0.2 px-1">
                          You
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {email}
                    </p>
                    
                    <p className="text-[10px] text-muted-foreground/85 font-semibold mt-1">
                      Joined: {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Member administration commands */}
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-border/60 pt-4 sm:pt-0 justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      <select
                        disabled={!isWriteAuthorized || isOwnAccount || loading}
                        value={member.role}
                        onChange={(e: any) => handleRoleChange(member.id, e.target.value)}
                        className="h-8 px-2 bg-background border border-input rounded-lg text-xs focus-visible:outline-hidden disabled:opacity-75"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!isWriteAuthorized || isOwnAccount || loading}
                      onClick={() => handleRemoveMember(member.id)}
                      className="rounded-lg h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20 shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
