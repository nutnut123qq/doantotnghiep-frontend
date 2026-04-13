import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { watchlistService } from '@/features/watchlist/services/watchlistService'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import { useTradingBoard } from '../hooks/useTradingBoard'
import { ColumnCustomizationModal } from './ColumnCustomizationModal'
import { columnPreferencesService } from '../services/columnPreferencesService'
import type { TradingBoardFilters as TradingBoardFiltersType } from '../services/tradingBoardService'
import type { TradingBoardColumnPreferences } from '../types/columnTypes'
import {
  DEFAULT_COLUMN_ORDER,
  ALL_CUSTOMIZABLE_COLUMN_IDS,
  type ColumnId,
} from '../types/columnTypes'
import type { StockTicker } from '@/domain/entities/StockTicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import { ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { effectivePrice, hasQuotablePrice } from '@/lib/stockTickerNormalize'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/shared/components/PageHeader'
import { TradingBoardFilters } from './TradingBoardFilters'
import { DensityToggle } from './DensityToggle'
import { EmptyState } from '@/shared/components/EmptyState'
import { BarChart3, Bell, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { notify } from '@/shared/utils/notify'

export const TradingBoard = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TradingBoardFiltersType>({})
  const [debouncedFilters, setDebouncedFilters] = useState<TradingBoardFiltersType>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([...DEFAULT_COLUMN_ORDER])
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact')
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false)
  const [selectedTickerForWatchlist, setSelectedTickerForWatchlist] = useState<string | null>(null)
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>('')

  const formatExchange = (exchange: unknown) => {
    if (exchange === 'HOSE' || exchange === 'HNX' || exchange === 'UPCOM') return exchange
    if (exchange === 1 || exchange === '1') return 'HOSE'
    if (exchange === 2 || exchange === '2') return 'HNX'
    if (exchange === 3 || exchange === '3') return 'UPCOM'
    return 'N/A'
  }

  const hasValidQuote = (ticker: StockTicker) => hasQuotablePrice(ticker)
  // Debounce filters (especially industry) to avoid refetch on every keypress
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [filters])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms debounce for search

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { tickers: baseTickers, isLoading, error } = useTradingBoard(debouncedFilters)

  // Fetch watchlists for filter
  const { data: watchlistsData } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getWatchlists(),
  })

  // Ensure watchlists is always an array
  const watchlists = Array.isArray(watchlistsData) ? watchlistsData : []

  useEffect(() => {
    loadColumnPreferences()
  }, [])

  const buildVisibility = (visibleColumns: string[]) => {
    const visibleSet = new Set(visibleColumns)
    const visibility: VisibilityState = {}
    for (const id of ALL_CUSTOMIZABLE_COLUMN_IDS) {
      visibility[id] = visibleSet.has(id)
    }
    return visibility
  }

  const buildFullColumnOrder = (prefs: TradingBoardColumnPreferences) => {
    const allowed = new Set<string>(ALL_CUSTOMIZABLE_COLUMN_IDS)
    const order = (
      prefs.columnOrder?.length ? [...prefs.columnOrder] : [...DEFAULT_COLUMN_ORDER]
    ).filter((id) => allowed.has(id as ColumnId))
    const seen = new Set(order)
    for (const id of ALL_CUSTOMIZABLE_COLUMN_IDS) {
      if (!seen.has(id)) {
        order.push(id)
        seen.add(id)
      }
    }
    return order
  }

  const loadColumnPreferences = async () => {
    try {
      const prefs = await columnPreferencesService.getColumnPreferences()
      setColumnVisibility(buildVisibility(prefs.visibleColumns ?? DEFAULT_COLUMN_ORDER))
      setColumnOrder(buildFullColumnOrder(prefs))
    } catch (error) {
      // Silent error - column preferences are optional, fallback to defaults
      // notify.error('Failed to load column preferences', { silent: true })
    }
  }

  const handleSaveColumnPreferences = (prefs: TradingBoardColumnPreferences) => {
    setColumnVisibility(buildVisibility(prefs.visibleColumns))
    setColumnOrder(buildFullColumnOrder(prefs))
  }

  const filteredBaseTickers = useMemo(() => {
    if (!debouncedSearchQuery) return baseTickers
    const query = debouncedSearchQuery.toLowerCase()
    return baseTickers.filter(
      (ticker) =>
        ticker.symbol.toLowerCase().includes(query) ||
        ticker.name?.toLowerCase().includes(query)
    )
  }, [baseTickers, debouncedSearchQuery])

  const handleFilterChange = (key: keyof TradingBoardFiltersType, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
    }))
  }

  const handleAddToWatchlistClick = (symbol: string) => {
    setSelectedTickerForWatchlist(symbol)
    setWatchlistModalOpen(true)
    if (watchlists.length > 0) {
      setSelectedWatchlistId(watchlists[0].id)
    }
  }

  const handleAddToWatchlist = async () => {
    if (!selectedTickerForWatchlist || !selectedWatchlistId) return

    try {
      await watchlistService.addStock(selectedWatchlistId, selectedTickerForWatchlist)
      notify.success(`Added ${selectedTickerForWatchlist} to watchlist`)
      setWatchlistModalOpen(false)
      setSelectedTickerForWatchlist(null)
      setSelectedWatchlistId('')
    } catch (error) {
      notify.error('Failed to add stock to watchlist')
    }
  }

  const columns = useMemo<ColumnDef<StockTicker>[]>(
    () => [
      {
        id: 'symbol',
        accessorKey: 'symbol',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              Symbol
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-bold text-slate-900 dark:text-slate-100">
            {row.getValue('symbol')}
          </div>
        ),
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="text-slate-600 dark:text-slate-400">{row.getValue('name')}</div>
        ),
      },
      {
        id: 'exchange',
        accessorKey: 'exchange',
        header: 'Exchange',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {formatExchange(row.getValue('exchange'))}
          </span>
        ),
      },
      {
        id: 'price',
        accessorKey: 'currentPrice',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const price = effectivePrice(row.original)
          if (price == null) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          return (
            <div className="text-right font-semibold">
              {formatNumber(price)}
            </div>
          )
        },
      },
      {
        id: 'change',
        accessorKey: 'change',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Change
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          if (!hasValidQuote(row.original)) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          const change = row.getValue('change') as number | null
          if (change === null || change === undefined) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          const isPositive = change !== null && change >= 0
          return (
            <div className={cn(
              'text-right font-medium tabular-nums',
              isPositive ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'
            )}>
              {(change >= 0 ? '+' : '') + formatNumber(change)}
            </div>
          )
        },
      },
      {
        id: 'changePercent',
        accessorKey: 'changePercent',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Change %
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          if (!hasValidQuote(row.original)) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          const changePercent = row.getValue('changePercent') as number | null
          if (changePercent === null || changePercent === undefined) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          const isPositive = changePercent !== null && changePercent >= 0
          return (
            <div className={cn(
              'text-right font-bold tabular-nums',
              isPositive ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'
            )}>
              {formatPercentage(changePercent)}
            </div>
          )
        },
      },
      {
        id: 'volume',
        accessorKey: 'volume',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Volume
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          if (!hasValidQuote(row.original)) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          const volume = row.getValue('volume') as number | null
          return (
            <div className="text-right">
              {volume !== null && volume !== undefined ? formatNumber(volume) : 'N/A'}
            </div>
          )
        },
      },
      {
        id: 'value',
        accessorKey: 'value',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Value
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          if (!hasValidQuote(row.original)) {
            return <div className="text-right text-[hsl(var(--muted))]">N/A</div>
          }
          const value = row.getValue('value') as number | null
          return (
            <div className="text-right">
              {value !== null && value !== undefined ? formatNumber(value) : 'N/A'}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredBaseTickers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: (updater) => {
      setColumnOrder((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        return next ?? prev
      })
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading trading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <Card className="max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Unable to load trading board. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <PageHeader
          title="Trading Board"
          description="Real-time stock market data and analytics"
          actions={
            <Button
              onClick={() => setIsColumnModalOpen(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span className="hidden sm:inline">Customize Columns</span>
            </Button>
          }
        />

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[hsl(var(--surface-1))]">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by symbol or company name..."
                    className="flex-1"
                  />
                  <DensityToggle
                    density={density}
                    onDensityChange={setDensity}
                  />
                </div>
                <TradingBoardFilters
                  filters={filters}
                  watchlists={watchlists}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[hsl(var(--surface-1))]">
            <div className="relative max-h-[min(70vh,calc(100vh-220px))] overflow-auto">
                <Table
                  containerClassName="overflow-visible"
                  className={cn(density === 'compact' ? 'text-sm' : 'text-base')}
                >
                  <TableHeader className="border-b border-[hsl(var(--border))]">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="sticky top-0 z-10 bg-[hsl(var(--surface-1))] font-semibold text-[hsl(var(--text))]"
                          >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                        <TableHead className="sticky top-0 z-10 w-[120px] bg-[hsl(var(--surface-1))] text-right font-semibold text-[hsl(var(--text))]">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => {
                      const ticker = row.original
                      // Detect unusual moves for signal highlight
                      const changePercent = ticker.changePercent || 0
                      const isUnusualMove = Math.abs(changePercent) > 3
                      
                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className={cn(
                            'cursor-pointer transition-colors',
                            index % 2 === 0 ? 'bg-[hsl(var(--surface-1))]' : 'bg-[hsl(var(--surface-2))]',
                            'hover:bg-[hsl(var(--surface-3))]',
                            isUnusualMove && 'border-l-2 border-l-[hsl(var(--accent))]'
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                density === 'compact' ? 'py-2' : 'py-3',
                                'tabular-nums'
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                          {/* Quick Actions Column */}
                          <TableCell className="w-[120px]">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/chart?symbol=${ticker.symbol}`)
                                }}
                                title="Open Chart"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/alerts?symbol=${ticker.symbol}`)
                                }}
                                title="Create Alert"
                              >
                                <Bell className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddToWatchlistClick(ticker.symbol)
                                }}
                                title="Add to Watchlist"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                        <EmptyState
                          icon={BarChart3}
                          title="No tickers found"
                          description={searchQuery ? 'No results match your search' : 'Try adjusting your filters'}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-4 py-3 border-t border-[hsl(var(--border))] text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length}{' '}
              {table.getFilteredRowModel().rows.length === 1 ? 'symbol' : 'symbols'}
              <span className="text-[hsl(var(--muted))]"> · scroll the table to view all rows</span>
            </div>
          </Card>
        </motion.div>

        {/* Column Customization Modal */}
        <ColumnCustomizationModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          onSave={handleSaveColumnPreferences}
        />

        {/* Add to Watchlist Modal */}
        <Dialog open={watchlistModalOpen} onOpenChange={setWatchlistModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
              <DialogDescription>
                Select a watchlist to add {selectedTickerForWatchlist} to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {watchlists.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted))]">
                  No watchlists available. Please create a watchlist first.
                </p>
              ) : (
                <Select value={selectedWatchlistId} onValueChange={setSelectedWatchlistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select watchlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchlists.map((watchlist) => (
                      <SelectItem key={watchlist.id} value={watchlist.id}>
                        {watchlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setWatchlistModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddToWatchlist}
                  disabled={!selectedWatchlistId || watchlists.length === 0}
                >
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
