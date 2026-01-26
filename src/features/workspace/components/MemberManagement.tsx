import { useState } from 'react'
import { useMemo } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Users, MoreVertical, UserPlus, Crown, Shield, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/shared/components/EmptyState'
import { useRemoveMember, useUpdateMemberRole } from '../hooks/useWorkspaceMembers'
import { notify } from '@/shared/utils/notify'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { workspaceService } from '../services/workspaceService'
import { adminService } from '@/features/admin/services/adminService'

interface Member {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

interface Workspace {
  id: string
  name: string
  owner: string
  members: Member[]
}

interface MemberManagementProps {
  workspace: Workspace
  canManage: boolean
}

const getRoleIcon = (role: Member['role']) => {
  switch (role) {
    case 'owner':
      return Crown
    case 'admin':
      return Shield
    default:
      return User
  }
}

const getRoleColor = (role: Member['role']) => {
  switch (role) {
    case 'owner':
      return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
    case 'admin':
      return 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    default:
      return 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
  }
}

export const MemberManagement = ({ workspace, canManage }: MemberManagementProps) => {
  const queryClient = useQueryClient()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Member'>('Member')
  const [searchQuery, setSearchQuery] = useState('')

  const removeMemberMutation = useRemoveMember(workspace.id)
  const updateRoleMutation = useUpdateMemberRole(workspace.id)

  const members = useMemo(() => workspace.members || [], [workspace.members])

  // Search users for invite
  const { data: searchResults } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: () => adminService.getAllUsers(1, 10),
    enabled: isInviteDialogOpen && searchQuery.length > 2,
  })

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'Owner' | 'Admin' | 'Member' }) => {
      // First, find user by email from search results or fetch
      const users = searchQuery.length > 2 && searchResults
        ? searchResults.users
        : (await adminService.getAllUsers(1, 50)).users
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (!user) {
        throw new Error('User not found')
      }
      
      return workspaceService.addMember(workspace.id, {
        userId: user.id,
        role,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace.id] })
      notify.success('Member invited successfully')
      setIsInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('Member')
      setSearchQuery('')
    },
    onError: (error: Error) => {
      notify.error(error.message || 'Failed to invite member')
    },
  })

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      notify.warning('Please enter an email address')
      return
    }
    addMemberMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })
  }

  const handleRoleChange = async (memberId: string, newRole: 'Owner' | 'Admin' | 'Member') => {
    try {
      await updateRoleMutation.mutateAsync({
        memberUserId: memberId,
        role: newRole,
      })
      notify.success('Member role updated')
    } catch (error) {
      notify.error('Failed to update member role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    
    try {
      await removeMemberMutation.mutateAsync(memberId)
      notify.success('Member removed')
    } catch (error) {
      notify.error('Failed to remove member')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Members ({members.length})</span>
          </CardTitle>
          {canManage && (
            <Button size="sm" className="flex items-center space-x-2" onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              <span>Invite</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members"
            description="Invite team members to collaborate"
          />
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const RoleIcon = getRoleIcon(member.role)
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-[hsl(var(--text))]">
                          {member.name}
                        </span>
                        <Badge className={cn('text-xs', getRoleColor(member.role))}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-[hsl(var(--muted))]">{member.email}</p>
                    </div>
                  </div>
                  {canManage && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'Admin')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {member.role !== 'member' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'Member')}>
                            <User className="h-4 w-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-[hsl(var(--negative))]"
                          disabled={removeMemberMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to invite to this workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value)
                  setSearchQuery(e.target.value)
                }}
                placeholder="user@example.com"
              />
              {searchQuery.length > 2 && searchResults && (
                <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                  {searchResults.users
                    .filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-[hsl(var(--surface-2))] rounded cursor-pointer"
                        onClick={() => {
                          setInviteEmail(user.email)
                          setSearchQuery('')
                        }}
                      >
                        <div className="text-sm font-medium">{user.email}</div>
                        <div className="text-xs text-[hsl(var(--muted))]">{user.role}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div>
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'Owner' | 'Admin' | 'Member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail.trim() || addMemberMutation.isPending}>
                {addMemberMutation.isPending ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
