import {
  AlertTriangle,
  Calendar,
  ChefHat,
  Clock,
  Eye,
  Fire,
  MapPin,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Utensils,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatThaiCurrency } from '../utils/thaiMarket'

const Dashboard = () => {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Enhanced restaurant data with realistic kitchen operations
  const [dashboardData, setDashboardData] = useState({
    todayOrders: 43,
    todayRevenue: 18750,
    avgOrderValue: 436,
    tablesOccupied: 12,
    totalTables: 16,
    waitTime: 15,
    kitchenCapacity: 85,
    staffOnDuty: 8,
    peakTime: "7:30 PM",
    trendsToday: {
      orders: "+18%",
      revenue: "+12%",
      satisfaction: "4.7/5"
    }
  })

  // Real-time kitchen queue with detailed order progression
  const [kitchenQueue, setKitchenQueue] = useState([
    {
      id: '#047',
      table: 'A3',
      items: ['Pad Thai', 'Tom Yum', 'Mango Rice'],
      total: '฿680',
      status: 'prep',
      priority: 'high',
      timeInQueue: '2m',
      estimatedCompletion: '8m',
      chef: 'Somchai',
      specialRequests: 'Extra spicy, no peanuts'
    },
    {
      id: '#048',
      table: 'B1',
      items: ['Green Curry', 'Jasmine Rice'],
      total: '฿320',
      status: 'cooking',
      priority: 'normal',
      timeInQueue: '12m',
      estimatedCompletion: '3m',
      chef: 'Niran',
      specialRequests: null
    },
    {
      id: '#049',
      table: 'C2',
      items: ['Massaman Curry', 'Pad See Ew', 'Thai Tea'],
      total: '฿580',
      status: 'plating',
      priority: 'normal',
      timeInQueue: '18m',
      estimatedCompletion: '1m',
      chef: 'Apinya',
      specialRequests: 'Medium spice level'
    },
    {
      id: '#050',
      table: 'A1',
      items: ['Som Tam', 'Grilled Fish'],
      total: '฿450',
      status: 'ready',
      priority: 'urgent',
      timeInQueue: '22m',
      estimatedCompletion: 'Ready!',
      chef: 'Somchai',
      specialRequests: null
    }
  ])

  // Live table status with actionable information
  const tableStatus = [
    { number: 'A1', status: 'order-ready', customers: 4, orderTime: '22m ago', server: 'Mali', revenue: '฿450' },
    { number: 'A2', status: 'available', customers: 0, orderTime: null, server: null, revenue: null },
    { number: 'A3', status: 'ordering', customers: 3, orderTime: '2m ago', server: 'Porn', revenue: '฿680' },
    { number: 'B1', status: 'eating', customers: 2, orderTime: '35m ago', server: 'Nim', revenue: '฿320' },
    { number: 'B2', status: 'waiting-payment', customers: 4, orderTime: '1h 5m ago', server: 'Mali', revenue: '฿720' },
    { number: 'B3', status: 'available', customers: 0, orderTime: null, server: null, revenue: null },
    { number: 'C1', status: 'reserved', customers: 6, orderTime: '15m', server: 'Porn', revenue: null },
    { number: 'C2', status: 'ordering', customers: 2, orderTime: '8m ago', server: 'Nim', revenue: '฿580' }
  ]

  // Critical alerts and insights
  const criticalInsights = [
    {
      type: 'urgent',
      title: 'Table A1 order ready for 3+ minutes',
      action: 'Alert server Mali',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      type: 'warning',
      title: 'Pad Thai ingredients running low',
      action: 'Check inventory',
      icon: Fire,
      color: 'amber'
    },
    {
      type: 'info',
      title: 'Dinner rush starting early - 20% above usual',
      action: 'Consider additional staff',
      icon: TrendingUp,
      color: 'blue'
    }
  ]

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

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'status-success border-2'
      case 'ordering': return 'status-info border-2'
      case 'eating': return 'badge-primary border-2 border-primary-200 dark:border-primary-700'
      case 'waiting-payment': return 'status-warning border-2'
      case 'order-ready': return 'status-error border-2'
      case 'reserved': return 'badge border-2 border-border-primary'
      default: return 'badge border-2 border-border-primary'
    }
  }

  const getKitchenStatusColor = (status: string) => {
    switch (status) {
      case 'prep': return 'bg-primary-500 dark:bg-primary-600'
      case 'cooking': return 'bg-blue-500 dark:bg-blue-600'
      case 'plating': return 'bg-purple-500 dark:bg-purple-600'
      case 'ready': return 'bg-red-500 dark:bg-red-600 animate-pulse'
      default: return 'bg-background-tertiary'
    }
  }

  const getKitchenStatusIcon = (status: string) => {
    switch (status) {
      case 'prep': return ChefHat
      case 'cooking': return Fire
      case 'plating': return Utensils
      case 'ready': return Sparkles
      default: return Clock
    }
  }

  return (
    <div className="min-h-screen bg-background-primary p-density-md space-y-density-lg">
      {/* HERO METRICS - MASSIVE, PROMINENT DISPLAY */}
      <div className="card-elevated">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-density-lg">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-2">Restaurant Command Center</h1>
            <div className="flex items-center space-x-4 text-text-secondary">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">{currentTime.toLocaleString('th-TH')}</span>
              </div>
              <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                <span className="font-medium">{isOnline ? 'Connected' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* CRITICAL STATUS INDICATORS */}
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">SMOOTH</div>
              <div className="text-sm text-text-secondary">Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{dashboardData.kitchenCapacity}%</div>
              <div className="text-sm text-text-secondary">Kitchen Load</div>
            </div>
          </div>
        </div>

        {/* MASSIVE KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-density-lg">
          <div className="text-center p-density-lg">
            <div className="text-6xl md:text-7xl font-bold text-primary-600 dark:text-primary-400 mb-2">{dashboardData.todayOrders}</div>
            <div className="text-xl font-semibold text-heading mb-1">Orders Today</div>
            <div className="text-lg text-green-600 dark:text-green-400 font-medium">{dashboardData.trendsToday.orders} vs yesterday</div>
          </div>

          <div className="text-center p-density-lg">
            <div className="text-6xl md:text-7xl font-bold text-green-600 dark:text-green-400 mb-2">{formatThaiCurrency(dashboardData.todayRevenue)}</div>
            <div className="text-xl font-semibold text-heading mb-1">Revenue Today</div>
            <div className="text-lg text-green-600 dark:text-green-400 font-medium">{dashboardData.trendsToday.revenue} vs yesterday</div>
          </div>

          <div className="text-center p-density-lg">
            <div className="text-6xl md:text-7xl font-bold text-blue-600 dark:text-blue-400 mb-2">{dashboardData.tablesOccupied}/{dashboardData.totalTables}</div>
            <div className="text-xl font-semibold text-heading mb-1">Tables Occupied</div>
            <div className="text-lg text-text-secondary font-medium">{dashboardData.waitTime}min avg wait</div>
          </div>

          <div className="text-center p-density-lg">
            <div className="text-6xl md:text-7xl font-bold text-primary-600 dark:text-primary-400 mb-2">{dashboardData.trendsToday.satisfaction}</div>
            <div className="text-xl font-semibold text-heading mb-1">Satisfaction</div>
            <div className="text-lg text-text-secondary font-medium">Customer Rating</div>
          </div>
        </div>
      </div>

      {/* CRITICAL ALERTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-density-lg">
        {criticalInsights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div key={index} className={`card-elevated border-l-4 ${
              insight.color === 'red' ? 'border-red-500 notification-error' :
              insight.color === 'amber' ? 'border-primary-500 notification-warning' :
              'border-blue-500 notification-info'
            }`}>
              <div className="flex items-start space-x-3">
                <Icon className={`h-6 w-6 mt-1 ${
                  insight.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  insight.color === 'amber' ? 'text-primary-600 dark:text-primary-400' :
                  'text-blue-600 dark:text-blue-400'
                }`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-heading text-lg">{insight.title}</h3>
                  <button className="mt-2 btn-primary text-sm">
                    {insight.action}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MAIN OPERATIONAL PANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-density-lg">

        {/* KITCHEN COMMAND CENTER - MOST PROMINENT */}
        <div className="xl:col-span-2 card-elevated">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-heading flex items-center">
                <ChefHat className="h-7 w-7 mr-3 text-primary-600" />
                Live Kitchen Queue
              </h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm status-success px-3 py-1">
                  {kitchenQueue.length} orders active
                </div>
                <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {kitchenQueue.map((order) => {
              const StatusIcon = getKitchenStatusIcon(order.status)
              return (
                <div key={order.id} className={`border-l-4 p-4 rounded-lg transition-theme ${
                  order.priority === 'urgent' ? 'border-red-500 notification-error' :
                  order.priority === 'high' ? 'border-primary-500 notification-warning' :
                  'border-blue-500 bg-background-secondary'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getKitchenStatusColor(order.status)}`}>
                        <StatusIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-heading">{order.id} - Table {order.table}</h3>
                        <p className="text-text-secondary">Chef: {order.chef} • In queue: {order.timeInQueue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-heading">{order.total}</div>
                      <div className={`text-sm font-medium ${
                        order.status === 'ready' ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-text-secondary'
                      }`}>
                        {order.estimatedCompletion}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-1">Order Items:</h4>
                      <ul className="text-text-secondary space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <Utensils className="h-4 w-4" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {order.specialRequests && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">Special Requests:</h4>
                        <p className="text-text-secondary italic">{order.specialRequests}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 mt-4">
                    {order.status === 'ready' && (
                      <button className="btn-gradient text-sm">
                        <Play className="h-4 w-4 mr-1" />
                        Alert Server
                      </button>
                    )}
                    <button className="btn-ghost text-sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    <button className="btn-ghost text-sm">
                      <Timer className="h-4 w-4 mr-1" />
                      Update Time
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* TABLE STATUS OVERVIEW */}
        <div className="card-elevated">
          <div className="card-header">
            <h2 className="text-xl font-bold text-heading flex items-center">
              <MapPin className="h-6 w-6 mr-3 text-primary-600" />
              Table Status
            </h2>
            <p className="text-text-secondary mt-1">{dashboardData.tablesOccupied} of {dashboardData.totalTables} occupied</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {tableStatus.map((table) => (
              <div key={table.number} className={`p-3 rounded-lg border-2 transition-theme ${getTableStatusColor(table.status)}`}>
                <div className="text-center">
                  <div className="text-lg font-bold">{table.number}</div>
                  <div className="text-xs capitalize font-medium">
                    {table.status.replace('-', ' ')}
                  </div>
                  {table.customers > 0 && (
                    <div className="mt-1">
                      <div className="flex items-center justify-center space-x-1 text-xs">
                        <Users className="h-3 w-3" />
                        <span>{table.customers}</span>
                      </div>
                      {table.revenue && (
                        <div className="text-xs font-medium mt-1">{table.revenue}</div>
                      )}
                      {table.orderTime && (
                        <div className="text-xs opacity-75">{table.orderTime}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* QUICK TABLE ACTIONS */}
          <div className="mt-6 pt-4 border-t border-border-primary">
            <h3 className="font-semibold text-text-primary mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary text-sm">
                <Users className="h-4 w-4 mr-2" />
                Seat Next Customer (Est. 15min wait)
              </button>
              <button className="w-full btn-secondary text-sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Table Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEXTUAL INSIGHTS FOOTER */}
      <div className="card-elevated">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-heading mb-2">Today's Performance Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Peak time approaching:</span>
                <span className="font-medium text-text-primary ml-2">{dashboardData.peakTime}</span>
              </div>
              <div>
                <span className="text-text-secondary">Staff on duty:</span>
                <span className="font-medium text-text-primary ml-2">{dashboardData.staffOnDuty} team members</span>
              </div>
              <div>
                <span className="text-text-secondary">Kitchen efficiency:</span>
                <span className="font-medium text-green-600 ml-2">Running smoothly</span>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <button className="btn-gradient">
              <Zap className="h-4 w-4 mr-2" />
              Optimize Operations
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
