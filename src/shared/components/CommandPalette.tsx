import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, BarChart3, Bell, Star, Calendar, Cpu, Settings, Briefcase } from 'lucide-react'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  keywords: string[]
  category: string
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: BarChart3,
      action: () => {
        navigate('/')
        setOpen(false)
      },
      keywords: ['dashboard', 'home', 'main'],
      category: 'Navigation',
    },
    {
      id: 'trading-board',
      label: 'Go to Trading Board',
      icon: TrendingUp,
      action: () => {
        navigate('/trading-board')
        setOpen(false)
      },
      keywords: ['trading', 'board', 'stocks', 'market'],
      category: 'Navigation',
    },
    {
      id: 'watchlist',
      label: 'Go to Watchlist',
      icon: Star,
      action: () => {
        navigate('/watchlist')
        setOpen(false)
      },
      keywords: ['watchlist', 'favorites', 'track'],
      category: 'Navigation',
    },
    {
      id: 'alerts',
      label: 'Go to Alerts',
      icon: Bell,
      action: () => {
        navigate('/alerts')
        setOpen(false)
      },
      keywords: ['alerts', 'notifications', 'reminders'],
      category: 'Navigation',
    },
    {
      id: 'events',
      label: 'Go to Events',
      icon: Calendar,
      action: () => {
        navigate('/events')
        setOpen(false)
      },
      keywords: ['events', 'calendar', 'corporate'],
      category: 'Navigation',
    },
    {
      id: 'ai-insights',
      label: 'Go to AI Insights',
      icon: Cpu,
      action: () => {
        navigate('/ai-insights')
        setOpen(false)
      },
      keywords: ['ai', 'insights', 'analysis', 'forecast'],
      category: 'Navigation',
    },
    {
      id: 'portfolio',
      label: 'Go to Portfolio',
      icon: Briefcase,
      action: () => {
        navigate('/portfolio')
        setOpen(false)
      },
      keywords: ['portfolio', 'holdings', 'positions'],
      category: 'Navigation',
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: Settings,
      action: () => {
        navigate('/settings')
        setOpen(false)
      },
      keywords: ['settings', 'preferences', 'config'],
      category: 'Navigation',
    },
    ...(user?.role === 'Admin'
      ? [
          {
            id: 'admin',
            label: 'Go to Admin',
            icon: Settings,
            action: () => {
              navigate('/admin')
              setOpen(false)
            },
            keywords: ['admin', 'management'],
            category: 'Navigation',
          },
        ]
      : []),
  ]

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(searchLower))
    )
  })

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = []
    }
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b border-[hsl(var(--border))] px-4 py-3">
          <Search className="h-4 w-4 text-[hsl(var(--muted))] mr-2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
            autoFocus
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-[hsl(var(--surface-2))] px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-[hsl(var(--muted))]">
              No commands found.
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted))] uppercase">
                  {category}
                </div>
                {items.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm',
                        'hover:bg-[hsl(var(--surface-2))] transition-colors',
                        'text-[hsl(var(--text))]'
                      )}
                    >
                      <Icon className="h-4 w-4 text-[hsl(var(--muted))]" />
                      <span>{cmd.label}</span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
