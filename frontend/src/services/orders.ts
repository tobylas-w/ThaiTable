import api from './api';

// Types
export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  menu: {
    id: string;
    name_th: string;
    name_en: string;
    price_thb: number;
    image_url?: string;
  };
  quantity: number;
  unit_price_thb: number;
  total_price_thb: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  table_id?: string;
  table?: {
    id: string;
    table_number: string;
    capacity: number;
    status: string;
  };
  user_id: string;
  user: {
    id: string;
    name_th: string;
    name_en: string;
  };
  restaurant_id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal_thb: number;
  tax_thb: number;
  service_charge_thb: number;
  total_thb: number;
  payment_method?: 'CASH' | 'PROMPTPAY' | 'TRUEMONEY' | 'SCB_EASY' | 'CREDIT_CARD' | 'LINE_PAY' | 'AIRPAY';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'COOKING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
  notes?: string;
  order_items: OrderItem[];
  _count?: {
    order_items: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  table_id?: string;
  user_id: string;
  restaurant_id: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  order_items: {
    menu_id: string;
    quantity: number;
    unit_price_thb: number;
    notes?: string;
  }[];
  payment_method?: 'CASH' | 'PROMPTPAY' | 'TRUEMONEY' | 'SCB_EASY' | 'CREDIT_CARD' | 'LINE_PAY' | 'AIRPAY';
  service_charge_percentage?: number;
  tax_rate?: number;
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  restaurant_id?: never; // Cannot update restaurant_id
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  table_id?: string;
  customer_name?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_order_value: number;
}

// Order API functions
export const orderService = {
  // Get all orders for a restaurant
  async getOrders(restaurantId: string, filters?: OrderFilters): Promise<{ data: Order[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.table_id) params.append('table_id', filters.table_id);
    if (filters?.customer_name) params.append('customer_name', filters.customer_name);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/order/restaurant/${restaurantId}?${params.toString()}`);
    return response.data;
  },

  // Get order by ID
  async getOrder(id: string): Promise<{ data: Order }> {
    const response = await api.get(`/order/${id}`);
    return response.data;
  },

  // Create new order
  async createOrder(data: CreateOrderData): Promise<{ data: Order; message: string }> {
    const response = await api.post('/order', data);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<{ data: Order; message: string }> {
    const response = await api.patch(`/order/${id}/status`, { status });
    return response.data;
  },

  // Update payment status
  async updatePaymentStatus(id: string, payment_status: Order['payment_status'], payment_method?: Order['payment_method']): Promise<{ data: Order; message: string }> {
    const response = await api.patch(`/order/${id}/payment`, { payment_status, payment_method });
    return response.data;
  },

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<{ data: Order; message: string }> {
    const response = await api.patch(`/order/${id}/cancel`, { reason });
    return response.data;
  },

  // Get order statistics
  async getOrderStats(restaurantId: string, date_from?: string, date_to?: string): Promise<{ data: OrderStats }> {
    const params = new URLSearchParams();
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);

    const response = await api.get(`/order/restaurant/${restaurantId}/stats?${params.toString()}`);
    return response.data;
  }
};

// Utility functions
export const formatThaiCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
};

export const getOrderStatusText = (status: Order['status']): string => {
  const statusMap = {
    'PENDING': 'รอดำเนินการ',
    'CONFIRMED': 'ยืนยันแล้ว',
    'COOKING': 'กำลังปรุง',
    'READY': 'พร้อมเสิร์ฟ',
    'SERVED': 'เสิร์ฟแล้ว',
    'PAID': 'ชำระแล้ว',
    'CANCELLED': 'ยกเลิก'
  };
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: Order['status']): string => {
  const colorMap = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'COOKING': 'bg-orange-100 text-orange-800',
    'READY': 'bg-green-100 text-green-800',
    'SERVED': 'bg-purple-100 text-purple-800',
    'PAID': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentStatusText = (status: Order['payment_status']): string => {
  const statusMap = {
    'PENDING': 'รอชำระ',
    'PAID': 'ชำระแล้ว',
    'FAILED': 'ชำระไม่สำเร็จ',
    'REFUNDED': 'คืนเงินแล้ว'
  };
  return statusMap[status] || status;
};

export const getPaymentStatusColor = (status: Order['payment_status']): string => {
  const colorMap = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'PAID': 'bg-green-100 text-green-800',
    'FAILED': 'bg-red-100 text-red-800',
    'REFUNDED': 'bg-gray-100 text-gray-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentMethodText = (method: Order['payment_method']): string => {
  const methodMap: Record<string, string> = {
    'CASH': 'เงินสด',
    'PROMPTPAY': 'PromptPay',
    'TRUEMONEY': 'TrueMoney',
    'SCB_EASY': 'SCB Easy',
    'CREDIT_CARD': 'บัตรเครดิต',
    'LINE_PAY': 'LINE Pay',
    'AIRPAY': 'AirPay'
  };
  return methodMap[method || ''] || method || 'ไม่ระบุ';
};

export const calculateOrderTotals = (orderItems: OrderItem[]): {
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
} => {
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price_thb, 0);
  const tax = (subtotal * 7) / 100; // 7% VAT
  const serviceCharge = (subtotal * 10) / 100; // 10% service charge
  const total = subtotal + tax + serviceCharge;

  return {
    subtotal,
    tax,
    serviceCharge,
    total
  };
};
