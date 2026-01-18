import { useEffect, useState } from 'react'
import { adminService } from '../services/adminService'
import { UserRole, type User } from '../../../shared/types/adminTypes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { Users, RefreshCw, Shield, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllUsers(currentPage, pageSize)
      setUsers(data.users)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      await loadUsers()
    } catch (err) {
      console.error('Error updating user role:', err)
      toast.error('Failed to update user role')
    }
  }

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.setUserStatus(userId, !currentStatus)
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      await loadUsers()
    } catch (err) {
      console.error('Error updating user status:', err)
      toast.error('Failed to update user status')
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && users.length === 0) {
    return <LoadingSkeleton />
  }

  if (error && users.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={loadUsers}
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
        <Button onClick={loadUsers} variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-[hsl(var(--text))]">
                            {user.email}
                          </div>
                          <div className="text-xs text-[hsl(var(--muted))]">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role.toString()}
                          onValueChange={(value) => handleRoleChange(user.id, parseInt(value))}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.Investor.toString()}>
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4" />
                                <span>Investor</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={UserRole.Admin.toString()}>
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Admin</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={UserRole.Premium.toString()}>
                              Premium
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                      <TableCell className="text-sm text-[hsl(var(--muted))]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleStatusToggle(user.id, user.isActive)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
