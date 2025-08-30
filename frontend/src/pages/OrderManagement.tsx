import {
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Package,
  Printer,
  User,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Order, formatThaiCurrency, getOrderStatusColor, getOrderStatusText, orderService } from '../services/orders';

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Mock restaurant ID - in real app, get from auth context
  const restaurantId = 'mock-restaurant-id';

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await orderService.getOrders(restaurantId, filters);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items.some(item =>
        item.menu.name_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.menu.name_en.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">จัดการออเดอร์</h1>
        <p className="text-gray-600">จัดการออเดอร์ร้านอาหารและติดตามสถานะ</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="ค้นหาออเดอร์ ลูกค้า หรือรายการ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="กรองตามสถานะ"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="PENDING">รอดำเนินการ</option>
            <option value="CONFIRMED">ยืนยันแล้ว</option>
            <option value="COOKING">กำลังปรุง</option>
            <option value="READY">พร้อมเสิร์ฟ</option>
            <option value="SERVED">เสิร์ฟแล้ว</option>
            <option value="PAID">ชำระแล้ว</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ออเดอร์ #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  โต๊ะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รายการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคารวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เวลา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.table ? `โต๊ะ ${order.table.table_number}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      {order.order_items.length} รายการ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatThaiCurrency(order.total_thb)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.created_at).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="ดูรายละเอียด"
                        aria-label="ดูรายละเอียด"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                          className="text-green-600 hover:text-green-900"
                          title="ยืนยันออเดอร์"
                          aria-label="ยืนยันออเดอร์"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'COOKING')}
                          className="text-orange-600 hover:text-orange-900"
                          title="เริ่มปรุง"
                          aria-label="เริ่มปรุง"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                      )}

                      {order.status === 'COOKING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'READY')}
                          className="text-green-600 hover:text-green-900"
                          title="พร้อมเสิร์ฟ"
                          aria-label="พร้อมเสิร์ฟ"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'SERVED')}
                          className="text-purple-600 hover:text-purple-900"
                          title="เสิร์ฟแล้ว"
                          aria-label="เสิร์ฟแล้ว"
                        >
                          <User className="h-4 w-4" />
                        </button>
                      )}

                      {order.status === 'SERVED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PAID')}
                          className="text-green-600 hover:text-green-900"
                          title="ชำระแล้ว"
                          aria-label="ชำระแล้ว"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}

                      {['PENDING', 'CONFIRMED', 'COOKING'].includes(order.status) && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                          className="text-red-600 hover:text-red-900"
                          title="ยกเลิกออเดอร์"
                          aria-label="ยกเลิกออเดอร์"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {/* TODO: Print receipt */ }}
                        className="text-gray-600 hover:text-gray-900"
                        title="พิมพ์ใบเสร็จ"
                        aria-label="พิมพ์ใบเสร็จ"
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
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">รายละเอียดออเดอร์ #{selectedOrder.order_number}</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ลูกค้า</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">โต๊ะ</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedOrder.table ? `โต๊ะ ${selectedOrder.table.table_number}` : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">คำแนะนำพิเศษ</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.notes || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">รายการอาหาร</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.menu.name_th}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.menu.name_en}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-500">หมายเหตุ: {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{item.quantity}x</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatThaiCurrency(item.total_price_thb)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>ราคารวม:</span>
                    <span>{formatThaiCurrency(selectedOrder.subtotal_thb)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ภาษี (7%):</span>
                    <span>{formatThaiCurrency(selectedOrder.tax_thb)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ค่าบริการ (10%):</span>
                    <span>{formatThaiCurrency(selectedOrder.service_charge_thb)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>รวมทั้งหมด:</span>
                    <span>{formatThaiCurrency(selectedOrder.total_thb)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
