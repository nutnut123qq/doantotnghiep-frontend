import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
// Simplified version without cmdk for now
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Mock ticker data - replace with actual API call
const MOCK_TICKERS = [
  { symbol: 'VIC', name: 'Vingroup' },
  { symbol: 'VNM', name: 'Vinamilk' },
  { symbol: 'VCB', name: 'Vietcombank' },
  { symbol: 'FPT', name: 'FPT Corporation' },
  { symbol: 'VRE', name: 'Vincom Retail' },
  { symbol: 'MSN', name: 'Masan Group' },
  { symbol: 'HPG', name: 'Hoa Phat Group' },
  { symbol: 'TCB', name: 'Techcombank' },
  { symbol: 'BID', name: 'BIDV' },
  { symbol: 'CTG', name: 'VietinBank' },
]

interface TickerSearchProps {
  className?: string
  onSelect?: (symbol: string) => void
}

export const TickerSearch = ({ className, onSelect }: TickerSearchProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredTickers = MOCK_TICKERS.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(search.toLowerCase()) ||
      ticker.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (symbol: string) => {
    if (onSelect) {
      onSelect(symbol)
    } else {
      // Default: navigate to chart page
      navigate(`/?symbol=${symbol}`)
    }
    setOpen(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredTickers.length > 0) {
      handleSelect(filteredTickers[0].symbol)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('relative', className)}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search ticker..."
            className="pl-9 pr-9 w-[200px] sm:w-[300px]"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('')
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-[hsl(var(--muted))] hover:text-[hsl(var(--text))]" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredTickers.length === 0 ? (
            <div className="py-6 text-center text-sm text-[hsl(var(--muted))]">
              No tickers found.
            </div>
          ) : (
            <div>
              <div className="px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted))] uppercase">
                Tickers
              </div>
              {filteredTickers.slice(0, 10).map((ticker) => (
                <button
                  key={ticker.symbol}
                  onClick={() => handleSelect(ticker.symbol)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-[hsl(var(--surface-2))] transition-colors text-left"
                >
                  <div>
                    <div className="font-medium text-[hsl(var(--text))]">{ticker.symbol}</div>
                    <div className="text-xs text-[hsl(var(--muted))]">
                      {ticker.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
