import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { layoutService } from '../services/layoutService'
import { LayoutConfig, WidgetConfig } from '@/shared/types/layoutTypes'
import { LayoutManager } from './LayoutManager'
import { NewsFeed } from './NewsFeed'
import { FinancialReports } from './FinancialReports'
import { TradingViewChart } from './TradingViewChart'
import { AIForecast } from './AIForecast'
import { AlertFeed } from './AlertFeed'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Pencil,
  Check,
  X,
  GripVertical
} from 'lucide-react'
import { notify } from '@/shared/utils/notify'
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
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
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
  const [searchParams] = useSearchParams()
  const symbolFromUrl = searchParams.get('symbol') || defaultSymbol
  const [layout, setLayout] = useState<LayoutConfig | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLayoutManager, setShowLayoutManager] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

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

  const handleLayoutChange = useCallback((newGridLayout: GridLayout[]) => {
    if (!layout || !isEditMode) return

    // Update widget positions
    const updatedWidgets = layout.widgets.map(widget => {
      const gridItem = newGridLayout.find(item => item.i === widget.id)
      if (gridItem) {
        return {
          ...widget,
          x: gridItem.x,
          y: gridItem.y,
          w: gridItem.w,
          h: gridItem.h,
        }
      }
      return widget
    })

    const updatedLayout: LayoutConfig = {
      ...layout,
      widgets: updatedWidgets,
    }

    setLayout(updatedLayout)
  }, [layout, isEditMode])

  const handleSaveLayout = async () => {
    if (!layout) return

    try {
      await layoutService.saveLayout(layout)
      setIsEditMode(false)
      notify.success('Layout saved successfully!')
    } catch (error) {
      notify.error('Failed to save layout')
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    loadLayout() // Reload original layout
  }

  const handleApplyTemplate = async (templateId: string) => {
    try {
      const newLayout = await layoutService.applyTemplate(templateId)
      setLayout(newLayout)
      setShowLayoutManager(false)
      notify.success('Template applied successfully!')
    } catch (error) {
      notify.error('Failed to apply template')
    }
  }

  const handleResetLayoutClick = () => {
    setResetConfirmOpen(true)
  }

  const handleResetLayout = async () => {
    try {
      const defaultLayout = await layoutService.resetToDefault()
      setLayout(defaultLayout)
      notify.success('Layout reset successfully!')
    } catch (error) {
      notify.error('Failed to reset layout')
    }
  }

  const handleExportLayout = () => {
    if (layout) {
      layoutService.exportLayout(layout)
    }
  }

  const handleImportLayout = async (file: File) => {
    try {
      const importedLayout = await layoutService.importLayout(file)
      
      if (layoutService.validateLayout(importedLayout)) {
        await layoutService.saveLayout(importedLayout)
        setLayout(importedLayout)
        notify.success('Layout imported successfully!')
      } else {
        notify.error('Invalid layout file')
      }
    } catch (error) {
      notify.error('Failed to import layout')
    }
  }

  const handleShareLayout = async (isPublic: boolean, expiresInDays: number) => {
    if (!layout) {
      throw new Error('Layout not loaded')
    }

    return await layoutService.shareLayout(layout, isPublic, expiresInDays)
  }

  const handleImportByCode = async (code: string) => {
    const importedLayout = await layoutService.importLayoutByCode(code)
    if (!layoutService.validateLayout(importedLayout)) {
      throw new Error('Invalid layout configuration')
    }
    return importedLayout
  }

  const handleApplyImportedLayout = async (importedLayout: LayoutConfig) => {
    try {
      if (layoutService.validateLayout(importedLayout)) {
        await layoutService.saveLayout(importedLayout)
        setLayout(importedLayout)
        setShowLayoutManager(false)
        notify.success('Layout imported successfully!')
      } else {
        notify.error('Invalid layout configuration')
      }
    } catch (error) {
      notify.error('Failed to apply imported layout')
    }
  }

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.visible) return null

    switch (widget.type) {
      case 'news':
        return <NewsFeed />
      
      case 'financialReports':
        return <FinancialReports symbol={symbolFromUrl} />
      
      case 'chart':
        return <TradingViewChart symbol={symbolFromUrl} height={widget.h * layout!.rowHeight - 40} />
      
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
          description={isEditMode ? 'Edit mode - Drag and resize widgets' : 'Customizable dashboard layout'}
          actions={
            <div className="flex items-center space-x-2">
              {isEditMode ? (
                <>
                  <Button
                    onClick={handleSaveLayout}
                    className="flex items-center space-x-2"
                  >
                    <Check className="h-5 w-5" />
                    <span>Save Layout</span>
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center space-x-2"
                  >
                    <Pencil className="h-5 w-5" />
                    <span>Edit Layout</span>
                  </Button>
                  <Button
                    onClick={() => setShowLayoutManager(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Manage</span>
                  </Button>
                </>
              )}
            </div>
          }
        />

        {/* Edit mode banner */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Edit Mode:</strong> Drag widgets to reposition, resize using the corner handle. Click "Save Layout" when done.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Layout */}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: layout.cols, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={layout.rowHeight}
          isDraggable={isEditMode && layout.isDraggable}
          isResizable={isEditMode && layout.isResizable}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          containerPadding={[0, 0]}
          margin={[24, 24]}
        >
          {layout.widgets.filter(w => w.visible).map((widget, index) => (
            <div key={widget.id} className="relative h-full w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="h-full w-full"
              >
                {isEditMode && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="drag-handle absolute top-2 left-2 z-10"
                  >
                    <Badge variant="default" className="cursor-move flex items-center space-x-1">
                      <GripVertical className="h-3 w-3" />
                      <span className="text-xs font-medium">{widget.type}</span>
                    </Badge>
                  </motion.div>
                )}
                {renderWidget(widget)}
              </motion.div>
            </div>
          ))}
        </ResponsiveGridLayout>

        {/* Layout Manager Modal */}
        {showLayoutManager && (
          <LayoutManager
            currentLayout={layout}
            onApplyTemplate={handleApplyTemplate}
            onReset={handleResetLayoutClick}
            onExport={handleExportLayout}
            onImport={handleImportLayout}
            onShareLayout={handleShareLayout}
            onImportByCode={handleImportByCode}
            onApplyImportedLayout={handleApplyImportedLayout}
            onClose={() => setShowLayoutManager(false)}
          />
        )}

        {/* Reset Confirm Dialog */}
        <ConfirmDialog
          open={resetConfirmOpen}
          onOpenChange={setResetConfirmOpen}
          title="Reset Layout"
          description="Are you sure you want to reset to default layout? This action cannot be undone."
          confirmText="Reset"
          cancelText="Cancel"
          onConfirm={handleResetLayout}
          variant="destructive"
        />
      </div>
    </div>
  )
}
