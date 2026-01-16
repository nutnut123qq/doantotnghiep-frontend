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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Cog6ToothIcon, 
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { GripVertical } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

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

  const loadLayout = useCallback(async () => {
    try {
      setIsLoading(true)
      const savedLayout = await layoutService.getLayout()
      setLayout(savedLayout)
    } catch (error) {
      console.error('Error loading layout:', error)
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
      alert('Layout saved successfully!')
    } catch (error) {
      console.error('Error saving layout:', error)
      alert('Failed to save layout')
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
      alert('Template applied successfully!')
    } catch (error) {
      console.error('Error applying template:', error)
      alert('Failed to apply template')
    }
  }

  const handleResetLayout = async () => {
    if (confirm('Are you sure you want to reset to default layout?')) {
      try {
        const defaultLayout = await layoutService.resetToDefault()
        setLayout(defaultLayout)
        alert('Layout reset successfully!')
      } catch (error) {
        console.error('Error resetting layout:', error)
        alert('Failed to reset layout')
      }
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
        alert('Layout imported successfully!')
      } else {
        alert('Invalid layout file')
      }
    } catch (error) {
      console.error('Error importing layout:', error)
      alert('Failed to import layout')
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
        return (
          <Card className="h-full overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Watchlist</h3>
              <p className="text-muted-foreground">Watchlist widget - Coming soon</p>
            </div>
          </Card>
        )
      
      case 'alerts':
        return (
          <Card className="h-full overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alerts</h3>
              <p className="text-muted-foreground">Alerts widget - Coming soon</p>
            </div>
          </Card>
        )
      
      case 'portfolio':
        return (
          <Card className="h-full overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
              <p className="text-muted-foreground">Portfolio widget - Coming soon</p>
            </div>
          </Card>
        )
      
      case 'events':
        return (
          <Card className="h-full overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Events</h3>
              <p className="text-muted-foreground">Events widget - Coming soon</p>
            </div>
          </Card>
        )
      
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Edit mode - Drag and resize widgets' : 'Customizable dashboard layout'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <Button
                  onClick={handleSaveLayout}
                  className="flex items-center space-x-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  <span>Save Layout</span>
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Cancel</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center space-x-2"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  <span>Edit Layout</span>
                </Button>
                <Button
                  onClick={() => setShowLayoutManager(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Manage</span>
                </Button>
              </>
            )}
          </div>
        </motion.div>

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
            onReset={handleResetLayout}
            onExport={handleExportLayout}
            onImport={handleImportLayout}
            onClose={() => setShowLayoutManager(false)}
          />
        )}
      </div>
    </div>
  )
}
