import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { analysisReportApi } from '@/infrastructure/api/analysisReportApi'
import type { CreateAnalysisReportDto } from '@/shared/types/analysisReportTypes'

type Props = {
  isOpen: boolean
  onClose: () => void
  defaultSymbol?: string
}

type FormState = {
  symbol: string
  title: string
  firmName: string
  publishedAt: string
  recommendation?: string
  targetPrice?: string
  content: string
  sourceUrl?: string
}

const RECOMMENDATIONS = ['Buy', 'Hold', 'Sell'] as const

const toDatetimeLocalValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hour}:${minute}`
}

const toIsoFromDatetimeLocal = (datetimeLocalValue: string) => {
  if (!datetimeLocalValue?.includes('T')) {
    return new Date().toISOString()
  }
  const [datePart, timePart] = datetimeLocalValue.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const date = new Date(year, month - 1, day, hour, minute, 0)
  return date.toISOString()
}

export const ImportReportDialog = ({
  isOpen,
  onClose,
  defaultSymbol,
}: Props) => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    symbol: defaultSymbol ?? '',
    title: '',
    firmName: '',
    publishedAt: toDatetimeLocalValue(new Date()),
    recommendation: undefined,
    targetPrice: undefined,
    content: '',
    sourceUrl: '',
  })

  useEffect(() => {
    if (isOpen && defaultSymbol) {
      setForm((prev) => ({
        ...prev,
        symbol: defaultSymbol,
      }))
    }
  }, [defaultSymbol, isOpen])

  const canSubmit = useMemo(() => {
    return (
      form.symbol.trim().length > 0 &&
      form.title.trim().length > 0 &&
      form.firmName.trim().length > 0 &&
      form.publishedAt.trim().length > 0 &&
      form.content.trim().length >= 10
    )
  }, [form])

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleSubmit = async () => {
    if (!form.publishedAt) {
      toast.error('Ngày phát hành là bắt buộc.')
      return
    }
    if (!form.symbol || !form.title || !form.firmName || !form.content) {
      toast.error('Vui lòng nhập đủ các trường bắt buộc.')
      return
    }

    setSubmitting(true)
    try {
      const payload: CreateAnalysisReportDto = {
        symbol: form.symbol.trim().toUpperCase(),
        title: form.title.trim(),
        firmName: form.firmName.trim(),
        publishedAt: toIsoFromDatetimeLocal(form.publishedAt),
        recommendation: form.recommendation || undefined,
        targetPrice:
          form.targetPrice && !isNaN(Number(form.targetPrice))
            ? Number(form.targetPrice)
            : undefined,
        content: form.content.trim(),
        sourceUrl: form.sourceUrl?.trim() ? form.sourceUrl.trim() : undefined,
      }

      const created = await analysisReportApi.create(payload)
      toast.success('Tạo báo cáo thành công.')
      onClose()
      navigate(`/analysis-reports/${created.id}`)
    } catch {
      toast.error('Không thể tạo báo cáo. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhập báo cáo phân tích</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Mã cổ phiếu *</Label>
            <Input
              value={form.symbol}
              onChange={(e) => update({ symbol: e.target.value })}
              onBlur={(e) =>
                update({ symbol: e.target.value.trim().toUpperCase() })
              }
              placeholder="FPT"
            />
          </div>
          <div className="space-y-2">
            <Label>CTCK *</Label>
            <Input
              value={form.firmName}
              onChange={(e) => update({ firmName: e.target.value })}
              placeholder="VNDirect"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tiêu đề *</Label>
            <Input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="FPT - KQKD Q3/2025"
            />
          </div>
          <div className="space-y-2">
            <Label>Ngày phát hành *</Label>
            <Input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => update({ publishedAt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Khuyến nghị</Label>
            <Select
              value={form.recommendation ?? ''}
              onValueChange={(value) =>
                update({ recommendation: value || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khuyến nghị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">(trống)</SelectItem>
                {RECOMMENDATIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Giá mục tiêu</Label>
            <Input
              type="number"
              value={form.targetPrice ?? ''}
              onChange={(e) =>
                update({ targetPrice: e.target.value || undefined })
              }
              placeholder="135000"
            />
          </div>
          <div className="space-y-2">
            <Label>URL nguồn (tuỳ chọn)</Label>
            <Input
              value={form.sourceUrl ?? ''}
              onChange={(e) => update({ sourceUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Nội dung báo cáo *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="Dán nội dung báo cáo tại đây..."
              className="min-h-[260px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting ? 'Đang tạo...' : 'Tạo báo cáo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
