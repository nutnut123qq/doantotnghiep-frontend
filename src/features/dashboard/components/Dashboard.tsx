import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { NewsFeed } from './NewsFeed'
import { MarketOverview } from './MarketOverview'
import { TopMovers } from './TopMovers'
import { AlertFeed } from './AlertFeed'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { useQuery } from '@tanstack/react-query'
import { watchlistService } from '@/features/watchlist/services/watchlistService'

export const Dashboard = () => {
  // Fetch watchlists for snapshot
  const { data: watchlists } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getWatchlists(),
  })

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Market overview, alerts, and insights at a glance"
        />

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MarketOverview />
        </motion.div>

        {/* Top Movers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TopMovers />
        </motion.div>

        {/* Watchlist Snapshot */}
        {watchlists && watchlists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-[hsl(var(--text))]">
                    Watchlist Snapshot
                  </h3>
                  <div className="space-y-2">
                    {watchlists.slice(0, 5).map((watchlist) => (
                      <div
                        key={watchlist.id}
                        className="flex items-center justify-between p-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-[hsl(var(--text))]">
                            {watchlist.name}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted))]">
                            ({watchlist.stocks.length} stocks)
                          </span>
                        </div>
                        {watchlist.stocks.length > 0 && (
                          <div className="flex items-center space-x-2">
                            {watchlist.stocks.slice(0, 3).map((stock) => (
                              <span
                                key={stock.symbol}
                                className="text-xs font-medium tabular-nums px-2 py-1 rounded bg-[hsl(var(--surface-3))] text-[hsl(var(--text))]"
                              >
                                {stock.symbol}
                              </span>
                            ))}
                            {watchlist.stocks.length > 3 && (
                              <span className="text-xs text-[hsl(var(--muted))]">
                                +{watchlist.stocks.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alert Feed & News Digest */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AlertFeed />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardContent className="pt-6">
                <h3 className="text-base font-semibold text-[hsl(var(--text))] mb-4">
                  News Digest
                </h3>
                <NewsFeed />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
