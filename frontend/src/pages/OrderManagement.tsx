import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Plus,
  Printer,
  Search,
  XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Order {
  id: string
  orderNumber: string
  tableNumber: number
  customerName: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  specialInstructions: string
  paymentMethod: string
}

interface OrderItem {
  id: string
  name_th: string
  name_en: string
  quantity: number
  price: number
  specialInstructions: string
}

const OrderManagement = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        tableNumber: 5,
        customerName: 'คุณสมชาย',
        items: [
          { id: '1', name_th: 'ต้มยำกุ้ง', name_en: 'Tom Yum Goong', quantity: 2, price: 180, specialInstructions: 'ไม่ใส่พริก' },
          { id: '2', name_th: 'ผัดไทย', name_en: 'Pad Thai', quantity: 1, price: 120, specialInstructions: '' }
        ],
        total: 480,
        status: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        specialInstructions: 'ขอช้อนส้อมเพิ่ม',
        paymentMethod: 'cash'
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        tableNumber: 3,
        customerName: 'John Smith',
        items: [
          { id: '3', name_th: 'แกงเขียวหวาน', name_en: 'Green Curry', quantity: 1, price: 150, specialInstructions: 'ไม่หวาน' },
          { id: '4', name_th: 'ข้าวสวย', name_en: 'Steamed Rice', quantity: 2, price: 20, specialInstructions: '' }
        ],
        total: 190,
        status: 'preparing',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 60 * 1000),
        specialInstructions: '',
        paymentMethod: 'promptpay'
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        tableNumber: 8,
        customerName: 'คุณสมหญิง',
        items: [
          { id: '5', name_th: 'ส้มตำ', name_en: 'Som Tam', quantity: 1, price: 80, specialInstructions: 'ไม่ใส่กุ้งแห้ง' },
          { id: '6', name_th: 'ลาบหมู', name_en: 'Larb Moo', quantity: 1, price: 120, specialInstructions: 'ไม่ใส่เครื่องใน' }
        ],
        total: 200,
        status: 'ready',
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000),
        specialInstructions: 'ขอถ้วยน้ำจิ้มเพิ่ม',
        paymentMethod: 'cash'
      }
    ]

    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = orders

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item =>
          item.name_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name_en.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredOrders(filtered)
  }, [orders, selectedStatus, searchTerm])

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // TODO: Replace with actual API call
      console.log(`Updating order ${orderId} to status: ${newStatus}`)

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'preparing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'served':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-700" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'served':
        return 'bg-green-200 text-green-900'
      case 'paid':
        return 'bg-green-300 text-green-900'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return t('orders.status.pending')
      case 'preparing':
        return t('orders.status.preparing')
      case 'ready':
        return t('orders.status.ready')
      case 'served':
        return t('orders.status.served')
      case 'paid':
        return t('orders.status.paid')
      case 'cancelled':
        return t('orders.status.cancelled')
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('orders.description')}
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" />
          {t('orders.new_order')}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('orders.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label={t('orders.filter_by_status')}
            >
              <option value="all">{t('orders.all_statuses')}</option>
              <option value="pending">{t('orders.status.pending')}</option>
              <option value="preparing">{t('orders.status.preparing')}</option>
              <option value="ready">{t('orders.status.ready')}</option>
              <option value="served">{t('orders.status.served')}</option>
              <option value="paid">{t('orders.status.paid')}</option>
              <option value="cancelled">{t('orders.status.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.order_number')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.table')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.items')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.total')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {t('orders.table_number', { number: order.tableNumber })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name_th}
                            </span>
                            <span className="text-gray-500">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title={t('orders.view_details')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="text-blue-600 hover:text-blue-900"
                        title={t('orders.mark_preparing')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Print receipt */ }}
                        className="text-gray-600 hover:text-gray-900"
                        title={t('orders.print_receipt')}
                        aria-label={t('orders.print_receipt')}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('orders.order_details')} - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('orders.customer')}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('orders.table')}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {t('orders.table_number', { number: selectedOrder.tableNumber })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('orders.items')}
                  </label>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">
                            {item.quantity}x {item.name_th}
                          </div>
                          {item.specialInstructions && (
                            <div className="text-sm text-gray-600">
                              {t('orders.special_instructions')}: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.price)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.specialInstructions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('orders.order_instructions')}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.specialInstructions}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{t('orders.total')}</span>
                    <span className="text-lg font-bold">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {t('orders.mark_preparing')}
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {t('orders.mark_ready')}
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'served')}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    {t('orders.mark_served')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
