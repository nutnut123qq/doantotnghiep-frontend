import { useState, useMemo, useEffect } from 'react'
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
  VisibilityState,
} from '@tanstack/react-table'
import { useTradingBoard } from '../hooks/useTradingBoard'
import { ColumnCustomizationModal } from './ColumnCustomizationModal'
import { columnPreferencesService } from '../services/columnPreferencesService'
import type { TradingBoardFilters } from '../services/tradingBoardService'
import type { TradingBoardColumnPreferences, ColumnId } from '../types/columnTypes'
import { COLUMN_DEFINITIONS, DEFAULT_COLUMN_ORDER } from '../types/columnTypes'
import type { StockTicker } from '@/domain/entities/StockTicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { cn } from '@/lib/utils'

export const TradingBoard = () => {
  const [filters, setFilters] = useState<TradingBoardFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnPreferences, setColumnPreferences] = useState<TradingBoardColumnPreferences>({
    visibleColumns: DEFAULT_COLUMN_ORDER,
    columnOrder: DEFAULT_COLUMN_ORDER,
  })
  const { tickers, isLoading, error } = useTradingBoard(filters)

  useEffect(() => {
    loadColumnPreferences()
  }, [])

  const loadColumnPreferences = async () => {
    try {
      const prefs = await columnPreferencesService.getColumnPreferences()
      setColumnPreferences(prefs)
      // Set column visibility based on preferences
      const visibility: VisibilityState = {}
      prefs.visibleColumns.forEach((col) => {
        visibility[col] = true
      })
      setColumnVisibility(visibility)
    } catch (error) {
      console.error('Error loading column preferences:', error)
    }
  }

  const handleSaveColumnPreferences = (prefs: TradingBoardColumnPreferences) => {
    setColumnPreferences(prefs)
    const visibility: VisibilityState = {}
    prefs.visibleColumns.forEach((col) => {
      visibility[col] = true
    })
    setColumnVisibility(visibility)
  }

  // Filter tickers based on search query
  const filteredTickers = useMemo(() => {
    if (!searchQuery) return tickers
    const query = searchQuery.toLowerCase()
    return tickers.filter(
      (ticker) =>
        ticker.symbol.toLowerCase().includes(query) ||
        ticker.name?.toLowerCase().includes(query)
    )
  }, [tickers, searchQuery])

  const handleFilterChange = (key: keyof TradingBoardFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
    }))
  }

  // Column definitions
  const columns = useMemo<ColumnDef<StockTicker>[]>(
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
        accessorKey: 'exchange',
        header: 'Exchange',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {row.getValue('exchange')}
          </span>
        ),
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
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const price = row.getValue('currentPrice') as number
          return (
            <div className="text-right font-semibold">
              {formatNumber(price)}
            </div>
          )
        },
      },
      {
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
          const change = row.getValue('change') as number | null
          const isPositive = change !== null && change >= 0
          return (
            <div className={cn(
              'text-right',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}>
              {change !== null ? (change >= 0 ? '+' : '') + formatNumber(change) : '-'}
            </div>
          )
        },
      },
      {
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
          const changePercent = row.getValue('changePercent') as number | null
          const isPositive = changePercent !== null && changePercent >= 0
          return (
            <div className={cn(
              'text-right font-bold',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}>
              {changePercent !== null ? formatPercentage(changePercent) : '-'}
            </div>
          )
        },
      },
      {
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
          const volume = row.getValue('volume') as number | null
          return (
            <div className="text-right">
              {volume !== null ? formatNumber(volume) : '-'}
            </div>
          )
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
                Value
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue('value') as number | null
          return (
            <div className="text-right">
              {value !== null ? formatNumber(value) : '-'}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredTickers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Trading Board
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Real-time stock market data and analytics</p>
          </div>
          <Button
            onClick={() => setIsColumnModalOpen(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Customize Columns</span>
          </Button>
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by symbol or company name..."
                    className="w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Select
                      value={filters.exchange || 'all'}
                      onValueChange={(value) => handleFilterChange('exchange', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Exchanges" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Exchanges</SelectItem>
                        <SelectItem value="HOSE">HOSE</SelectItem>
                        <SelectItem value="HNX">HNX</SelectItem>
                        <SelectItem value="UPCOM">UPCOM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      type="text"
                      placeholder="Filter by industry"
                      value={filters.industry || ''}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                    />
                  </div>
                </div>
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
                          <p className="text-lg font-medium">No tickers found</p>
                          <p className="text-sm mt-1">
                            {searchQuery ? 'No results match your search' : 'Try adjusting your filters'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
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
          </Card>
        </motion.div>

        {/* Column Customization Modal */}
        <ColumnCustomizationModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          onSave={handleSaveColumnPreferences}
        />
      </div>
    </div>
  )
}
