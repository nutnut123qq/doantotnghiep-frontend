import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  Bell,
  BarChart3,
  PieChart,
  Briefcase,
  Star,
  Cpu,
  Calendar,
  Settings,
  UserCircle,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useAuthContext } from '@/shared/contexts/useAuthContext'
import { useTheme } from '@/shared/contexts/useTheme'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { CommandPalette } from './CommandPalette'
import { TickerSearch } from './TickerSearch'

export const Layout = () => {
  const location = useLocation()
  const { user, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Trading Board', href: '/trading-board', icon: PieChart },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', href: '/watchlist', icon: Star },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'AI Insights', href: '/ai-insights', icon: Cpu },
    { name: 'Events', href: '/events', icon: Calendar },
    ...(user?.role === 'Admin' ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border))]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-[hsl(var(--accent))] rounded-lg flex items-center justify-center"
                >
                  <span className="text-[hsl(var(--accent-foreground))] text-xl font-bold">SI</span>
                </motion.div>
                <span className="text-xl font-bold text-[hsl(var(--text))]">
                  Stock Investment
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="space-x-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <NavigationMenuItem key={item.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                              active
                                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                                : 'text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Ticker Search */}
              <TickerSearch />

              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-[hsl(var(--muted))]" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <Moon className="h-4 w-4 text-[hsl(var(--muted))]" />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--negative))] rounded-full"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <UserCircle className="h-6 w-6" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-[hsl(var(--negative))] focus:text-[hsl(var(--negative))]"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-1))]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center space-x-2',
                      active
                        ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                        : 'text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-[hsl(var(--border))] space-y-1">
                <div className="px-3 py-2 text-sm text-[hsl(var(--muted))]">
                  Signed in as <span className="font-medium text-[hsl(var(--text))]">{user?.email}</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--muted))]">Dark Mode</span>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-base font-medium text-[hsl(var(--negative))] hover:bg-[hsl(var(--negative)/0.1)] flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  )
}
