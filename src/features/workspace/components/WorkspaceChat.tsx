import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { format } from 'date-fns'
import { workspaceService, type WorkspaceMessage } from '../services/workspaceService'
import { useWorkspaceRealtime, type WorkspaceMessage as RealtimeMessage } from '../hooks/useWorkspaceRealtime'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date | string
}

interface WorkspaceChatProps {
  workspaceId: string
}

export const WorkspaceChat = ({ workspaceId }: WorkspaceChatProps) => {
  const { user } = useAuthContext()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages from API
  const { data: apiMessages, isLoading } = useQuery({
    queryKey: ['workspace-messages', workspaceId],
    queryFn: () => workspaceService.getMessages(workspaceId, 50),
    enabled: !!workspaceId,
  })

  // Convert API messages to ChatMessage format
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (apiMessages) {
      const converted: ChatMessage[] = apiMessages.map((msg) => ({
        id: msg.id,
        userId: msg.userId,
        userName: msg.user?.email || 'Unknown User',
        content: msg.content,
        timestamp: msg.createdAt,
      }))
      setMessages(converted)
    }
  }, [apiMessages])

  // Realtime messaging
  const { sendMessage: sendRealtimeMessage } = useWorkspaceRealtime(
    workspaceId,
    (message: RealtimeMessage) => {
      // Add new message from SignalR
      const chatMessage: ChatMessage = {
        id: message.id,
        userId: message.userId,
        userName: message.userName,
        content: message.content,
        timestamp: message.timestamp,
      }
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === chatMessage.id)) return prev
        return [...prev, chatMessage]
      })
    }
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !user) return

    const content = input.trim()
    setInput('')

    try {
      // Try SignalR first
      await sendRealtimeMessage(content)
    } catch (err) {
      console.error('Error sending via SignalR, falling back to API:', err)
      // Fallback: send via API
      try {
        const savedMessage = await workspaceService.sendMessage(workspaceId, content)
        const chatMessage: ChatMessage = {
          id: savedMessage.id,
          userId: savedMessage.userId,
          userName: savedMessage.user?.email || user.email || 'Unknown',
          content: savedMessage.content,
          timestamp: savedMessage.createdAt,
        }
        setMessages((prev) => [...prev, chatMessage])
      } catch (apiErr) {
        console.error('Error sending via API:', apiErr)
        // Restore input on error
        setInput(content)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="p-6">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))] flex flex-col h-[calc(100vh-300px)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-[hsl(var(--muted))] py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
          {messages.map((message) => {
            const isOwnMessage = message.userId === (user?.id || user?.email || '')
            return (
              <div
                key={message.id}
                className={cn('flex items-start space-x-3', isOwnMessage && 'flex-row-reverse space-x-reverse')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                    {getInitials(message.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn('flex-1 max-w-[70%]', isOwnMessage && 'flex flex-col items-end')}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-[hsl(var(--text))]">
                      {message.userName}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted))]">
                      {format(message.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg p-3',
                      isOwnMessage
                        ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                        : 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 pt-4 border-t border-[hsl(var(--border))]">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
