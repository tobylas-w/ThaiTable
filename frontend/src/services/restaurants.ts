import { ApiResponse, apiService } from './api';

// Restaurant Types
export interface BusinessHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

export interface Restaurant {
  id: string
  name_th: string
  name_en: string
  address_th: string
  address_en: string
  tax_id: string
  phone?: string
  email?: string
  website?: string
  business_hours?: BusinessHours
  cuisine_type?: string
  seating_capacity?: number
  accepts_reservations?: boolean
  has_delivery?: boolean
  has_takeaway?: boolean
  payment_methods?: string[]
  created_at: string
  updated_at: string
  _count?: {
    users: number
    menus: number
    orders: number
    tables: number
  }
}

export interface CreateRestaurantData {
  name_th: string
  name_en: string
  address_th: string
  address_en: string
  tax_id: string
  phone?: string
  email?: string
  website?: string
  business_hours?: BusinessHours
  cuisine_type?: string
  seating_capacity?: number
  accepts_reservations?: boolean
  has_delivery?: boolean
  has_takeaway?: boolean
  payment_methods?: string[]
}

export interface UpdateRestaurantData extends Partial<CreateRestaurantData> {
  id?: never // Cannot update ID
}

export interface RestaurantStats {
  total_orders: number
  total_revenue: number
  menu_count: number
  user_count: number
  period: string
}

export interface RestaurantFilters {
  cuisine_type?: string
  has_delivery?: boolean
  has_takeaway?: boolean
  accepts_reservations?: boolean
}

// Restaurant Service
export class RestaurantService {
  // Get restaurant by ID
  async getRestaurant(restaurantId: string): Promise<ApiResponse<Restaurant>> {
    return apiService.get<Restaurant>(`/restaurant/${restaurantId}`)
  }

  // Create new restaurant
  async createRestaurant(data: CreateRestaurantData): Promise<ApiResponse<Restaurant>> {
    return apiService.post<Restaurant>('/restaurant', data)
  }

  // Update restaurant
  async updateRestaurant(restaurantId: string, data: UpdateRestaurantData): Promise<ApiResponse<Restaurant>> {
    return apiService.put<Restaurant>(`/restaurant/${restaurantId}`, data)
  }

  // Delete restaurant
  async deleteRestaurant(restaurantId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/restaurant/${restaurantId}`)
  }

  // Get restaurant statistics
  async getRestaurantStats(restaurantId: string, period: 'today' | 'week' | 'month' = 'today'): Promise<ApiResponse<RestaurantStats>> {
    return apiService.get<RestaurantStats>(`/restaurant/${restaurantId}/stats?period=${period}`)
  }

  // Get restaurants with filters
  async getRestaurants(filters?: RestaurantFilters): Promise<ApiResponse<Restaurant[]>> {
    const params = new URLSearchParams()
    if (filters?.cuisine_type) params.append('cuisine_type', filters.cuisine_type)
    if (filters?.has_delivery !== undefined) params.append('has_delivery', filters.has_delivery.toString())
    if (filters?.has_takeaway !== undefined) params.append('has_takeaway', filters.has_takeaway.toString())
    if (filters?.accepts_reservations !== undefined) params.append('accepts_reservations', filters.accepts_reservations.toString())

    return apiService.get<Restaurant[]>(`/restaurant?${params.toString()}`)
  }

  // Validate tax ID
  async validateTaxId(taxId: string): Promise<ApiResponse<{ valid: boolean; message?: string }>> {
    return apiService.post<{ valid: boolean; message?: string }>('/restaurant/validate-tax-id', { tax_id: taxId })
  }

  // Get restaurant by tax ID
  async getRestaurantByTaxId(taxId: string): Promise<ApiResponse<Restaurant>> {
    return apiService.get<Restaurant>(`/restaurant/tax-id/${taxId}`)
  }

  // Update business hours
  async updateBusinessHours(restaurantId: string, businessHours: BusinessHours): Promise<ApiResponse<Restaurant>> {
    return apiService.patch<Restaurant>(`/restaurant/${restaurantId}/business-hours`, { business_hours: businessHours })
  }

  // Update payment methods
  async updatePaymentMethods(restaurantId: string, paymentMethods: string[]): Promise<ApiResponse<Restaurant>> {
    return apiService.patch<Restaurant>(`/restaurant/${restaurantId}/payment-methods`, { payment_methods: paymentMethods })
  }
}

// Utility functions
export const formatCuisineType = (cuisineType: string): string => {
  const cuisineMap: Record<string, string> = {
    'thai': 'อาหารไทย',
    'chinese': 'อาหารจีน',
    'japanese': 'อาหารญี่ปุ่น',
    'korean': 'อาหารเกาหลี',
    'western': 'อาหารตะวันตก',
    'indian': 'อาหารอินเดีย',
    'italian': 'อาหารอิตาเลียน',
    'seafood': 'อาหารทะเล',
    'bbq': 'บาร์บีคิว',
    'other': 'อื่นๆ'
  }
  return cuisineMap[cuisineType] || cuisineType
}

export const formatPaymentMethods = (methods: string[]): string => {
  const methodMap: Record<string, string> = {
    'cash': 'เงินสด',
    'promptpay': 'PromptPay',
    'credit_card': 'บัตรเครดิต',
    'debit_card': 'บัตรเดบิต',
    'truemoney': 'TrueMoney',
    'linepay': 'LINE Pay'
  }
  return methods.map(method => methodMap[method] || method).join(', ')
}

export const formatBusinessHours = (businessHours: BusinessHours): string => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

  const openDays = days.filter(day => !businessHours[day as keyof BusinessHours].closed)

  if (openDays.length === 0) return 'ปิดทุกวัน'
  if (openDays.length === 7) return 'เปิดทุกวัน'

  return openDays.map(day => dayNames[days.indexOf(day)]).join(', ')
}

export const validateThaiPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/
  return phoneRegex.test(phone)
}

export const validateThaiTaxId = (taxId: string): boolean => {
  // Thai tax ID validation (13 digits)
  if (!/^[0-9]{13}$/.test(taxId)) return false

  // Algorithm validation
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(taxId[i]) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(taxId[12])
}

export const formatThaiCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}

// Create service instance
export const restaurantService = new RestaurantService()
