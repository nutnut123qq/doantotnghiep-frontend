import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[hsl(var(--text))] mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-[hsl(var(--muted))]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  )
}
