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
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChartBarIcon,
  ChartPieIcon,
  BriefcaseIcon,
  StarIcon,
  CpuChipIcon,
  CalendarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export const Layout = () => {
  const location = useLocation()
  const { user, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: ChartBarIcon },
    { name: 'Trading Board', href: '/trading-board', icon: ChartPieIcon },
    { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon },
    { name: 'Watchlist', href: '/watchlist', icon: StarIcon },
    { name: 'AI Insights', href: '/ai-insights', icon: CpuChipIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Admin', href: '/admin', icon: Cog6ToothIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 shadow-lg border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white text-xl font-bold">SI</span>
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
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
              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2">
                <SunIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <MoonIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center space-x-2">
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
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
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
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
            className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
                <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                  Signed in as <span className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Dark Mode</span>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
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
    </div>
  )
}
