import type { AxiosError } from 'axios'

type AxiosErrorPayload = {
  message?: string
  error?: string
}

export const getAxiosErrorMessage = (err: unknown): string => {
  if (!err) return 'Unknown error'
  const axiosError = err as AxiosError<AxiosErrorPayload>
  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    axiosError.message ??
    'Unknown error'
  )
}
