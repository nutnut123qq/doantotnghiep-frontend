import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Plus, Users } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'

interface SharedWatchlist {
  id: string
  name: string
  description?: string
  stockCount: number
  memberCount: number
  createdBy: string
  createdAt: Date
}

interface SharedWatchlistsProps {
  workspaceId: string
  canEdit: boolean
}

const MOCK_WATCHLISTS: SharedWatchlist[] = [
  {
    id: '1',
    name: 'Tech Stocks',
    description: 'Technology sector watchlist',
    stockCount: 15,
    memberCount: 3,
    createdBy: 'John Doe',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Banking Sector',
    description: 'Major banking stocks',
    stockCount: 8,
    memberCount: 2,
    createdBy: 'Jane Smith',
    createdAt: new Date(),
  },
]

export const SharedWatchlists = ({ canEdit }: SharedWatchlistsProps) => {
  const [watchlists] = useState<SharedWatchlist[]>(MOCK_WATCHLISTS)
  const [isLoading] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Shared Watchlists</span>
          </CardTitle>
          {canEdit && (
            <Button size="sm" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {watchlists.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No shared watchlists"
            description="Create a watchlist to share with your team"
          />
        ) : (
          <div className="space-y-3">
            {watchlists.map((watchlist) => (
              <div
                key={watchlist.id}
                className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-semibold text-[hsl(var(--text))]">
                        {watchlist.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Shared
                      </Badge>
                    </div>
                    {watchlist.description && (
                      <p className="text-sm text-[hsl(var(--muted))] mb-2">
                        {watchlist.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-[hsl(var(--muted))]">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{watchlist.stockCount} stocks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{watchlist.memberCount} members</span>
                      </div>
                      <span>Created by {watchlist.createdBy}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
