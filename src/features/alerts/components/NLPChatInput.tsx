import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SparklesIcon } from '@heroicons/react/24/outline'
import type { CreateAlertRequest, ParsedAlert } from '../types/alert.types'

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

  const handleParse = async () => {
    if (!input.trim()) return

    setIsParsing(true)
    try {
      // Create alert with NLP input - backend will parse it
      // We'll show a preview by creating a temporary alert request
      const request: CreateAlertRequest = {
        naturalLanguageInput: input,
      }

      // For now, we'll submit directly and let backend parse
      // In a real implementation, you might want to call a parse endpoint first
      // to show preview before submitting
      onSubmit(request)
    } catch (error) {
      console.error('Error parsing alert:', error)
    } finally {
      setIsParsing(false)
    }
  }


  const examples = [
    'Alert me when VIC price goes above 100000',
    'Notify if VNM volume exceeds 1 million',
    'Alert when VCB price drops by 5%',
    'Notify me if HPG sentiment becomes negative',
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nlp-input">
          Describe your alert in natural language
        </Label>
        <textarea
          id="nlp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Alert me when VIC price goes above 100000"
          className="w-full min-h-[120px] px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          disabled={isLoading || isParsing}
        />
      </div>


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

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isParsing}>
          Cancel
        </Button>
        <Button onClick={handleParse} disabled={isLoading || isParsing || !input.trim()}>
          {isParsing ? (
            <>
              <SparklesIcon className="h-4 w-4 mr-2 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Parse & Create
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
