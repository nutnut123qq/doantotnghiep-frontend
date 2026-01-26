import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, Minus, Square, X } from 'lucide-react'
import { useEChartsDrawing } from '../hooks/useEChartsDrawing'
import { notify } from '@/shared/utils/notify'
import { cn } from '@/lib/utils'

interface DrawingToolsPanelProps {
  symbol: string
}

export const DrawingToolsPanel = ({ symbol }: DrawingToolsPanelProps) => {
  const { drawings, loadDrawings, addTrendline, addZone, removeDrawing, clearDrawings } = useEChartsDrawing(symbol)
  const [drawingMode, setDrawingMode] = useState<'trendline' | 'zone' | null>(null)
  
  // Trendline form
  const [trendlineStartDate, setTrendlineStartDate] = useState('')
  const [trendlineStartPrice, setTrendlineStartPrice] = useState('')
  const [trendlineEndDate, setTrendlineEndDate] = useState('')
  const [trendlineEndPrice, setTrendlineEndPrice] = useState('')
  const [trendlineColor, setTrendlineColor] = useState('#ff6b6b')
  const [trendlineLabel, setTrendlineLabel] = useState('')

  // Zone form
  const [zoneStartDate, setZoneStartDate] = useState('')
  const [zoneEndDate, setZoneEndDate] = useState('')
  const [zoneMinPrice, setZoneMinPrice] = useState('')
  const [zoneMaxPrice, setZoneMaxPrice] = useState('')
  const [zoneColor, setZoneColor] = useState('#ff6b6b')
  const [zoneOpacity, setZoneOpacity] = useState('0.2')

  useEffect(() => {
    loadDrawings()
  }, [symbol, loadDrawings])

  const handleAddTrendline = async () => {
    if (!trendlineStartDate || !trendlineStartPrice || !trendlineEndDate || !trendlineEndPrice) {
      notify.warning('Please fill in all trendline fields')
      return
    }

    try {
      await addTrendline(
        [
          [trendlineStartDate, parseFloat(trendlineStartPrice)],
          [trendlineEndDate, parseFloat(trendlineEndPrice)],
        ],
        {
          color: trendlineColor,
          label: trendlineLabel || undefined,
        }
      )
      notify.success('Trendline added')
      // Reset form
      setTrendlineStartDate('')
      setTrendlineStartPrice('')
      setTrendlineEndDate('')
      setTrendlineEndPrice('')
      setTrendlineLabel('')
      setDrawingMode(null)
    } catch (error) {
      notify.error('Failed to add trendline')
    }
  }

  const handleAddZone = async () => {
    if (!zoneStartDate || !zoneEndDate || !zoneMinPrice || !zoneMaxPrice) {
      notify.warning('Please fill in all zone fields')
      return
    }

    try {
      await addZone(
        [
          [
            { name: zoneStartDate, yAxis: parseFloat(zoneMinPrice) },
            { name: zoneStartDate, yAxis: parseFloat(zoneMaxPrice) },
          ],
          [
            { name: zoneEndDate, yAxis: parseFloat(zoneMaxPrice) },
            { name: zoneEndDate, yAxis: parseFloat(zoneMinPrice) },
          ],
        ],
        {
          color: zoneColor,
          opacity: parseFloat(zoneOpacity),
        }
      )
      notify.success('Zone added')
      // Reset form
      setZoneStartDate('')
      setZoneEndDate('')
      setZoneMinPrice('')
      setZoneMaxPrice('')
      setDrawingMode(null)
    } catch (error) {
      notify.error('Failed to add zone')
    }
  }

  const handleRemoveDrawing = async (id: string, type: 'trendline' | 'zone') => {
    try {
      await removeDrawing(id, type)
      notify.success('Drawing removed')
    } catch (error) {
      notify.error('Failed to remove drawing')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all drawings?')) return
    try {
      await clearDrawings()
      notify.success('All drawings cleared')
    } catch (error) {
      notify.error('Failed to clear drawings')
    }
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">
            Drawing Tools
          </CardTitle>
          {((drawings.trendlines?.length || 0) + (drawings.zones?.length || 0)) > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Drawing</TabsTrigger>
            <TabsTrigger value="list">My Drawings</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Drawing Type</Label>
              <div className="flex space-x-2">
                <Button
                  variant={drawingMode === 'trendline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode('trendline')}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Trendline
                </Button>
                <Button
                  variant={drawingMode === 'zone' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode('zone')}
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Zone
                </Button>
              </div>
            </div>

            {drawingMode === 'trendline' && (
              <div className="space-y-3 p-3 border rounded-lg bg-[hsl(var(--surface-2))]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={trendlineStartDate}
                      onChange={(e) => setTrendlineStartDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Start Price</Label>
                    <Input
                      type="number"
                      value={trendlineStartPrice}
                      onChange={(e) => setTrendlineStartPrice(e.target.value)}
                      placeholder="Price"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={trendlineEndDate}
                      onChange={(e) => setTrendlineEndDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Price</Label>
                    <Input
                      type="number"
                      value={trendlineEndPrice}
                      onChange={(e) => setTrendlineEndPrice(e.target.value)}
                      placeholder="Price"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={trendlineColor}
                      onChange={(e) => setTrendlineColor(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Label (optional)</Label>
                    <Input
                      value={trendlineLabel}
                      onChange={(e) => setTrendlineLabel(e.target.value)}
                      placeholder="Label"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button onClick={handleAddTrendline} size="sm" className="w-full">
                  Add Trendline
                </Button>
              </div>
            )}

            {drawingMode === 'zone' && (
              <div className="space-y-3 p-3 border rounded-lg bg-[hsl(var(--surface-2))]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={zoneStartDate}
                      onChange={(e) => setZoneStartDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={zoneEndDate}
                      onChange={(e) => setZoneEndDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min Price</Label>
                    <Input
                      type="number"
                      value={zoneMinPrice}
                      onChange={(e) => setZoneMinPrice(e.target.value)}
                      placeholder="Min"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Price</Label>
                    <Input
                      type="number"
                      value={zoneMaxPrice}
                      onChange={(e) => setZoneMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={zoneColor}
                      onChange={(e) => setZoneColor(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Opacity</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={zoneOpacity}
                      onChange={(e) => setZoneOpacity(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button onClick={handleAddZone} size="sm" className="w-full">
                  Add Zone
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {drawings.trendlines && drawings.trendlines.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[hsl(var(--muted))] mb-2">Trendlines</div>
                  {drawings.trendlines.map((trendline) => (
                    <div
                      key={trendline.id}
                      className="flex items-center justify-between p-2 rounded border bg-[hsl(var(--surface-2))] mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-0.5"
                          style={{ backgroundColor: trendline.lineStyle?.color || '#ff6b6b' }}
                        />
                        <span className="text-xs text-[hsl(var(--text))]">
                          {Array.isArray(trendline.coord[0]) ? trendline.coord[0][0] : 'Start'} →{' '}
                          {Array.isArray(trendline.coord[1]) ? trendline.coord[1][0] : 'End'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveDrawing(trendline.id, 'trendline')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {drawings.zones && drawings.zones.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[hsl(var(--muted))] mb-2">Zones</div>
                  {drawings.zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-2 rounded border bg-[hsl(var(--surface-2))] mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: zone.itemStyle?.color || 'rgba(255, 107, 107, 0.2)',
                            opacity: zone.itemStyle?.opacity || 0.2,
                          }}
                        />
                        <span className="text-xs text-[hsl(var(--text))]">Zone</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveDrawing(zone.id, 'zone')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {(!drawings.trendlines || drawings.trendlines.length === 0) &&
                (!drawings.zones || drawings.zones.length === 0) && (
                  <div className="text-center py-8 text-sm text-[hsl(var(--muted))]">
                    No drawings yet. Add a trendline or zone to get started.
                  </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
