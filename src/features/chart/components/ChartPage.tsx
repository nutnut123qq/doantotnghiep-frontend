import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/shared/components/PageHeader'
import { TradingViewChart } from '@/features/dashboard/components/TradingViewChart'
import { EChartsAdvanced } from './EChartsAdvanced'
import { AIInsightsPanel } from './AIInsightsPanel'
import { ForecastChat } from './ForecastChat'
import { IndicatorsDisplay } from './IndicatorsDisplay'
import { DrawingToolsPanel } from './DrawingToolsPanel'
import { Search } from 'lucide-react'

export const ChartPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const symbol = searchParams.get('symbol') || 'VIC'
  const [selectedSymbol, setSelectedSymbol] = useState(symbol)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (symbol) {
      setSelectedSymbol(symbol)
    }
  }, [symbol])

  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol)
    navigate(`/chart?symbol=${newSymbol}`, { replace: true })
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={`${selectedSymbol} Chart`}
          description="Technical analysis with AI insights and forecasts"
          actions={
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      const newSymbol = searchQuery.trim().toUpperCase()
                      setSelectedSymbol(newSymbol)
                      navigate(`/chart?symbol=${newSymbol}`, { replace: true })
                      setSearchQuery('')
                    }
                  }}
                  placeholder="Search symbol..."
                  className="pl-9 w-[200px]"
                />
              </div>
            </div>
          }
        />

        {/* Main Chart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[hsl(var(--text))]">
                  Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EChartsAdvanced symbol={selectedSymbol} height={600} />
              </CardContent>
            </Card>

            {/* Indicators */}
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[hsl(var(--text))]">
                  Technical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IndicatorsDisplay symbol={selectedSymbol} />
              </CardContent>
            </Card>

            {/* Drawing Tools */}
            <DrawingToolsPanel symbol={selectedSymbol} />
          </div>

          {/* AI Panel - 1/3 width */}
          <div className="space-y-6">
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
              </TabsList>
              <TabsContent value="insights" className="mt-4">
                <AIInsightsPanel symbol={selectedSymbol} />
              </TabsContent>
              <TabsContent value="forecast" className="mt-4">
                <ForecastChat symbol={selectedSymbol} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
