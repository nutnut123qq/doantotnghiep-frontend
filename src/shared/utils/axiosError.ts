import type { AxiosError } from 'axios'

type AxiosErrorPayload = {
  message?: string
}

export const getAxiosErrorMessage = (err: unknown): string => {
  if (!err) return 'Unknown error'
  const axiosError = err as AxiosError<AxiosErrorPayload>
  return (
    axiosError.response?.data?.message ??
    axiosError.message ??
    'Unknown error'
  )
}
