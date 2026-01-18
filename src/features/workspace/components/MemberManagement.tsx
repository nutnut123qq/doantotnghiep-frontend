import { useMemo } from 'react'
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
import { toast } from 'sonner'

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
  const removeMemberMutation = useRemoveMember(workspace.id)
  const updateRoleMutation = useUpdateMemberRole(workspace.id)

  const members = useMemo(() => workspace.members || [], [workspace.members])

  const handleRoleChange = async (memberId: string, newRole: 'Owner' | 'Admin' | 'Member') => {
    try {
      await updateRoleMutation.mutateAsync({
        memberUserId: memberId,
        role: newRole,
      })
      toast.success('Member role updated')
    } catch (error) {
      toast.error('Failed to update member role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    
    try {
      await removeMemberMutation.mutateAsync(memberId)
      toast.success('Member removed')
    } catch (error) {
      toast.error('Failed to remove member')
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
            <Button size="sm" className="flex items-center space-x-2">
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
    </Card>
  )
}
