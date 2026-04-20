import { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSymbols } from '@/features/dashboard/hooks/useSymbols'
import { AlertType, AlertTypeLabels } from '../types/alert.types'
import type { CreateAlertRequest } from '../types/alert.types'

interface AlertFormProps {
  onSubmit: (data: CreateAlertRequest) => void
  onCancel: () => void
  initialData?: Partial<CreateAlertRequest>
  isLoading?: boolean
}

export const AlertForm = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: AlertFormProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<CreateAlertRequest>({
    symbol: initialData?.symbol || '',
    type: initialData?.type || AlertType.Price,
    condition: initialData?.condition || '',
    threshold: initialData?.threshold,
  })
  const [symbolQuery, setSymbolQuery] = useState(initialData?.symbol || '')
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false)
  const { symbols, isLoading: isLoadingSymbols } = useSymbols()

  useEffect(() => {
    setSymbolQuery(initialData?.symbol || '')
  }, [initialData?.symbol])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsSymbolDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredSymbols = useMemo(() => {
    const query = symbolQuery.trim().toLowerCase()
    if (!query) return symbols.slice(0, 10)

    const startsWithMatches = symbols.filter((stock) =>
      stock.symbol.toLowerCase().startsWith(query)
    )
    const containsMatches = symbols.filter(
      (stock) =>
        !stock.symbol.toLowerCase().startsWith(query) &&
        (stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query))
    )

    return [...startsWithMatches, ...containsMatches].slice(0, 10)
  }, [symbolQuery, symbols])

  const handleSymbolSelect = (symbol: string) => {
    setFormData({ ...formData, symbol })
    setSymbolQuery(symbol)
    setIsSymbolDropdownOpen(false)
  }

  const handleSymbolInputChange = (value: string) => {
    const normalizedValue = value.toUpperCase()
    setSymbolQuery(normalizedValue)
    setIsSymbolDropdownOpen(true)

    const exactMatch = symbols.find((stock) => stock.symbol === normalizedValue)
    setFormData({ ...formData, symbol: exactMatch?.symbol || '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.symbol) return
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2" ref={containerRef}>
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          value={symbolQuery}
          onChange={(e) => handleSymbolInputChange(e.target.value)}
          onFocus={() => setIsSymbolDropdownOpen(true)}
          placeholder={isLoadingSymbols ? 'Loading symbols...' : 'Type to search VN30 symbols'}
          required
        />
        {isSymbolDropdownOpen && (
          <div className="z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-y-auto">
            {isLoadingSymbols ? (
              <div className="py-3 px-3 text-sm text-muted-foreground">
                Loading VN30 symbols...
              </div>
            ) : filteredSymbols.length === 0 ? (
              <div className="py-3 px-3 text-sm text-muted-foreground">
                No matching VN30 symbols
              </div>
            ) : (
              filteredSymbols.map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSymbolSelect(stock.symbol)}
                >
                  <div className="text-sm font-medium">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Alert Type</Label>
        <Select
          value={formData.type?.toString()}
          onValueChange={(value) =>
            setFormData({ ...formData, type: parseInt(value) as AlertType })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select alert type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AlertTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select
          value={formData.condition}
          onValueChange={(value) =>
            setFormData({ ...formData, condition: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="threshold">Threshold</Label>
        <Input
          id="threshold"
          type="number"
          step={formData.type === AlertType.Price ? '1' : '0.01'}
          min={formData.type === AlertType.Price ? '1' : undefined}
          value={formData.threshold ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            if (formData.type === AlertType.Price) {
              if (raw === '') {
                setFormData({ ...formData, threshold: undefined })
                return
              }
              const n = parseInt(raw, 10)
              setFormData({
                ...formData,
                threshold: Number.isNaN(n) ? undefined : n,
              })
            } else {
              setFormData({
                ...formData,
                threshold: parseFloat(raw) || undefined,
              })
            }
          }}
          placeholder={
            formData.type === AlertType.Price
              ? 'VND, e.g. 100000'
              : 'e.g., 1000000'
          }
          required
        />
        {formData.type === AlertType.Price && (
          <p className="text-xs text-muted-foreground">
            Nhập giá đầy đủ bằng VND (số nguyên), ví dụ 100000.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading || !formData.symbol}
        >
          {isLoading ? 'Creating...' : 'Create Alert'}
        </button>
      </div>
    </form>
  )
}
