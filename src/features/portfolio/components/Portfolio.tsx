import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, RefreshCw, Plus, Search, X } from 'lucide-react'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { cn } from '@/lib/utils'
import { portfolioService, type Holding, type PortfolioSummary } from '../services/portfolioService'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useSymbols } from '@/features/dashboard/hooks/useSymbols'
import type { StockSymbol } from '@/features/dashboard/services/stockDataService'

export const Portfolio = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [summaryStats, setSummaryStats] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    shares: '',
    avgPrice: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [symbolSearchQuery, setSymbolSearchQuery] = useState('')
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false)
  const [highlightedSymbolIndex, setHighlightedSymbolIndex] = useState(0)
  const symbolInputRef = useRef<HTMLInputElement>(null)
  const symbolDropdownRef = useRef<HTMLDivElement>(null)

  // Load symbols for autocomplete
  const { symbols, isLoading: isLoadingSymbols } = useSymbols()

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch both holdings and summary in parallel
      const [holdingsData, summaryData] = await Promise.all([
        portfolioService.getHoldings(),
        portfolioService.getSummary().catch(() => null), // Fallback to null if summary fails
      ])
      
      // Transform holdings data to ensure all fields are present
      // Calculate value if not provided: value = shares * currentPrice
      const transformedHoldings = holdingsData.map((holding) => ({
        ...holding,
        value: holding.value ?? (holding.shares * holding.currentPrice),
      }))
      
      setHoldings(transformedHoldings)
      
      // Use API summary if available, otherwise calculate from holdings
      if (summaryData) {
        setSummaryStats(summaryData)
      } else {
        // Calculate summary from holdings as fallback
        const totalValue = transformedHoldings.reduce((sum, h) => sum + h.value, 0)
        const totalCost = transformedHoldings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0)
        const totalGainLoss = totalValue - totalCost
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
        setSummaryStats({
          totalValue,
          totalCost,
          totalGainLoss,
          totalGainLossPercentage: totalGainLossPercent,
          holdingsCount: transformedHoldings.length,
        })
      }
    } catch (err: any) {
      console.error('Error loading portfolio data:', err)
      
      // Handle 404 specifically (API endpoint not found)
      if (err.response?.status === 404) {
        const errorMessage = 'API endpoint chưa được implement. Vui lòng liên hệ admin.'
        setError(errorMessage)
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải dữ liệu portfolio. Vui lòng thử lại.'
        setError(errorMessage)
      }
      
      setHoldings([])
      setSummaryStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Function to handle adding new holding
  const handleAddHolding = async () => {
    try {
      setIsSubmitting(true)
      const shares = parseFloat(newHolding.shares)
      const avgPrice = parseFloat(newHolding.avgPrice)

      if (!newHolding.symbol.trim() || !shares || !avgPrice || shares <= 0 || avgPrice <= 0) {
        toast.error('Vui lòng nhập đầy đủ thông tin hợp lệ')
        return
      }

      await portfolioService.addHolding({
        symbol: newHolding.symbol.trim().toUpperCase(),
        shares,
        avgPrice,
      })

      // Reset form and close dialog
      setNewHolding({ symbol: '', shares: '', avgPrice: '' })
      setSymbolSearchQuery('')
      setIsSymbolDropdownOpen(false)
      setIsAddDialogOpen(false)
      
      // Reload data
      await loadData()
    } catch (err: any) {
      console.error('Error adding holding:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Không thể thêm mã cổ phiếu. Vui lòng thử lại.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter symbols for autocomplete
  const filteredSymbols = useMemo(() => {
    if (!symbolSearchQuery.trim()) {
      return symbols.slice(0, 10) // Show first 10 when no search
    }

    const query = symbolSearchQuery.toLowerCase()
    return symbols
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(query) ||
          s.name?.toLowerCase().includes(query)
      )
      .slice(0, 10) // Limit to 10 suggestions
  }, [symbols, symbolSearchQuery])

  // Close symbol dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        symbolInputRef.current &&
        symbolDropdownRef.current &&
        !symbolInputRef.current.contains(event.target as Node) &&
        !symbolDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSymbolDropdownOpen(false)
      }
    }

    if (isSymbolDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isSymbolDropdownOpen])

  // Reset symbol search when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      setSymbolSearchQuery('')
      setIsSymbolDropdownOpen(false)
      setHighlightedSymbolIndex(0)
    }
  }, [isAddDialogOpen])

  // Handle symbol selection
  const handleSymbolSelect = (symbol: StockSymbol) => {
    setNewHolding({ ...newHolding, symbol: symbol.symbol })
    setSymbolSearchQuery(symbol.symbol)
    setIsSymbolDropdownOpen(false)
    setHighlightedSymbolIndex(0)
  }

  // Handle symbol input change
  const handleSymbolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSymbolSearchQuery(value)
    setNewHolding({ ...newHolding, symbol: value })
    setIsSymbolDropdownOpen(true)
    setHighlightedSymbolIndex(0)
  }

  // Handle keyboard navigation in symbol dropdown
  const handleSymbolKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSymbolDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsSymbolDropdownOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedSymbolIndex((prev) =>
        prev < filteredSymbols.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedSymbolIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredSymbols[highlightedSymbolIndex]) {
        handleSymbolSelect(filteredSymbols[highlightedSymbolIndex])
      }
    } else if (e.key === 'Escape') {
      setIsSymbolDropdownOpen(false)
      symbolInputRef.current?.blur()
    }
  }

  // Filter holdings based on debounced search query
  const filteredHoldings = useMemo(() => {
    if (!debouncedSearchQuery) return holdings
    const query = debouncedSearchQuery.toLowerCase()
    return holdings.filter(
      (h) =>
        h.symbol.toLowerCase().includes(query) ||
        h.name.toLowerCase().includes(query)
    )
  }, [holdings, debouncedSearchQuery])

  // Column definitions
  const columns = useMemo<ColumnDef<Holding>[]>(
    () => [
      {
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
        accessorKey: 'shares',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Shares
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const shares = row.getValue('shares') as number
          return <div className="text-right">{formatNumber(shares)}</div>
        },
      },
      {
        accessorKey: 'avgPrice',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Avg Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const price = row.getValue('avgPrice') as number
          return <div className="text-right">{formatNumber(price)}</div>
        },
      },
      {
        accessorKey: 'currentPrice',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Current Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const price = row.getValue('currentPrice') as number
          return <div className="text-right font-semibold">{formatNumber(price)}</div>
        },
      },
      {
        accessorKey: 'value',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Market Value
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue('value') as number
          return <div className="text-right font-semibold">{formatNumber(value)}</div>
        },
      },
      {
        id: 'gainLoss',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                Gain/Loss
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const holding = row.original
          // Use pre-calculated gainLoss from API response
          const gainLoss = holding.gainLoss ?? (holding.shares * holding.currentPrice - holding.shares * holding.avgPrice)
          const isPositive = gainLoss >= 0
          return (
            <div className={cn(
              'text-right font-semibold',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}>
              {isPositive ? '+' : ''}{formatNumber(gainLoss)}
            </div>
          )
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original
          const b = rowB.original
          // Use pre-calculated gainLoss from API response
          const gainLossA = a.gainLoss ?? (a.shares * a.currentPrice - a.shares * a.avgPrice)
          const gainLossB = b.gainLoss ?? (b.shares * b.currentPrice - b.shares * b.avgPrice)
          return gainLossA - gainLossB
        },
      },
      {
        id: 'percentage',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8 px-2 lg:px-3"
              >
                %
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const holding = row.original
          // Use pre-calculated gainLossPercentage from API response
          const percentage = holding.gainLossPercentage ?? 
            (holding.shares * holding.avgPrice > 0 
              ? ((holding.shares * holding.currentPrice - holding.shares * holding.avgPrice) / (holding.shares * holding.avgPrice)) * 100 
              : 0)
          const isPositive = percentage >= 0
          return (
            <div className="text-right">
              <Badge
                variant={isPositive ? 'success' : 'error'}
                className={cn(
                  'font-semibold',
                  isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                )}
              >
                {isPositive ? '+' : ''}{percentage.toFixed(2)}%
              </Badge>
            </div>
          )
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original
          const b = rowB.original
          // Use pre-calculated gainLossPercentage from API response
          const percentA = a.gainLossPercentage ?? 
            (a.shares * a.avgPrice > 0 
              ? ((a.shares * a.currentPrice - a.shares * a.avgPrice) / (a.shares * a.avgPrice)) * 100 
              : 0)
          const percentB = b.gainLossPercentage ?? 
            (b.shares * b.avgPrice > 0 
              ? ((b.shares * b.currentPrice - b.shares * b.avgPrice) / (b.shares * b.avgPrice)) * 100 
              : 0)
          return percentA - percentB
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredHoldings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Loading skeleton for summary cards
  const SummaryCardSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2"></div>
        <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
      </CardContent>
    </Card>
  )

  // Error state
  if (error && !loading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Portfolio
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and track your investment holdings</p>
          </motion.div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  Không thể tải dữ liệu portfolio
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  onClick={loadData}
                  variant="outline"
                  className="mt-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Portfolio
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and track your investment holdings</p>
          </div>
          {!loading && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm mã cổ phiếu
              </Button>
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          )}
        </motion.div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading || !summaryStats ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl">
                      {formatNumber(summaryStats.totalValue)} VND
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 invisible">
                      &nbsp;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Cost</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl">
                      {formatNumber(summaryStats.totalCost)} VND
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 invisible">
                      &nbsp;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Gain/Loss</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className={cn(
                      'text-2xl',
                      summaryStats.totalGainLoss >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    )}>
                      {summaryStats.totalGainLoss >= 0 ? '+' : ''}
                      {formatNumber(summaryStats.totalGainLoss)} VND
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 invisible">
                      &nbsp;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Holdings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl">{summaryStats.holdingsCount} stocks</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPercentage(summaryStats.totalGainLossPercentage)} overall
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Search */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symbol or name..."
              className="max-w-sm"
            />
          </motion.div>
        )}

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            {loading ? (
              <div className="overflow-x-auto p-6">
                <div className="space-y-3">
                  {/* Table header skeleton */}
                  <div className="flex space-x-4 pb-3 border-b">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1"></div>
                    ))}
                  </div>
                  {/* Table rows skeleton */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex space-x-4 py-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                        <div key={j} className="h-4 bg-muted rounded animate-pulse flex-1"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          <div className="text-slate-400 dark:text-slate-500">
                            <p className="text-lg font-medium">No holdings found</p>
                            <p className="text-sm mt-1">
                              {searchQuery ? 'No results match your search' : 'Add holdings to get started'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Pagination */}
            {!loading && table.getPageCount() > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Add Holding Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm mã cổ phiếu vào Portfolio</DialogTitle>
              <DialogDescription>
                Nhập thông tin mã cổ phiếu bạn muốn thêm vào portfolio của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="symbol">Mã cổ phiếu *</Label>
                <div className="relative" ref={symbolInputRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="symbol"
                      placeholder="Tìm kiếm mã cổ phiếu (VD: VIC, VNM, VCB)..."
                      value={symbolSearchQuery}
                      onChange={handleSymbolInputChange}
                      onFocus={() => setIsSymbolDropdownOpen(true)}
                      onKeyDown={handleSymbolKeyDown}
                      disabled={isSubmitting}
                      className="pl-9 pr-9"
                    />
                    {symbolSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSymbolSearchQuery('')
                          setNewHolding({ ...newHolding, symbol: '' })
                          setIsSymbolDropdownOpen(true)
                          symbolInputRef.current?.focus()
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Dropdown Suggestions */}
                  {isSymbolDropdownOpen && (
                    <div
                      ref={symbolDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      {isLoadingSymbols ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          Đang tải danh sách mã chứng khoán...
                        </div>
                      ) : symbols.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          <div>Không có dữ liệu mã chứng khoán</div>
                          <div className="text-xs mt-1">API có thể chưa sẵn sàng</div>
                        </div>
                      ) : filteredSymbols.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          <div>Không tìm thấy mã chứng khoán</div>
                          <div className="text-xs mt-1">
                            Tìm kiếm: &quot;{symbolSearchQuery}&quot; ({symbols.length} mã có sẵn)
                          </div>
                        </div>
                      ) : (
                        <ul className="py-1">
                          {filteredSymbols.map((symbol, index) => {
                            const isHighlighted = index === highlightedSymbolIndex
                            const isSelected = symbol.symbol === newHolding.symbol

                            return (
                              <li key={symbol.symbol}>
                                <button
                                  type="button"
                                  onClick={() => handleSymbolSelect(symbol)}
                                  className={cn(
                                    'w-full text-left px-4 py-2 text-sm transition-colors',
                                    isHighlighted
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
                                    isSelected && 'font-semibold'
                                  )}
                                  disabled={isSubmitting}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{symbol.symbol}</span>
                                    {isSelected && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">✓</span>
                                    )}
                                  </div>
                                  {symbol.name && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                      {symbol.name}
                                    </div>
                                  )}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shares">Số lượng cổ phiếu *</Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="VD: 100"
                  value={newHolding.shares}
                  onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })}
                  min="0"
                  step="1"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avgPrice">Giá mua trung bình (VND) *</Label>
                <Input
                  id="avgPrice"
                  type="number"
                  placeholder="VD: 50000"
                  value={newHolding.avgPrice}
                  onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                  min="0"
                  step="1000"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setNewHolding({ symbol: '', shares: '', avgPrice: '' })
                  setSymbolSearchQuery('')
                  setIsSymbolDropdownOpen(false)
                }}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddHolding}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang thêm...' : 'Thêm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
