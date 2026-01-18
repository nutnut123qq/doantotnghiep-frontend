import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type Density = 'compact' | 'comfortable'

interface DensityToggleProps {
  density: Density
  onDensityChange: (density: Density) => void
  className?: string
}

export const DensityToggle = ({
  density,
  onDensityChange,
  className,
}: DensityToggleProps) => {
  return (
    <div className={cn('flex items-center space-x-1 bg-[hsl(var(--surface-2))] rounded-md p-1', className)}>
      <Button
        variant={density === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onDensityChange('compact')}
        className="h-7 px-2"
        title="Compact"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={density === 'comfortable' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onDensityChange('comfortable')}
        className="h-7 px-2"
        title="Comfortable"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  )
}
