import { Outlet, Link, useLocation } from 'react-router-dom'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition, Switch } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChartBarIcon,
  ChartPieIcon,
  BriefcaseIcon,
  StarIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useTheme } from '@/shared/contexts/ThemeContext'

export const Layout = () => {
  const location = useLocation()
  const { user, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: ChartBarIcon },
    { name: 'Trading Board', href: '/trading-board', icon: ChartPieIcon },
    { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon },
    { name: 'Watchlist', href: '/watchlist', icon: StarIcon },
    { name: 'AI Insights', href: '/ai-insights', icon: CpuChipIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Disclosure as="nav" className="bg-white shadow-lg border-b border-slate-200">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo and Brand */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white text-xl font-bold">SI</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Stock Investment
                    </span>
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600',
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* User Menu */}
                <div className="hidden md:flex items-center space-x-4">
                  {/* Dark Mode Toggle */}
                  <Switch
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    className={`${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                    } relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                      } inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform`}
                    >
                      {theme === 'dark' ? (
                        <MoonIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <SunIcon className="h-4 w-4 text-slate-600" />
                      )}
                    </span>
                  </Switch>

                  {/* Notifications */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors relative">
                      <BellIcon className="h-6 w-6" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-slate-900 mb-3">Notifications</h3>
                          <div className="space-y-2">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-slate-900">VIC reached target price</p>
                              <p className="text-xs text-slate-600 mt-1">2 hours ago</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm font-medium text-slate-900">New AI recommendation</p>
                              <p className="text-xs text-slate-600 mt-1">5 hours ago</p>
                            </div>
                          </div>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* User Menu */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                      <UserCircleIcon className="h-6 w-6" />
                      <span>{user?.email}</span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="p-2">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/settings"
                                className={`${
                                  active ? 'bg-slate-100' : ''
                                } flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-slate-700`}
                              >
                                <Cog6ToothIcon className="h-5 w-5" />
                                <span>Settings</span>
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={`${
                                  active ? 'bg-slate-100' : ''
                                } flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-sm text-red-600`}
                              >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                <span>Logout</span>
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <Disclosure.Button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <Disclosure.Panel className="md:hidden border-t border-slate-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className={classNames(
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100',
                        'block px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center space-x-2'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Disclosure.Button>
                  )
                })}
                <div className="pt-4 border-t border-slate-200 space-y-1">
                  <div className="px-3 py-2 text-sm text-slate-600">
                    Signed in as <span className="font-medium text-slate-900">{user?.email}</span>
                  </div>
                  <Disclosure.Button
                    as="button"
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

