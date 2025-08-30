import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { 
  Home, 
  Menu, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Globe,
  Menu as MenuIcon
} from 'lucide-react'
import LanguageToggle from './LanguageToggle'

const Layout = () => {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: t('navigation.dashboard'), href: '/', icon: Home },
    { name: t('navigation.menu'), href: '/menu', icon: Menu },
    { name: t('navigation.orders'), href: '/orders', icon: ShoppingCart },
    { name: t('navigation.users'), href: '/users', icon: Users },
    { name: t('navigation.reports'), href: '/reports', icon: BarChart3 },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">ThaiTable</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">ThaiTable</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <LanguageToggle />
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <LogOut className="mr-2 h-4 w-4" />
              {t('navigation.logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
