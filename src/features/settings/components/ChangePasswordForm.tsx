import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import type { ChangePasswordRequest } from '@/features/auth/types/auth.types'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useToast } from '@/shared/hooks/useToast'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

const schema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must not exceed 100 characters')
    .matches(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'New password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'New password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'New password must contain at least one special character')
    .notOneOf([yup.ref('oldPassword')], 'New password must be different from current password'),
  confirmNewPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'New passwords must match'),
})

type Props = {
  onCancel: () => void
}

export const ChangePasswordForm = ({ onCancel }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuthContext()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordRequest>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ChangePasswordRequest) => {
    try {
      setIsSubmitting(true)
      const response = await authService.changePassword(data)
      toast.success(response.message || 'Password changed successfully. Please sign in again.')
      logout()
      navigate('/login')
    } catch (err: unknown) {
      const errorMessage = getAxiosErrorMessage(err)
      toast.error(errorMessage === 'Unknown error' ? 'Failed to change password. Please try again.' : errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4 p-4 rounded-lg border border-slate-200 dark:border-slate-600" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
        <input
          type="password"
          {...register('oldPassword')}
          autoComplete="current-password"
          className={`w-full border rounded-lg px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.oldPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
          placeholder="Enter current password"
        />
        {errors.oldPassword && <p className="mt-1 text-sm text-red-500">{errors.oldPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
        <input
          type="password"
          {...register('newPassword')}
          autoComplete="new-password"
          className={`w-full border rounded-lg px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.newPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
          placeholder="Enter new password"
        />
        {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
        <input
          type="password"
          {...register('confirmNewPassword')}
          autoComplete="new-password"
          className={`w-full border rounded-lg px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.confirmNewPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
          placeholder="Re-enter new password"
        />
        {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmNewPassword.message}</p>}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Changing...' : 'Confirm Password Change'}
        </button>
      </div>
    </form>
  )
}
