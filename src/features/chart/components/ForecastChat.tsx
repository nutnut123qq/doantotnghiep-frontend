import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/shared/components/EmptyState'
import { forecastService } from '@/features/dashboard/services/forecastService'
import { notify } from '@/shared/utils/notify'

interface ForecastMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  forecastData?: {
    trend: 'up' | 'down' | 'neutral'
    period: string
    confidence: number
    targetPrice?: number
    drivers?: string[]
  }
}

interface ForecastChatProps {
  symbol: string
}

const createInitialMessage = (symbol: string): ForecastMessage => ({
  id: '1',
  role: 'assistant',
  content: `I can help you forecast ${symbol} stock price. Ask me questions like:
- "What's the 3-month forecast?"
- "What's the short-term forecast?"
- "What are the key drivers?"`,
  timestamp: new Date(),
})

export const ForecastChat = ({ symbol }: ForecastChatProps) => {
  const [messages, setMessages] = useState<ForecastMessage[]>([createInitialMessage(symbol)])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update initial message when symbol changes
  useEffect(() => {
    setMessages([createInitialMessage(symbol)])
  }, [symbol])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Parse user query to determine time horizon
  const parseTimeHorizon = (query: string): 'short' | 'medium' | 'long' => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('long') || lowerQuery.includes('month') || lowerQuery.includes('3 month')) {
      return 'long'
    }
    if (lowerQuery.includes('medium') || lowerQuery.includes('week') || lowerQuery.includes('2 week')) {
      return 'medium'
    }
    return 'short' // Default to short term
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ForecastMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Parse time horizon from query
      const timeHorizon = parseTimeHorizon(userInput)
      const forecast = await forecastService.getForecast(symbol, timeHorizon)

      // Transform API response to chat message format
      const assistantMessage: ForecastMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: forecast.analysis || `Based on technical analysis for ${symbol}, the forecast indicates a ${forecast.trend.toLowerCase()} trend with ${forecast.confidence} confidence.`,
        timestamp: new Date(),
        forecastData: {
          trend: (forecast.trend === 'Up' ? 'up' : forecast.trend === 'Down' ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
          period: forecastService.getTimeHorizonLabel(timeHorizon),
          confidence: forecast.confidenceScore || (forecast.confidence === 'High' ? 80 : forecast.confidence === 'Medium' ? 60 : 40),
          targetPrice: undefined, // API doesn't provide target price directly
          drivers: forecast.keyDrivers || [],
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      notify.error('Failed to get forecast. Please try again.')
      const errorMessage: ForecastMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I couldn't retrieve the forecast for ${symbol} at this time. Please try again later.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp
      case 'down':
        return TrendingDown
      default:
        return Minus
    }
  }

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-[hsl(var(--positive))]'
      case 'down':
        return 'text-[hsl(var(--negative))]'
      default:
        return 'text-[hsl(var(--muted))]'
    }
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))] flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
          <span>Forecast Chat</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Start a conversation"
              description="Ask about price forecasts and market trends"
            />
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                      : 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Forecast Data */}
                  {message.forecastData && (
                    <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] space-y-2">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const TrendIcon = getTrendIcon(message.forecastData.trend)
                          return (
                            <TrendIcon
                              className={cn('h-4 w-4', getTrendColor(message.forecastData.trend))}
                            />
                          )
                        })()}
                        <span className="text-xs font-medium">
                          {message.forecastData.period} forecast
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.forecastData.confidence}% confidence
                        </Badge>
                      </div>
                      {message.forecastData.targetPrice && (
                        <div className="text-xs text-[hsl(var(--muted))]">
                          Target: {message.forecastData.targetPrice.toLocaleString('vi-VN')} VNĐ
                        </div>
                      )}
                      {message.forecastData.drivers && message.forecastData.drivers.length > 0 && (
                        <div className="text-xs">
                          <div className="font-medium mb-1">Key Drivers:</div>
                          <ul className="list-disc list-inside space-y-1 text-[hsl(var(--muted))]">
                            {message.forecastData.drivers.map((driver, idx) => (
                              <li key={idx}>{driver}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[hsl(var(--surface-2))] rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[hsl(var(--accent))]"></div>
                  <span className="text-sm text-[hsl(var(--muted))]">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about forecast..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
