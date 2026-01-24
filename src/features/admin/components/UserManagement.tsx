import { useEffect, useState, useCallback } from 'react'
import { adminService } from '../services/adminService'
import { UserRole, type User } from '../../../shared/types/adminTypes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { Users, RefreshCw, Plus, Pencil, KeyRound, Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: UserRole.Investor,
  })
  const [editForm, setEditForm] = useState({
    email: '',
    fullName: '',
    role: UserRole.Investor,
  })
  const [resetPassword, setResetPassword] = useState('')

  const loadUsers = useCallback(async (page: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllUsers(page, pageSize)
      setUsers(data.users)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    loadUsers(currentPage)
  }, [currentPage, loadUsers])

  const isUserLocked = (user: User) => {
    return (
      user.lockoutEnabled &&
      !!user.lockoutEnd &&
      new Date(user.lockoutEnd).getTime() > Date.now()
    )
  }

  const openCreateModal = () => {
    setCreateForm({ email: '', password: '', fullName: '', role: UserRole.Investor })
    setIsCreateOpen(true)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      email: user.email,
      fullName: user.fullName ?? '',
      role: user.role,
    })
    setIsEditOpen(true)
  }

  const openResetModal = (user: User) => {
    setSelectedUser(user)
    setResetPassword('')
    setIsResetOpen(true)
  }

  const openLockConfirm = (user: User) => {
    setSelectedUser(user)
    setIsLockConfirmOpen(true)
  }

  const handleCreateUser = useCallback(async () => {
    try {
      setActionLoading('create')
      await adminService.createUser({
        email: createForm.email,
        password: createForm.password,
        fullName: createForm.fullName || undefined,
        role: createForm.role,
      })
      toast.success('User created successfully')
      setIsCreateOpen(false)
      await loadUsers(currentPage)
    } catch (err) {
      console.error('Error creating user:', err)
      toast.error('Failed to create user')
    } finally {
      setActionLoading(null)
    }
  }, [createForm, currentPage, loadUsers])

  const handleUpdateUser = useCallback(async () => {
    if (!selectedUser) return
    try {
      setActionLoading(selectedUser.id)
      await adminService.updateUser(selectedUser.id, {
        email: editForm.email,
        fullName: editForm.fullName || undefined,
        role: editForm.role,
      })
      toast.success('User updated successfully')
      setIsEditOpen(false)
      await loadUsers(currentPage)
    } catch (err) {
      console.error('Error updating user:', err)
      toast.error('Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser, editForm, currentPage, loadUsers])

  const handleResetPassword = useCallback(async () => {
    if (!selectedUser) return
    try {
      setActionLoading(selectedUser.id)
      await adminService.resetUserPassword(selectedUser.id, resetPassword)
      toast.success('Password reset successfully')
      setIsResetOpen(false)
      await loadUsers(currentPage)
    } catch (err) {
      console.error('Error resetting password:', err)
      toast.error('Failed to reset password')
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser, resetPassword, currentPage, loadUsers])

  const handleLockToggle = useCallback(async () => {
    if (!selectedUser) return
    try {
      setActionLoading(selectedUser.id)
      if (isUserLocked(selectedUser)) {
        await adminService.unlockUser(selectedUser.id)
        toast.success('User unlocked successfully')
      } else {
        await adminService.lockUser(selectedUser.id)
        toast.success('User locked successfully')
      }
      setIsLockConfirmOpen(false)
      await loadUsers(currentPage)
    } catch (err) {
      console.error('Error toggling user lock:', err)
      toast.error('Failed to update user lock')
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser, currentPage, loadUsers])

  const handleStatusToggle = useCallback(async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId)
      await adminService.setUserStatus(userId, !currentStatus)
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      await loadUsers(currentPage)
    } catch (err) {
      console.error('Error updating user status:', err)
      toast.error('Failed to update user status')
    } finally {
      setActionLoading(null)
    }
  }, [currentPage, loadUsers])

  const roleLabels: Record<UserRole, string> = {
    [UserRole.Investor]: 'Investor',
    [UserRole.Admin]: 'Admin',
    [UserRole.Premium]: 'Premium',
  }

  const selectedLocked = selectedUser ? isUserLocked(selectedUser) : false
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
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateModal} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </Button>
          <Button onClick={() => loadUsers(currentPage)} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
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
                    const locked = isUserLocked(user)
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
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={cn(
                                user.isActive
                                  ? 'bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]'
                                  : 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]'
                              )}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {locked && (
                              <Badge className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
                                Locked
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted))]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              disabled={isBusy}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResetModal(user)}
                              disabled={isBusy}
                            >
                              <KeyRound className="h-4 w-4 mr-1" />
                              Reset
                            </Button>
                            <Button
                              variant={locked ? 'default' : 'destructive'}
                              size="sm"
                              onClick={() => openLockConfirm(user)}
                              disabled={isBusy}
                            >
                              {locked ? (
                                <Unlock className="h-4 w-4 mr-1" />
                              ) : (
                                <Lock className="h-4 w-4 mr-1" />
                              )}
                              {locked ? 'Unlock' : 'Lock'}
                            </Button>
                            <Button
                              variant={user.isActive ? 'destructive' : 'default'}
                              size="sm"
                              onClick={() => handleStatusToggle(user.id, user.isActive)}
                              disabled={isBusy}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={createForm.fullName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="New password"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={createForm.role.toString()}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, role: Number(value) as UserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.Investor.toString()}>Investor</SelectItem>
                  <SelectItem value={UserRole.Admin.toString()}>Admin</SelectItem>
                  <SelectItem value={UserRole.Premium.toString()}>Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                actionLoading === 'create' ||
                !createForm.email.trim() ||
                !createForm.password.trim()
              }
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={editForm.fullName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editForm.role.toString()}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, role: Number(value) as UserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.Investor.toString()}>Investor</SelectItem>
                  <SelectItem value={UserRole.Admin.toString()}>Admin</SelectItem>
                  <SelectItem value={UserRole.Premium.toString()}>Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={!!selectedUser && actionLoading === selectedUser.id}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={!resetPassword.trim() || (!!selectedUser && actionLoading === selectedUser.id)}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isLockConfirmOpen}
        onOpenChange={setIsLockConfirmOpen}
        title={selectedLocked ? 'Unlock user' : 'Lock user'}
        description={
          selectedLocked
            ? 'Are you sure you want to unlock this user account?'
            : 'Are you sure you want to lock this user account?'
        }
        confirmText={selectedLocked ? 'Unlock' : 'Lock'}
        variant={selectedLocked ? 'default' : 'destructive'}
        onConfirm={handleLockToggle}
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
