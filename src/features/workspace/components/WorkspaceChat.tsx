import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { format } from 'date-fns'
import { useSignalR } from '@/shared/hooks/useSignalR'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}

interface WorkspaceChatProps {
  workspaceId: string
}

export const WorkspaceChat = ({ workspaceId }: WorkspaceChatProps) => {
  const { user } = useAuthContext()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John Doe',
      content: 'Welcome to the workspace chat!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // SignalR connection for realtime chat
  const { connection, invoke, on, off } = useSignalR('workspace')

  useEffect(() => {
    if (connection) {
      invoke('JoinWorkspace', workspaceId).catch((err) => {
        console.error('Error joining workspace:', err)
      })

      // Listen for new messages
      const handleMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message])
      }
      on('ReceiveMessage', handleMessage)

      return () => {
        off('ReceiveMessage', handleMessage)
      }
    }
  }, [connection, workspaceId, invoke, on, off])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !user) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.email || '',
      userName: user?.email || 'Anonymous',
      content: input,
      timestamp: new Date(),
    }

    if (connection && invoke) {
      try {
        await invoke('SendMessage', workspaceId, message.content)
        setInput('')
      } catch (err) {
        console.error('Error sending message:', err)
        // Fallback: add message locally
        setMessages((prev) => [...prev, message])
        setInput('')
      }
    } else {
      // Fallback: add message locally
      setMessages((prev) => [...prev, message])
      setInput('')
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
          {messages.map((message) => {
            const isOwnMessage = message.userId === (user?.email || '')
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
