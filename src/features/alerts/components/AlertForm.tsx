import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [formData, setFormData] = useState<CreateAlertRequest>({
    symbol: initialData?.symbol || '',
    type: initialData?.type || AlertType.Price,
    condition: initialData?.condition || '',
    threshold: initialData?.threshold,
    timeframe: initialData?.timeframe || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          placeholder="e.g., VIC"
          required
        />
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
            <SelectItem value="percent_change_up">% Change Up</SelectItem>
            <SelectItem value="percent_change_down">% Change Down</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="threshold">Threshold</Label>
        <Input
          id="threshold"
          type="number"
          step="0.01"
          value={formData.threshold || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              threshold: parseFloat(e.target.value) || undefined,
            })
          }
          placeholder="e.g., 100000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeframe">Timeframe (Optional)</Label>
        <Input
          id="timeframe"
          value={formData.timeframe}
          onChange={(e) =>
            setFormData({ ...formData, timeframe: e.target.value })
          }
          placeholder="e.g., 1d, 1w, 1m"
        />
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
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Alert'}
        </button>
      </div>
    </form>
  )
}
