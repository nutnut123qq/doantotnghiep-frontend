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
    </div>
  )
}
