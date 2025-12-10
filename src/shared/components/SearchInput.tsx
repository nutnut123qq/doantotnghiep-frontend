import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

