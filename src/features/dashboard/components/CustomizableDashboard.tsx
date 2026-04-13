import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout'
import { motion } from 'framer-motion'
import { layoutService } from '../services/layoutService'
import { LayoutConfig, WidgetConfig } from '@/shared/types/layoutTypes'
import { NewsFeed } from './NewsFeed'
import { FinancialReports } from './FinancialReports'
import { TradingViewChart } from './TradingViewChart'
import { AIForecast } from './AIForecast'
import { AlertFeed } from './AlertFeed'
import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { watchlistService } from '@/features/watchlist/services/watchlistService'
import { eventService } from '@/features/events/services/eventService'
import { portfolioService } from '@/features/portfolio/services/portfolioService'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// Compact Watchlist Widget
const WatchlistWidget = () => {
  const { data: watchlists = [], isLoading, error } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getWatchlists(),
  })

  if (isLoading) {
    return (
      <Card className="h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">Watchlist</h3>
          <LoadingSkeleton />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">Watchlist</h3>
          <ErrorState message="Failed to load watchlists" />
        </div>
      </Card>
    )
  }

  const firstWatchlist = watchlists[0]
  const stocks = firstWatchlist?.stocks || []

  return (
    <Card className="h-full overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Watchlist</h3>
          <Link to="/watchlist" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {stocks.length === 0 ? (
          <EmptyState
            title="No stocks"
            description="Add stocks to your watchlist"
          />
        ) : (
          <div className="space-y-2">
            {stocks.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]"
              >
                <div>
                  <div className="font-medium text-sm">{stock.symbol}</div>
                  <div className="text-xs text-[hsl(var(--muted))]">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatNumber(stock.price)}</div>
                  <div
                    className={cn(
                      'text-xs',
                      stock.changePercent >= 0
                        ? 'text-[hsl(var(--positive))]'
                        : 'text-[hsl(var(--negative))]'
                    )}
                  >
                    {stock.changePercent >= 0 ? '+' : ''}
                    {formatPercentage(stock.changePercent)}
                  </div>
                </div>
              </div>
            ))}
            {stocks.length > 5 && (
              <div className="text-xs text-center text-[hsl(var(--muted))] pt-2">
                +{stocks.length - 5} more
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

// Compact Portfolio Widget
const PortfolioWidget = () => {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => portfolioService.getSummary(),
  })

  if (isLoading) {
    return (
      <Card className="h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">Portfolio</h3>
          <LoadingSkeleton />
        </div>
      </Card>
    )
  }

  if (error || !summary) {
    return (
      <Card className="h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">Portfolio</h3>
          <ErrorState message="Failed to load portfolio" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Portfolio</h3>
          <Link to="/portfolio" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-[hsl(var(--muted))] mb-1">Total Value</div>
            <div className="text-lg font-bold">{formatNumber(summary.totalValue)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[hsl(var(--muted))] mb-1">Gain/Loss</div>
              <div
                className={cn(
                  'text-sm font-semibold',
                  summary.totalGainLoss >= 0
                    ? 'text-[hsl(var(--positive))]'
                    : 'text-[hsl(var(--negative))]'
                )}
              >
                {summary.totalGainLoss >= 0 ? '+' : ''}
                {formatNumber(summary.totalGainLoss)} ({formatPercentage(summary.totalGainLossPercentage)})
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[hsl(var(--border))]">
            <div className="text-xs text-[hsl(var(--muted))]">
              Positions: <span className="font-medium">{summary.holdingsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Compact Events Widget
const EventsWidget = () => {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventService.getUpcomingEvents(30),
    staleTime: 60000, // 1 minute
  })

  if (isLoading) {
    return (
      <Card className="h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">Events</h3>
          <LoadingSkeleton />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">Events</h3>
          <ErrorState message="Failed to load events" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Upcoming Events</h3>
          <Link to="/events" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {events.length === 0 ? (
          <EmptyState
            title="No events"
            description="Upcoming events will appear here"
          />
        ) : (
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="p-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.stockTicker?.symbol || 'N/A'}</div>
                    <div className="text-xs text-[hsl(var(--muted))]">{event.title}</div>
                  </div>
                  <div className="text-xs text-[hsl(var(--muted))]">
                    {format(new Date(event.eventDate), 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

interface CustomizableDashboardProps {
  defaultSymbol?: string
}

export const CustomizableDashboard = ({ defaultSymbol = 'VIC' }: CustomizableDashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const symbolFromUrl = searchParams.get('symbol') || defaultSymbol
  const [layout, setLayout] = useState<LayoutConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateSymbolInUrl = useCallback((symbol: string) => {
    const normalizedSymbol = (symbol || '').trim().toUpperCase()
    if (!normalizedSymbol) return
    if (normalizedSymbol === symbolFromUrl) return

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('symbol', normalizedSymbol)
    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams, symbolFromUrl])

  const loadLayout = useCallback(async () => {
    try {
      setIsLoading(true)
      const savedLayout = await layoutService.getLayout()
      setLayout(savedLayout)
    } catch (error) {
      // Silent error - will use default layout
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load layout on mount
  useEffect(() => {
    loadLayout()
  }, [loadLayout])

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.visible) return null

    switch (widget.type) {
      case 'news':
        return <NewsFeed />
      
      case 'financialReports':
        return <FinancialReports symbol={symbolFromUrl} />
      
      case 'chart':
        return (
          <TradingViewChart
            symbol={symbolFromUrl}
            height={widget.h * layout!.rowHeight - 40}
            onSymbolChange={updateSymbolInUrl}
          />
        )
      
      case 'forecast':
        return <AIForecast symbol={symbolFromUrl} />
      
      case 'watchlist':
        return <WatchlistWidget />
      
      case 'alerts':
        return <AlertFeed maxItems={5} />
      
      case 'portfolio':
        return <PortfolioWidget />
      
      case 'events':
        return <EventsWidget />
      
      default:
        return (
          <Card className="h-full">
            <div className="p-6">
              <p className="text-muted-foreground">Unknown widget type: {widget.type}</p>
            </div>
          </Card>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Failed to load layout</p>
      </div>
    )
  }

  // Convert widgets to react-grid-layout format
  const gridLayout: GridLayout[] = layout.widgets
    .filter(w => w.visible)
    .map(widget => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW,
      minH: widget.minH,
      maxW: widget.maxW,
      maxH: widget.maxH,
    }))

  return (
    <div className="p-8 animate-fade-in">
      <div className="w-full mx-auto">
        {/* Header with controls */}
        <PageHeader
          title="Dashboard"
          description="Customizable dashboard layout"
        />

        {/* Grid Layout */}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: layout.cols, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={layout.rowHeight}
          isDraggable={false}
          isResizable={false}
          draggableHandle=".drag-handle"
          containerPadding={[0, 0]}
          margin={[24, 24]}
        >
          {layout.widgets.filter(w => w.visible).map((widget, index) => (
            <div key={widget.id} className="relative h-full w-full min-h-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="h-full w-full min-h-0"
              >
                {renderWidget(widget)}
              </motion.div>
            </div>
          ))}
        </ResponsiveGridLayout>

      </div>
    </div>
  )
}
