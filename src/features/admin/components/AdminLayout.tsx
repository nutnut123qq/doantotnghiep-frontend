import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3,
  Brain,
  CalendarDays,
  Landmark,
  LogOut,
  Newspaper,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/shared/contexts/AuthContext'

const adminNavigation = [
  { label: 'Tổng quan', to: '/admin', icon: BarChart3, end: true },
  { label: 'Người dùng', to: '/admin/users', icon: Users },
  { label: 'Tin tức', to: '/admin/news', icon: Newspaper },
  { label: 'Tài chính', to: '/admin/finance', icon: Landmark },
  { label: 'Sự kiện', to: '/admin/events', icon: CalendarDays },
  { label: 'AI Insights', to: '/admin/ai-insights', icon: Brain },
]

export function AdminLayout() {
  const { logout, user } = useAuthContext()

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden min-h-[calc(100vh-3rem)] w-64 shrink-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 md:flex md:flex-col">
          <div className="mb-4 border-b border-[hsl(var(--border))] pb-4">
            <p className="text-sm font-medium text-[hsl(var(--text))]">Admin Panel</p>
            <p className="mt-1 truncate text-xs text-[hsl(var(--text)/0.7)]">{user?.email}</p>
          </div>

          <nav className="flex-1 space-y-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                        : 'text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <Button
            variant="ghost"
            onClick={logout}
            className="mt-4 w-full justify-start text-[hsl(var(--negative))] hover:bg-[hsl(var(--negative)/0.1)] hover:text-[hsl(var(--negative))]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </aside>

        <main className="w-full flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] p-4 sm:p-6">
          <div className="mb-4 flex gap-2 overflow-x-auto border-b border-[hsl(var(--border))] pb-3 md:hidden">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={`mobile-${item.to}`}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                        : 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
            <Button
              variant="ghost"
              onClick={logout}
              className="ml-auto whitespace-nowrap text-[hsl(var(--negative))] hover:bg-[hsl(var(--negative)/0.1)] hover:text-[hsl(var(--negative))]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
