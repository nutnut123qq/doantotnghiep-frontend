import { useEffect, useState, useCallback } from 'react'
import { adminService } from '../services/adminService'
import { type User } from '../../../shared/types/adminTypes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { logger } from '@/shared/utils/logger'

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUsers = useCallback(async (page: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllUsers(page, pageSize)
      setUsers(data.users)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError('Failed to load users')
      logger.error('Error loading users', { error: err })
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    loadUsers(currentPage)
  }, [currentPage, loadUsers])

  const openBanConfirm = (user: User) => {
    setSelectedUser(user)
    setIsBanConfirmOpen(true)
  }

  const handleBanToggle = useCallback(async () => {
    if (!selectedUser) return
    try {
      setActionLoading(selectedUser.id)
      await adminService.setUserStatus(selectedUser.id, !selectedUser.isActive)
      toast.success(`User ${!selectedUser.isActive ? 'banned' : 'unbanned'} successfully`)
      setIsBanConfirmOpen(false)
      await loadUsers(currentPage)
    } catch (err) {
      logger.error('Error toggling user ban status', { error: err, userId: selectedUser?.id })
      toast.error('Failed to update user status')
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser, currentPage, loadUsers])

  const roleLabels: Record<string, string> = {
    Investor: 'Investor',
    Admin: 'Admin',
    Premium: 'Premium',
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && users.length === 0) {
    return <LoadingSkeleton />
  }

  if (error && users.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadUsers(currentPage)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--text))]">User Management</h2>
          <p className="text-sm text-[hsl(var(--muted))] mt-1">
            Total {totalCount} users
          </p>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No users found"
                description="No users match the current filters"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isBusy = actionLoading === user.id
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-[hsl(var(--text))]">
                              {user.email}
                            </div>
                            {user.fullName && (
                              <div className="text-xs text-[hsl(var(--muted))]">
                                Name: {user.fullName}
                              </div>
                            )}
                            <div className="text-xs text-[hsl(var(--muted))]">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabels[user.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              user.isActive
                                ? 'bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]'
                                : 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]'
                            )}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[hsl(var(--text))]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={user.isActive ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => openBanConfirm(user)}
                            disabled={isBusy}
                          >
                            {user.isActive ? 'Ban' : 'Unban'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isBanConfirmOpen}
        onOpenChange={setIsBanConfirmOpen}
        title={selectedUser?.isActive ? 'Ban user' : 'Unban user'}
        description={
          selectedUser?.isActive
            ? 'Are you sure you want to ban this user account?'
            : 'Are you sure you want to unban this user account?'
        }
        confirmText={selectedUser?.isActive ? 'Ban' : 'Unban'}
        variant={selectedUser?.isActive ? 'destructive' : 'default'}
        onConfirm={handleBanToggle}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[hsl(var(--muted))]">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
