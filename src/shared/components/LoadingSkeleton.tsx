export const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  )
}

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
  )
}

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4 animate-pulse"></div>
      <div className="h-64 bg-slate-100 rounded-lg animate-pulse"></div>
    </div>
  )
}

