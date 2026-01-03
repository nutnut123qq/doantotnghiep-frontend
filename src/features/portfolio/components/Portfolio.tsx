import { useMemo, useState } from 'react'
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
import { ArrowUpDown } from 'lucide-react'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { cn } from '@/lib/utils'

interface Holding {
  symbol: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
}

export const Portfolio = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [searchQuery, setSearchQuery] = useState('')

  const holdings: Holding[] = [
    { symbol: 'VIC', name: 'VIC Corporation', shares: 1000, avgPrice: 30500, currentPrice: 32076, value: 32076000 },
    { symbol: 'VNM', name: 'VNM Corporation', shares: 500, avgPrice: 195000, currentPrice: 192471, value: 96235500 },
    { symbol: 'VCB', name: 'VCB Corporation', shares: 800, avgPrice: 185000, currentPrice: 190704, value: 152563200 },
    { symbol: 'VRE', name: 'VRE Corporation', shares: 1500, avgPrice: 125000, currentPrice: 127411, value: 191116500 },
  ]

  const calculateGainLoss = (shares: number, avgPrice: number, currentPrice: number) => {
    const totalCost = shares * avgPrice
    const currentValue = shares * currentPrice
    const gainLoss = currentValue - totalCost
    const percentage = (gainLoss / totalCost) * 100
    return { gainLoss, percentage, totalCost, currentValue }
  }

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
    const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0)
    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = (totalGainLoss / totalCost) * 100
    return { totalValue, totalCost, totalGainLoss, totalGainLossPercent }
  }, [holdings])

  // Filter holdings based on search
  const filteredHoldings = useMemo(() => {
    if (!searchQuery) return holdings
    const query = searchQuery.toLowerCase()
    return holdings.filter(
      (h) =>
        h.symbol.toLowerCase().includes(query) ||
        h.name.toLowerCase().includes(query)
    )
  }, [holdings, searchQuery])

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
          const { gainLoss } = calculateGainLoss(holding.shares, holding.avgPrice, holding.currentPrice)
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
          const gainLossA = calculateGainLoss(a.shares, a.avgPrice, a.currentPrice).gainLoss
          const gainLossB = calculateGainLoss(b.shares, b.avgPrice, b.currentPrice).gainLoss
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
          const { percentage } = calculateGainLoss(holding.shares, holding.avgPrice, holding.currentPrice)
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
          const percentA = calculateGainLoss(a.shares, a.avgPrice, a.currentPrice).percentage
          const percentB = calculateGainLoss(b.shares, b.avgPrice, b.currentPrice).percentage
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

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Portfolio
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track your investment holdings</p>
        </motion.div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardTitle className="text-2xl">{holdings.length} stocks</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPercentage(summaryStats.totalGainLossPercent)} overall
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
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

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
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
            {/* Pagination */}
            {table.getPageCount() > 1 && (
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
