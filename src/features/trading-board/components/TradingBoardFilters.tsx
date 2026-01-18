import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TradingBoardFilters as TradingBoardFiltersType } from '../services/tradingBoardService'

interface TradingBoardFiltersProps {
  filters: TradingBoardFiltersType
  watchlists: Array<{ id: string; name: string }>
  onFilterChange: (key: keyof TradingBoardFiltersType, value: string | undefined) => void
}

export const TradingBoardFilters = ({
  filters,
  watchlists,
  onFilterChange,
}: TradingBoardFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex-1 min-w-[150px]">
        <Select
          value={filters.exchange || 'all'}
          onValueChange={(value) => onFilterChange('exchange', value === 'all' ? undefined : value as string)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Exchange" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exchanges</SelectItem>
            <SelectItem value="HOSE">HOSE</SelectItem>
            <SelectItem value="HNX">HNX</SelectItem>
            <SelectItem value="UPCOM">UPCOM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[150px]">
        <Select
          value={filters.index || 'all'}
          onValueChange={(value) => onFilterChange('index', value === 'all' ? undefined : value as string)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Index" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Indexes</SelectItem>
            <SelectItem value="VN30">VN30</SelectItem>
            <SelectItem value="VN100">VN100</SelectItem>
            <SelectItem value="HNX30">HNX30</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[150px]">
        <Input
          type="text"
          placeholder="Industry"
          value={filters.industry || ''}
          onChange={(e) => onFilterChange('industry', e.target.value || undefined as string | undefined)}
          className="h-9"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <Select
          value={filters.watchlistId || 'all'}
          onValueChange={(value) => onFilterChange('watchlistId', value === 'all' ? undefined : value as string)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Watchlist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Watchlists</SelectItem>
            {watchlists.map((watchlist) => (
              <SelectItem key={watchlist.id} value={watchlist.id}>
                {watchlist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
