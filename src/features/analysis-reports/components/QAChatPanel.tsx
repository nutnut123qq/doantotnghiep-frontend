import { useState } from 'react'
import { toast } from 'sonner'
import { analysisReportApi } from '@/infrastructure/api/analysisReportApi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { QAMessage } from '@/shared/types/analysisReportTypes'
import { CitationsList } from './CitationsList'

type Props = {
  reportId: string
}

export const QAChatPanel = ({ reportId }: Props) => {
  const [messages, setMessages] = useState<QAMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    const question = input.trim()
    if (!question || isLoading) return

    const userMessage: QAMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await analysisReportApi.askQuestion(reportId, question)
      const assistantMessage: QAMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      toast.error('Không thể gọi AI. Vui lòng thử lại.')
      const assistantMessage: QAMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Hỏi đáp về báo cáo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 h-[600px]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Gợi ý: “Khuyến nghị là gì?”, “Giá mục tiêu?”, “Rủi ro chính?”
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.role === 'user' ? 'text-right' : 'text-left'}
            >
              <div
                className={[
                  'inline-block max-w-[90%] rounded px-3 py-2 text-sm whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                ].join(' ')}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' &&
                msg.citations &&
                msg.citations.length > 0 && (
                  <div className="mt-2">
                    <CitationsList citations={msg.citations} />
                  </div>
                )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Đặt câu hỏi..."
            disabled={isLoading}
            className="min-h-[72px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
