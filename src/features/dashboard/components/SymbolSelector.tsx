import { useState, useEffect, useRef, useMemo } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSymbols } from '../hooks/useSymbols'
import { StockSymbol } from '../services/stockDataService'

interface SymbolSelectorProps {
  value: string
  onChange: (symbol: string) => void
  placeholder?: string
  className?: string
}

export const SymbolSelector = ({
  value,
  onChange,
  placeholder = 'Tìm mã CK...',
  className = '',
}: SymbolSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { symbols, isLoading, error } = useSymbols()

  // Debug: Log symbols to console
  useEffect(() => {
    if (symbols.length > 0) {
      console.log('Symbols loaded:', symbols.length, 'symbols')
    } else if (!isLoading && !error) {
      console.log('No symbols found - API may have returned empty array')
    }
    if (error) {
      console.error('Error loading symbols:', error)
    }
  }, [symbols, isLoading, error])

  // Filter symbols based on search query
  const filteredSymbols = useMemo(() => {
    if (!searchQuery.trim()) {
      return symbols.slice(0, 10) // Show first 10 when no search
    }

    const query = searchQuery.toLowerCase()
    return symbols
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(query) ||
          s.name?.toLowerCase().includes(query)
      )
      .slice(0, 10) // Limit to 10 suggestions
  }, [symbols, searchQuery])

  // Update search query when value changes externally
  useEffect(() => {
    if (value && !isOpen) {
      const symbol = symbols.find((s) => s.symbol === value)
      if (symbol) {
        setSearchQuery(symbol.symbol)
      }
    }
  }, [value, symbols, isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        // Reset search query to current value when closing
        const symbol = symbols.find((s) => s.symbol === value)
        if (symbol) {
          setSearchQuery(symbol.symbol)
        } else {
          setSearchQuery('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [value, symbols])

  const handleSelect = (symbol: StockSymbol) => {
    onChange(symbol.symbol)
    setSearchQuery(symbol.symbol)
    setIsOpen(false)
    setHighlightedIndex(0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)
    setIsOpen(true)
    setHighlightedIndex(0)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredSymbols.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredSymbols[highlightedIndex]) {
        handleSelect(filteredSymbols[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setIsOpen(true)
    inputRef.current?.focus()
  }

  // Find current symbol for display (unused for now, may be used later)
  // const currentSymbol = symbols.find((s) => s.symbol === value)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 text-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              Đang tải danh sách mã chứng khoán...
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-sm text-red-600 text-center">
              Lỗi khi tải danh sách mã. Vui lòng thử lại.
            </div>
          ) : symbols.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              <div>Không có dữ liệu mã chứng khoán</div>
              <div className="text-xs mt-1">API có thể chưa sẵn sàng</div>
            </div>
          ) : filteredSymbols.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              <div>Không tìm thấy mã chứng khoán</div>
              <div className="text-xs mt-1">
                Tìm kiếm: "{searchQuery}" ({symbols.length} mã có sẵn)
              </div>
            </div>
          ) : (
            <ul className="py-1">
              {filteredSymbols.map((symbol, index) => {
                const isHighlighted = index === highlightedIndex
                const isSelected = symbol.symbol === value

                return (
                  <li key={symbol.symbol}>
                    <button
                      type="button"
                      onClick={() => handleSelect(symbol)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        isHighlighted
                          ? 'bg-blue-50 text-blue-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      } ${isSelected ? 'font-semibold' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{symbol.symbol}</span>
                        {isSelected && (
                          <span className="text-xs text-blue-600">✓</span>
                        )}
                      </div>
                      {symbol.name && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
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
  )
}

