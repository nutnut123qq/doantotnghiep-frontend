import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { alertService } from '../services/alertService'
import type { CreateAlertRequest, ParsedAlert } from '../types/alert.types'
import { AlertType } from '../types/alert.types'
import { getErrorMessage } from '@/shared/types/error.types'

interface ChatMessage {
  id: string
  type: 'user' | 'system'
  content: string
  parsedAlert?: ParsedAlert
  timestamp: Date
}

interface NLPChatInputProps {
  onSubmit: (data: CreateAlertRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export const NLPChatInput = ({
  onSubmit,
  onCancel,
  isLoading,
}: NLPChatInputProps) => {
  const [input, setInput] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentParsedAlert, setCurrentParsedAlert] = useState<ParsedAlert | null>(null)

  const handleParse = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setIsParsing(true)
    try {
      const parsed = await alertService.parseAlert(input.trim())
      
      const systemMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Parsed alert successfully',
        parsedAlert: parsed,
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const updated = [...prev, userMessage, systemMessage]
        // Keep only last 5 messages (3 user + 2 system pairs, or adjust)
        return updated.slice(-5)
      })
      
      setCurrentParsedAlert(parsed)
      setInput('') // Clear input after successful parse
    } catch (error: unknown) {
      console.error('Error parsing alert:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: getErrorMessage(error) || 'Failed to parse alert. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage, errorMessage].slice(-5))
    } finally {
      setIsParsing(false)
    }
  }

  const handleCreate = () => {
    if (!currentParsedAlert) return

    const request: CreateAlertRequest = {
      symbol: currentParsedAlert.symbol,
      type: parseAlertType(currentParsedAlert.type),
      condition: currentParsedAlert.operator,
      threshold: currentParsedAlert.value,
      timeframe: currentParsedAlert.timeframe,
    }

    onSubmit(request)
    // Reset after create
    setCurrentParsedAlert(null)
    setMessages([])
  }

  const parseAlertType = (type: string): AlertType => {
    const lower = type.toLowerCase()
    if (lower.includes('price')) return AlertType.Price
    if (lower.includes('volume')) return AlertType.Volume
    if (lower.includes('technical')) return AlertType.TechnicalIndicator
    if (lower.includes('sentiment')) return AlertType.Sentiment
    if (lower.includes('volatility')) return AlertType.Volatility
    return AlertType.Price // default
  }

  const examples = [
    'Alert me when VIC price goes above 100000',
    'Notify if VNM volume exceeds 1 million',
    'Alert when VCB price drops by 5%',
    'Notify me if HPG sentiment becomes negative',
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Chat History */}
      <div className="flex-1 min-h-[200px] max-h-[300px] overflow-y-auto border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Start a conversation by typing your alert request below
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.parsedAlert && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Parsed Alert:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Symbol:</span>{' '}
                        <span className="text-blue-600 dark:text-blue-400">
                          {message.parsedAlert.symbol}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{' '}
                        <span>{message.parsedAlert.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Condition:</span>{' '}
                        <span>{message.parsedAlert.operator}</span>
                      </div>
                      <div>
                        <span className="font-medium">Threshold:</span>{' '}
                        <span>{message.parsedAlert.value}</span>
                      </div>
                      {message.parsedAlert.timeframe && (
                        <div className="col-span-2">
                          <span className="font-medium">Timeframe:</span>{' '}
                          <span>{message.parsedAlert.timeframe}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Current Parsed Preview (if exists) */}
      {currentParsedAlert && (
        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Ready to Create Alert:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <strong>Symbol:</strong> {currentParsedAlert.symbol}
            </div>
            <div>
              <strong>Type:</strong> {currentParsedAlert.type}
            </div>
            <div>
              <strong>Condition:</strong> {currentParsedAlert.operator}
            </div>
            <div>
              <strong>Value:</strong> {currentParsedAlert.value}
            </div>
            {currentParsedAlert.timeframe && (
              <div className="col-span-2">
                <strong>Timeframe:</strong> {currentParsedAlert.timeframe}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInput(example)}
              className="text-xs px-3 py-1 bg-muted text-foreground rounded-full hover:bg-accent"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <Label htmlFor="nlp-input">Describe your alert in natural language</Label>
        <textarea
          id="nlp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleParse()
            }
          }}
          placeholder="e.g., Alert me when VIC price goes above 100000"
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          disabled={isLoading || isParsing}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isParsing}>
          Cancel
        </Button>
        {currentParsedAlert ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentParsedAlert(null)
                setInput('')
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </>
        ) : (
          <Button onClick={handleParse} disabled={isLoading || isParsing || !input.trim()}>
            {isParsing ? (
              <>
                <SparklesIcon className="h-4 w-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Parse
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
