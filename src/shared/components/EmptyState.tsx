import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-[hsl(var(--surface-2))]">
          <Icon className="h-8 w-8 text-[hsl(var(--muted))]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[hsl(var(--muted))] text-center max-w-md mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}
