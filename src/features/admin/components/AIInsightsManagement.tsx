import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminService, type AdminAIInsight } from '../services/adminService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { Brain, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { logger } from '@/shared/utils/logger'

type VisibilityFilter = 'all' | 'visible' | 'hidden'

export function AIInsightsManagement() {
  const [items, setItems] = useState<AdminAIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [symbolFilter, setSymbolFilter] = useState('')
  const [appliedSymbolFilter, setAppliedSymbolFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [generateSymbol, setGenerateSymbol] = useState('')
  const [generating, setGenerating] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAIInsightsAdmin({
        symbol: appliedSymbolFilter.trim() || undefined,
        includeDismissed: true,
        includeDeleted: true,
      })
      setItems(data)
    } catch (err) {
      setError('Failed to load AI insights')
      logger.error('Error loading admin AI insights', { error: err })
    } finally {
      setLoading(false)
    }
  }, [appliedSymbolFilter])

  useEffect(() => {
    void loadInsights()
  }, [loadInsights])

  const filteredItems = useMemo(() => {
    if (visibilityFilter === 'all') return items
    return items.filter((item) => (visibilityFilter === 'hidden' ? item.isDeleted : !item.isDeleted))
  }, [items, visibilityFilter])

  const handleToggleVisibility = useCallback(async (insight: AdminAIInsight, visible: boolean) => {
    const isDeleted = !visible
    setTogglingId(insight.id)
    setItems((prev) => prev.map((item) => (item.id === insight.id ? { ...item, isDeleted } : item)))
    try {
      await adminService.toggleAIInsightDeleted(insight.id, isDeleted)
      toast.success(isDeleted ? 'Insight hidden' : 'Insight visible')
    } catch (err) {
      setItems((prev) => prev.map((item) => (item.id === insight.id ? { ...item, isDeleted: insight.isDeleted } : item)))
      logger.error('Error toggling AI insight visibility', { error: err, insightId: insight.id })
      toast.error('Failed to update insight visibility')
    } finally {
      setTogglingId(null)
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!generateSymbol.trim()) {
      toast.error('Please input a symbol')
      return
    }

    try {
      setGenerating(true)
      await adminService.generateAIInsight(generateSymbol.trim().toUpperCase())
      toast.success(`Triggered insight generation for ${generateSymbol.trim().toUpperCase()}`)
      setGenerateSymbol('')
      await loadInsights()
    } catch (err) {
      logger.error('Error generating admin AI insight', { error: err, symbol: generateSymbol })
      toast.error('Failed to generate insight')
    } finally {
      setGenerating(false)
    }
  }, [generateSymbol, loadInsights])

  if (loading && items.length === 0) {
    return <LoadingSkeleton />
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={() => void loadInsights()} />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setAppliedSymbolFilter(symbolFilter.trim().toUpperCase())
            }
          }}
          placeholder="Filter by symbol (e.g. FPT)"
        />
        <div className="flex rounded-md border bg-background p-1">
          {(['all', 'visible', 'hidden'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={cn(
                'rounded px-3 py-1 text-sm capitalize',
                visibilityFilter === filter && 'bg-primary text-primary-foreground'
              )}
              onClick={() => setVisibilityFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setAppliedSymbolFilter(symbolFilter.trim().toUpperCase())
          }}
          disabled={loading}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={generateSymbol}
              onChange={(e) => setGenerateSymbol(e.target.value)}
              placeholder="Symbol to generate insight"
              className="max-w-xs"
            />
            <Button onClick={() => void handleGenerate()} disabled={generating}>
              <Sparkles className={cn('mr-2 h-4 w-4', generating && 'animate-pulse')} />
              Trigger Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        <EmptyState icon={Brain} title="No insights found" description="Try another filter or trigger generate." />
      ) : (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const hidden = !!item.isDeleted
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="max-w-[260px]">
                        <span className="line-clamp-2">{item.title}</span>
                      </TableCell>
                      <TableCell>{item.confidence}%</TableCell>
                      <TableCell>{new Date(item.generatedAt).toLocaleString()}</TableCell>
                      <TableCell>{hidden ? <Badge variant="secondary">Hidden</Badge> : <Badge variant="outline">Live</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={!hidden}
                          disabled={togglingId === item.id}
                          onCheckedChange={(checked) => void handleToggleVisibility(item, checked)}
                          aria-label={hidden ? 'Show insight' : 'Hide insight'}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
