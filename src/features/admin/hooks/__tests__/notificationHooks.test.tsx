import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotificationTemplates } from '../useNotificationTemplates'
import { usePushConfig } from '../usePushConfig'
import { notificationTemplateService } from '../../services/notificationTemplateService'
import { NotificationEventType } from '@/shared/types/notificationTemplateTypes'

vi.mock('../../services/notificationTemplateService', () => ({
  notificationTemplateService: {
    getAll: vi.fn(),
    delete: vi.fn(),
    previewTemplate: vi.fn(),
    getPushConfig: vi.fn(),
  },
}))

const toastErrorMock = vi.fn()
const toastSuccessMock = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}))

describe('notification hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and groups templates successfully', async () => {
    vi.mocked(notificationTemplateService.getAll).mockResolvedValue([
      {
        id: '1',
        name: 'PriceAlert',
        eventType: NotificationEventType.PriceAlert,
        subject: 'sub',
        body: 'body',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ])

    const { result } = renderHook(() => useNotificationTemplates())

    await act(async () => {
      await result.current.loadTemplates()
    })

    expect(result.current.groupedTemplates[NotificationEventType.PriceAlert]?.length).toBe(1)
  })

  it('shows toast on template loading error', async () => {
    vi.mocked(notificationTemplateService.getAll).mockRejectedValue(new Error('load failed'))

    const { result } = renderHook(() => useNotificationTemplates())

    await act(async () => {
      await result.current.loadTemplates()
    })

    expect(toastErrorMock).toHaveBeenCalled()
  })

  it('loads push config successfully', async () => {
    vi.mocked(notificationTemplateService.getPushConfig).mockResolvedValue({
      id: 'cfg-1',
      serviceName: 'Firebase',
      isEnabled: true,
      createdAt: '',
      updatedAt: '',
    })

    const { result } = renderHook(() => usePushConfig())
    await act(async () => {
      await result.current.loadPushConfig()
    })

    expect(result.current.pushConfig?.id).toBe('cfg-1')
  })

  it('shows toast on push config loading error', async () => {
    vi.mocked(notificationTemplateService.getPushConfig).mockRejectedValue(
      new Error('failed')
    )

    const { result } = renderHook(() => usePushConfig())
    await act(async () => {
      await result.current.loadPushConfig()
    })

    expect(toastErrorMock).toHaveBeenCalled()
  })
})
