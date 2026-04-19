import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { NewsFeed } from './NewsFeed'
import { TradingViewChart } from './TradingViewChart'
import { AIForecast } from './AIForecast'
import { FinancialReports } from './FinancialReports'
import { PageHeader } from '@/shared/components/PageHeader'

const DEFAULT_SYMBOL = 'VIC'

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const symbolFromUrl = (searchParams.get('symbol') || DEFAULT_SYMBOL).toUpperCase()

  const updateSymbolInUrl = useCallback(
    (symbol: string) => {
      const normalized = (symbol || '').trim().toUpperCase()
      if (!normalized || normalized === symbolFromUrl) return
      const next = new URLSearchParams(searchParams)
      next.set('symbol', normalized)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams, symbolFromUrl]
  )

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Dashboard"
          description="Market overview, alerts, and insights at a glance"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-8 min-h-0"
          >
            <Card className="h-full min-h-0 bg-[hsl(var(--surface-1))]">
              <CardContent className="p-4 min-h-0">
                <TradingViewChart
                  symbol={symbolFromUrl}
                  height={460}
                  onSymbolChange={updateSymbolInUrl}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 flex min-h-0 flex-col"
          >
            <AIForecast symbol={symbolFromUrl} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-8 min-h-0"
          >
            <FinancialReports symbol={symbolFromUrl} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 min-h-0 flex flex-col"
          >
            <NewsFeed />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
