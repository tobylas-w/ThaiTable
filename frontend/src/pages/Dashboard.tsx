import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Menu,
  PieChart,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatThaiCurrency } from '../utils/thaiMarket'

// Add CSS for progress bars
const progressBarStyle = `
  .progress-bar {
    transition: width 0.5s ease-in-out;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = progressBarStyle
  document.head.appendChild(styleSheet)
}

const Dashboard = () => {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [statsData, setStatsData] = useState({
    todayOrders: 24,
    todayRevenue: 12450,
    totalMenuItems: 156,
    activeUsers: 8,
    averageOrderValue: 518.75,
    peakHour: '19:00',
    occupancyRate: 68
  })
  const [realtimeUpdates, setRealtimeUpdates] = useState(true)

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Simulate real-time data updates
  useEffect(() => {
    if (!realtimeUpdates) return

    const interval = setInterval(() => {
      setStatsData(prev => ({
        ...prev,
        todayOrders: prev.todayOrders + Math.random() > 0.7 ? 1 : 0,
        todayRevenue: prev.todayRevenue + (Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 200 : 0),
        occupancyRate: Math.max(20, Math.min(95, prev.occupancyRate + (Math.random() - 0.5) * 10))
      }))
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [realtimeUpdates])

  const enhancedStats = [
    {
      name: t('dashboard.todayOrders'),
      value: statsData.todayOrders.toString(),
      icon: ShoppingCart,
      change: '+12%',
      changeType: 'positive',
      subtext: t('dashboard.comparedToYesterday'),
      trend: [20, 22, 19, 24, 18, 24, statsData.todayOrders]
    },
    {
      name: t('dashboard.todayRevenue'),
      value: formatThaiCurrency(statsData.todayRevenue),
      icon: DollarSign,
      change: '+8%',
      changeType: 'positive',
      subtext: t('dashboard.comparedToYesterday'),
      trend: [10000, 11000, 9500, 12450, 9800, 12450, statsData.todayRevenue]
    },
    {
      name: t('dashboard.averageOrderValue'),
      value: formatThaiCurrency(statsData.averageOrderValue),
      icon: TrendingUp,
      change: '+5%',
      changeType: 'positive',
      subtext: t('dashboard.perOrder'),
      trend: [480, 495, 475, 518, 465, 518, Math.round(statsData.todayRevenue / statsData.todayOrders)]
    },
    {
      name: t('dashboard.occupancyRate'),
      value: `${Math.round(statsData.occupancyRate)}%`,
      icon: Users,
      change: statsData.occupancyRate > 70 ? '+5%' : '-2%',
      changeType: statsData.occupancyRate > 70 ? 'positive' : 'negative',
      subtext: t('dashboard.tableOccupancy'),
      trend: [65, 70, 62, 68, 58, 68, Math.round(statsData.occupancyRate)]
    }
  ]

  const recentOrders = [
    { id: '#001', table: 'A1', items: 3, total: '฿450', status: 'served', time: '2 min ago' },
    { id: '#002', table: 'B3', items: 2, total: '฿320', status: 'cooking', time: '5 min ago' },
    { id: '#003', table: 'C2', items: 4, total: '฿680', status: 'pending', time: '8 min ago' },
    { id: '#004', table: 'A4', items: 1, total: '฿180', status: 'paid', time: '12 min ago' }
  ]

  const popularItems = [
    { name: 'Pad Thai', orders: 15, revenue: '฿2,250' },
    { name: 'Tom Yum Goong', orders: 12, revenue: '฿1,800' },
    { name: 'Green Curry', orders: 10, revenue: '฿1,500' },
    { name: 'Mango Sticky Rice', orders: 8, revenue: '฿800' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cooking': return 'bg-blue-100 text-blue-800'
      case 'served': return 'bg-green-100 text-green-800'
      case 'paid': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Simple sparkline component
  const Sparkline = ({ data, className = "" }: { data: number[], className?: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    return (
      <svg className={`w-16 h-8 ${className}`} viewBox="0 0 64 32">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 64
            const y = 32 - ((value - min) / range) * 32
            return `${x},${y}`
          }).join(' ')}
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Real-time Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('dashboard.welcome')}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            {/* Real-time clock */}
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {currentTime.toLocaleString('th-TH')}
            </div>

            {/* Network status */}
            <div className={`flex items-center text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </div>

            {/* Real-time toggle */}
            <button
              onClick={() => setRealtimeUpdates(!realtimeUpdates)}
              className={`flex items-center px-3 py-1 rounded-full text-sm ${realtimeUpdates
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
            >
              <Activity className={`h-4 w-4 mr-1 ${realtimeUpdates ? 'animate-pulse' : ''}`} />
              {realtimeUpdates ? t('dashboard.live') : t('dashboard.paused')}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {enhancedStats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-6 w-6 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                      }`} />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-500 truncate">{stat.name}</div>
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Sparkline
                    data={stat.trend}
                    className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className={`flex items-center text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {stat.changeType === 'positive' ?
                    <TrendingUp className="h-4 w-4 mr-1" /> :
                    <TrendingDown className="h-4 w-4 mr-1" />
                  }
                  {stat.change}
                </div>
                <span className="text-xs text-gray-500">{stat.subtext}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders with Enhanced Status */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('dashboard.recentOrders')}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">{t('dashboard.live')}</span>
              </div>
            </div>
            <div className="flow-root">
              <ul className="-my-3 divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'served' ? 'bg-green-100' :
                            order.status === 'cooking' ? 'bg-blue-100' :
                              order.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                          {order.status === 'served' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                            order.status === 'cooking' ? <Activity className="w-5 h-5 text-blue-600" /> :
                              order.status === 'pending' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                                <DollarSign className="w-5 h-5 text-gray-600" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.id} - {t('orders.tableNumber')} {order.table}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items} {t('orders.items')} • {order.total}
                        </p>
                        <p className="text-xs text-gray-400">{order.time}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {t(`orders.statuses.${order.status}`)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <a href="/orders" className="text-sm font-medium text-amber-600 hover:text-amber-500 flex items-center">
                {t('dashboard.viewAllOrders')}
                <TrendingUp className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Popular Items with Progress Bars */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('dashboard.popularItems')}
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={item.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                        }`}>
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{item.revenue}</p>
                      <p className="text-xs text-gray-500">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`progress-bar h-2 rounded-full ${index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-500' :
                            index === 2 ? 'bg-orange-500' :
                              'bg-blue-500'
                        }`}
                      ref={(el) => {
                        if (el) {
                          requestAnimationFrame(() => {
                            el.style.width = `${(item.orders / 15) * 100}%`
                          })
                        }
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <a href="/menu" className="text-sm font-medium text-amber-600 hover:text-amber-500 flex items-center">
                {t('dashboard.viewMenu')}
                <Menu className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Kitchen Status & Alerts */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('dashboard.kitchenStatus')}
              </h3>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>

            {/* Kitchen Metrics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{t('dashboard.ordersCompleted')}</span>
                </div>
                <span className="text-lg font-bold text-green-900">18</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{t('dashboard.ordersInProgress')}</span>
                </div>
                <span className="text-lg font-bold text-blue-900">6</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">{t('dashboard.avgPrepTime')}</span>
                </div>
                <span className="text-lg font-bold text-yellow-900">12m</span>
              </div>

              {/* Alert */}
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{t('dashboard.lowStock')}</p>
                  <p className="text-xs text-red-700">{t('dashboard.checkInventory')}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <a href="/orders" className="text-sm font-medium text-amber-600 hover:text-amber-500 flex items-center">
                {t('dashboard.viewKitchen')}
                <Activity className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('dashboard.performanceOverview')}
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Performance */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.75} ${2 * Math.PI * 40}`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">75%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">{t('dashboard.todayTarget')}</p>
              <p className="text-xs text-gray-500">{formatThaiCurrency(12450)} / {formatThaiCurrency(16600)}</p>
            </div>

            {/* Customer Satisfaction */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.92} ${2 * Math.PI * 40}`}
                    className="text-yellow-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">4.6</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">{t('dashboard.satisfaction')}</p>
              <p className="text-xs text-gray-500">{t('dashboard.basedOnReviews')}</p>
            </div>

            {/* Efficiency */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.85} ${2 * Math.PI * 40}`}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">85%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">{t('dashboard.efficiency')}</p>
              <p className="text-xs text-gray-500">{t('dashboard.orderProcessing')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
