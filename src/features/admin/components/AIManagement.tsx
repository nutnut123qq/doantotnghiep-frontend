import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { adminService } from '../services/adminService'
import type {
  AIProvider,
  AIProbeResult,
  AIPipelineInfo,
  AIRagDocument,
  AICacheStats,
  AIJob,
  AIParameters,
  AITrace,
} from '../services/adminService'
import {
  BrainCircuit,
  Database,
  Layers,
  Server,
  Settings2,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/shared/utils/logger'

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(status: string) {
  const map: Record<string, string> = {
    online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    degraded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    offline: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    not_configured: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    queued: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    ok: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    skipped: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return cn('text-xs px-2 py-0.5 rounded-full font-medium', map[status] || map.queued)
}

function formatTime(iso?: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('vi-VN')
}

function useAsyncData<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const refresh = useCallback(async () => {
    try {
      if (mountedRef.current) setLoading(true)
      if (mountedRef.current) setError(null)
      const result = await fetcher()
      if (mountedRef.current) setData(result)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load data'
      if (mountedRef.current) setError(msg)
      logger.error('useAsyncData error', { error: err })
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, deps)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

function ProvidersTab() {
  const { data: providers, loading, error, refresh } = useAsyncData(() => adminService.getAIProviders())
  const [probing, setProbing] = useState(false)
  const [probeResult, setProbeResult] = useState<AIProbeResult | null>(null)

  const handleProbe = async () => {
    try {
      setProbing(true)
      const result = await adminService.probeAIProviders()
      setProbeResult(result)
      toast.success('Probed all providers')
      await refresh()
    } catch (err) {
      logger.error('Probe failed', { error: err })
      toast.error('Probe failed')
    } finally {
      setProbing(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error) return <div className="text-red-500">{error}</div>

  const merged = (providers || []).map((p) => {
    const probed = probeResult?.results.find((r) => r.id === p.id)
    return { ...p, status: probed?.status || p.status, latencyMs: probed?.latencyMs || p.latencyMs }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[hsl(var(--text))]">LLM Providers</h3>
        <Button size="sm" variant="outline" onClick={handleProbe} disabled={probing}>
          <RotateCcw className={cn('mr-1.5 h-3.5 w-3.5', probing && 'animate-spin')} />
          Probe All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {merged.map((p) => (
          <Card key={p.id} className="bg-[hsl(var(--surface-1))]">
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-[hsl(var(--text)/0.7)]" />
                  <span className="font-semibold text-[hsl(var(--text))]">{p.name}</span>
                </div>
                <span className={statusBadge(p.status)}>{p.status.toUpperCase()}</span>
              </div>

              <div className="space-y-1 text-sm text-[hsl(var(--text)/0.7)]">
                <div className="flex justify-between">
                  <span>Model</span>
                  <span className="font-medium text-[hsl(var(--text))]">{p.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span className="font-medium text-[hsl(var(--text))]">
                    {p.latencyMs > 0 ? `${p.latencyMs}ms` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>API Key</span>
                  <span className="font-mono text-xs">{p.keyMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority</span>
                  <span className="font-medium text-[hsl(var(--text))]">#{p.priority}</span>
                </div>
              </div>

              {p.quotaTotal > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[hsl(var(--text)/0.7)]">
                    <span>Quota</span>
                    <span>{p.quotaRemaining} / {p.quotaTotal}</span>
                  </div>
                  <Progress value={(p.quotaRemaining / p.quotaTotal) * 100} className="h-1.5" />
                </div>
              )}

              {p.note && (
                <p className="rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  {p.note}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PipelineTab() {
  const { data: pipeline, loading, error, refresh } = useAsyncData(() => adminService.getAIPipeline())

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error || !pipeline) return <div className="text-red-500">{error || 'No data'}</div>

  const enabledCount = pipeline.nodes.filter((n) => n.enabled).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-sm text-[hsl(var(--text)/0.7)]">
            Nodes: <span className="font-semibold text-[hsl(var(--text))]">{enabledCount}</span> / {pipeline.nodes.length}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => void refresh()}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Agent Node</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipeline.nodes.map((node, idx) => (
                <TableRow key={node.id} className={cn(!node.enabled && 'opacity-50')}>
                  <TableCell className="text-[hsl(var(--text)/0.5)]">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="font-medium text-[hsl(var(--text))]">{node.name}</span>
                      {node.type === 'final' && <Badge variant="outline" className="text-xs">FINAL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">{node.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch checked={node.enabled} disabled />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pipeline Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {pipeline.nodes
              .filter((a) => a.enabled)
              .map((node, idx, arr) => (
                <div key={node.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium',
                      node.type === 'final'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
                    )}
                  >
                    {node.name}
                  </div>
                  {idx < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--text)/0.4)]" />}
                </div>
              ))}
          </div>
          <p className="mt-3 text-xs text-[hsl(var(--text)/0.5)]">
            * Provider: {pipeline.provider}. Estimated LLM calls: {pipeline.estimatedLlmCalls}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function RagTab() {
  const { data: docs, loading, error, refresh } = useAsyncData(() => adminService.getRAGDocuments())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await adminService.deleteRAGDocument(id)
      toast.success('Document deleted')
      await refresh()
    } catch (err) {
      logger.error('Delete RAG doc failed', { error: err })
      toast.error('Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[hsl(var(--text))]">RAG Documents ({docs?.length ?? 0})</h3>
      </div>

      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(docs || []).map((doc) => (
                <TableRow key={doc.documentId}>
                  <TableCell className="font-mono text-xs">{doc.documentId}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{doc.source}</TableCell>
                  <TableCell><Badge variant="outline">{doc.symbol}</Badge></TableCell>
                  <TableCell>{doc.chunks}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 text-red-500 hover:text-red-600" disabled={deletingId === doc.documentId} onClick={() => void handleDelete(doc.documentId)}>
                      {deletingId === doc.documentId ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CacheTab() {
  const { data: stats, loading, error, refresh } = useAsyncData(() => adminService.getCacheStats())
  const [saving, setSaving] = useState(false)
  const [ttls, setTtls] = useState({ analyze: 1800, quote: 45, history: 21600, symbols: 86400 })

  const handleSave = async () => {
    try {
      setSaving(true)
      await adminService.updateCacheTTL({
        analyzeTtl: ttls.analyze,
        quoteTtl: ttls.quote,
        historyTtl: ttls.history,
        symbolsTtl: ttls.symbols,
      })
      toast.success('Cache TTL updated')
    } catch (err) {
      logger.error('Update TTL failed', { error: err })
      toast.error('Failed to update TTL')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-5">
            <p className="text-xs text-[hsl(var(--text)/0.6)]">Hit Rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.hitRatePercent ?? 0}%</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-5">
            <p className="text-xs text-[hsl(var(--text)/0.6)]">Memory Used</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--text))]">{stats?.memoryUsedMb ?? 0} MB</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-5">
            <p className="text-xs text-[hsl(var(--text)/0.6)]">Total Keys</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--text))]">{stats?.totalKeys ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-5">
            <p className="text-xs text-[hsl(var(--text)/0.6)]">Connected Clients</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--text))]">{stats?.connectedClients ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cache TTL Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Analyze Result', key: 'analyze', desc: '30 minutes' },
            { label: 'Stock Quote', key: 'quote', desc: '45 seconds' },
            { label: 'History (OHLCV)', key: 'history', desc: '6 hours' },
            { label: 'Symbols List', key: 'symbols', desc: '24 hours' },
          ].map((ttl) => (
            <div key={ttl.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text))]">{ttl.label}</p>
                <p className="text-xs text-[hsl(var(--text)/0.5)]">{ttl.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={ttls[ttl.key as keyof typeof ttls]}
                  onChange={(e) => setTtls((prev) => ({ ...prev, [ttl.key]: Number(e.target.value) }))}
                  className="w-24 text-right"
                />
                <span className="text-xs text-[hsl(var(--text)/0.6)]">s</span>
              </div>
            </div>
          ))}
          <Button size="sm" className="ml-auto block" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Save TTLs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function JobsTab() {
  const { data: jobs, loading, error, refresh } = useAsyncData(() => adminService.getAIJobs())
  const [actingId, setActingId] = useState<string | null>(null)

  const handleRetry = async (id: string) => {
    try {
      setActingId(id)
      await adminService.retryAIJob(id)
      toast.success('Job requeued')
      await refresh()
    } catch (err) {
      logger.error('Retry failed', { error: err })
      toast.error('Failed to retry job')
    } finally {
      setActingId(null)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      setActingId(id)
      await adminService.cancelAIJob(id)
      toast.success('Job cancelled')
      await refresh()
    } catch (err) {
      logger.error('Cancel failed', { error: err })
      toast.error('Failed to cancel job')
    } finally {
      setActingId(null)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[hsl(var(--text))]">RQ Job Queue</h3>
        <Button size="sm" variant="outline" onClick={() => void refresh()}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Enqueued</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(jobs || []).map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs">{job.id}</TableCell>
                  <TableCell><Badge variant="outline">{job.symbol}</Badge></TableCell>
                  <TableCell><span className={statusBadge(job.status)}>{job.status.toUpperCase()}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={job.progress} className="h-1.5 w-20" />
                      <span className="text-xs text-[hsl(var(--text)/0.6)]">{job.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[hsl(var(--text)/0.7)]">{formatTime(job.enqueuedAt)}</TableCell>
                  <TableCell className="text-right">
                    {job.status === 'failed' && (
                      <Button size="sm" variant="ghost" className="h-7" disabled={actingId === job.id} onClick={() => void handleRetry(job.id)}>
                        {actingId === job.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1 h-3 w-3" />}
                        Retry
                      </Button>
                    )}
                    {(job.status === 'running' || job.status === 'queued') && (
                      <Button size="sm" variant="ghost" className="h-7 text-red-500" disabled={actingId === job.id} onClick={() => void handleCancel(job.id)}>
                        {actingId === job.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : 'Cancel'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(jobs || []).map(
        (job) =>
          job.status === 'failed' && job.error && (
            <Card key={`err-${job.id}`} className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
              <CardContent className="py-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-400">
                  <XCircle className="mr-1 inline h-3.5 w-3.5" />
                  {job.id} — {job.error}
                </p>
              </CardContent>
            </Card>
          )
      )}
    </div>
  )
}

function ParametersTab() {
  const { data: params, loading, error, refresh } = useAsyncData(() => adminService.getAIParameters())
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<AIParameters>>({})

  useEffect(() => {
    if (params) setForm(params)
  }, [params])

  const handleSave = async () => {
    try {
      setSaving(true)
      await adminService.updateAIParameters({
        temperature: form.temperature,
        maxTokens: form.maxTokens,
        promptVersion: form.promptVersion,
        shadowMode: form.shadowMode,
        canaryRatio: form.canaryRatio,
      })
      toast.success('Parameters updated')
      await refresh()
    } catch (err) {
      logger.error('Update parameters failed', { error: err })
      toast.error('Failed to update parameters')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Generation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--text))]">Temperature</label>
              <div className="flex items-center gap-3">
                <Input type="number" step={0.1} min={0} max={2} value={form.temperature ?? 0.7} onChange={(e) => setForm((p) => ({ ...p, temperature: Number(e.target.value) }))} className="w-24" />
                <span className="text-xs text-[hsl(var(--text)/0.5)]">0 = deterministic, 2 = very creative</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--text))]">Max Tokens</label>
              <div className="flex items-center gap-3">
                <Input type="number" step={128} min={256} max={8192} value={form.maxTokens ?? 2048} onChange={(e) => setForm((p) => ({ ...p, maxTokens: Number(e.target.value) }))} className="w-24" />
                <span className="text-xs text-[hsl(var(--text)/0.5)]">Max output length per LLM call</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--text))]">Insight Prompt Version</label>
            <Select value={form.promptVersion ?? 'insight_v2'} onValueChange={(v) => setForm((p) => ({ ...p, promptVersion: v }))}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insight_v1">insight_v1 (legacy)</SelectItem>
                <SelectItem value="insight_v2">insight_v2 (current)</SelectItem>
                <SelectItem value="insight_v2_1">insight_v2.1 (experimental)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-md border border-[hsl(var(--border))] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text))]">Shadow Mode</p>
                <p className="text-xs text-[hsl(var(--text)/0.5)]">Run both strict & legacy prompts and compare outputs</p>
              </div>
              <Switch checked={form.shadowMode ?? false} onCheckedChange={(v) => setForm((p) => ({ ...p, shadowMode: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text))]">Canary Ratio</p>
                <p className="text-xs text-[hsl(var(--text)/0.5)]">Percentage of traffic using new prompt (0–1)</p>
              </div>
              <Input type="number" step={0.05} min={0} max={1} value={form.canaryRatio ?? 1.0} onChange={(e) => setForm((p) => ({ ...p, canaryRatio: Number(e.target.value) }))} className="w-20 text-right" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[hsl(var(--text)/0.5)]">
            <span>Provider: {form.llmProvider}</span>
            <span>|</span>
            <span>Default Model: {form.defaultModel}</span>
          </div>

          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Save Parameters
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function TracesTab() {
  const { data: traces, loading, error, refresh } = useAsyncData(() => adminService.getAITraces(20))
  const [clearing, setClearing] = useState(false)

  const handleClear = async () => {
    try {
      setClearing(true)
      await adminService.clearAITraces()
      toast.success('Traces cleared')
      await refresh()
    } catch (err) {
      logger.error('Clear traces failed', { error: err })
      toast.error('Failed to clear traces')
    } finally {
      setClearing(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (error) return <div className="text-red-500">{error}</div>

  const selectedTrace = traces?.[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[hsl(var(--text))]">Execution Traces ({traces?.length ?? 0})</h3>
        <Button size="sm" variant="outline" onClick={() => void refresh()}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {selectedTrace && (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Latest: <span className="text-[hsl(var(--primary))]">{selectedTrace.symbol}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedTrace.provider}</Badge>
                <span className="text-xs text-[hsl(var(--text)/0.6)]">{selectedTrace.totalMs}ms total</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {selectedTrace.nodes.map((node, idx) => (
                <div key={node.name} className="flex items-center gap-3">
                  <div className="w-8 text-right text-xs text-[hsl(var(--text)/0.4)]">{idx + 1}</div>
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                      node.status === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                    )}
                  >
                    {node.status === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px]">SKIP</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[hsl(var(--text))]">{node.name}</span>
                      {node.parallel && <Badge variant="secondary" className="text-[10px]">PARALLEL</Badge>}
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs text-[hsl(var(--text)/0.6)]">
                    {node.ms > 0 ? `${node.ms}ms` : '—'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-4">
              <div className="mb-2 flex items-center gap-3">
                <Badge className={cn((selectedTrace.result.forecast as string) === 'UP' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                  {String(selectedTrace.result.forecast)}
                </Badge>
                <span className="text-sm font-semibold text-[hsl(var(--text))]">
                  Confidence: {String(selectedTrace.result.confidence)}%
                </span>
              </div>
              <p className="text-sm text-[hsl(var(--text)/0.8)]">{String(selectedTrace.result.reasoning ?? '')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button size="sm" variant="outline" onClick={() => void handleClear()} disabled={clearing}>
        {clearing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
        Clear All Traces
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function AIManagement() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(var(--text))]">AI Management</h2>
          <p className="text-sm text-[hsl(var(--text)/0.6)]">
            Quản lý multi-agent pipeline, LLM providers, RAG và cache
          </p>
        </div>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="providers"><Zap className="mr-1.5 h-3.5 w-3.5" />Providers</TabsTrigger>
          <TabsTrigger value="pipeline"><Layers className="mr-1.5 h-3.5 w-3.5" />Pipeline</TabsTrigger>
          <TabsTrigger value="rag"><Database className="mr-1.5 h-3.5 w-3.5" />RAG</TabsTrigger>
          <TabsTrigger value="cache"><Server className="mr-1.5 h-3.5 w-3.5" />Cache</TabsTrigger>
          <TabsTrigger value="jobs"><Clock className="mr-1.5 h-3.5 w-3.5" />Jobs</TabsTrigger>
          <TabsTrigger value="parameters"><Settings2 className="mr-1.5 h-3.5 w-3.5" />Parameters</TabsTrigger>
          <TabsTrigger value="traces"><BrainCircuit className="mr-1.5 h-3.5 w-3.5" />Traces</TabsTrigger>
        </TabsList>

        <TabsContent value="providers"><ProvidersTab /></TabsContent>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="rag"><RagTab /></TabsContent>
        <TabsContent value="cache"><CacheTab /></TabsContent>
        <TabsContent value="jobs"><JobsTab /></TabsContent>
        <TabsContent value="parameters"><ParametersTab /></TabsContent>
        <TabsContent value="traces"><TracesTab /></TabsContent>
      </Tabs>
    </div>
  )
}
