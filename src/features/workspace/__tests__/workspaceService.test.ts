import { describe, it, expect, beforeEach, vi } from 'vitest'
import { workspaceService } from '../services/workspaceService'
import { apiClient } from '@/infrastructure/api/apiClient'

vi.mock('@/infrastructure/api/apiClient')

describe('workspaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets shared watchlists with typed response contract', async () => {
    const payload = [
      {
        id: 'rel-1',
        watchlistId: 'wl-1',
        workspaceId: 'ws-1',
        watchlist: {
          id: 'wl-1',
          name: 'Tech',
          tickers: [{ symbol: 'FPT', name: 'FPT Corp' }],
        },
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: payload } as never)

    const result = await workspaceService.getSharedWatchlists('ws-1')

    expect(apiClient.get).toHaveBeenCalledWith('/Workspace/ws-1/watchlists')
    expect(result[0].watchlist?.tickers[0].symbol).toBe('FPT')
  })

})
