import { useTranslation } from 'react-i18next'
import { 
  ShoppingCart, 
  DollarSign, 
  Menu, 
  Users, 
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'

const Dashboard = () => {
  const { t } = useTranslation()

  const stats = [
    {
      name: t('dashboard.todayOrders'),
      value: '24',
      icon: ShoppingCart,
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: t('dashboard.todayRevenue'),
      value: '฿12,450',
      icon: DollarSign,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: t('dashboard.totalMenuItems'),
      value: '156',
      icon: Menu,
      change: '+3',
      changeType: 'positive'
    },
    {
      name: t('dashboard.activeUsers'),
      value: '8',
      icon: Users,
      change: '+2',
      changeType: 'positive'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        <span className="sr-only">{stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by</span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('dashboard.recentOrders')}
            </h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.id} - {t('orders.tableNumber')} {order.table}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items} {t('orders.items')} • {order.total}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {t(`orders.statuses.${order.status}`)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {order.time}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('dashboard.popularItems')}
            </h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {popularItems.map((item, index) => (
                  <li key={item.name} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-yellow-800">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.orders} {t('orders.items')} • {item.revenue}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {Math.round((item.orders / 15) * 5)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
