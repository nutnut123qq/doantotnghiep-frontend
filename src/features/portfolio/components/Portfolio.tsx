import { useMemo, useState, useEffect, useCallback } from 'react'
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
import { ArrowUpDown, RefreshCw } from 'lucide-react'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { cn } from '@/lib/utils'
import { portfolioService, type Holding, type PortfolioSummary } from '../services/portfolioService'

export const Portfolio = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [summaryStats, setSummaryStats] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Portfolio
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and track your investment holdings</p>
          </div>
          {!loading && (
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
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
      </div>
    </div>
  )
}
