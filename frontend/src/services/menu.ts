import api from './api';

// Types
export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  category?: {
    id: string;
    name_th: string;
    name_en: string;
  };
  name_th: string;
  name_en: string;
  description_th?: string;
  description_en?: string;
  price_thb: number;
  cost_thb?: number;
  spice_level?: number;
  preparation_time?: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_halal: boolean;
  is_gluten_free: boolean;
  is_available: boolean;
  image_url?: string;
  sort_order: number;
  allergens: string[];
  nutritional_info?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  restaurant_id: string;
  category_id?: string;
  name_th: string;
  name_en: string;
  description_th?: string;
  description_en?: string;
  price_thb: number;
  cost_thb?: number;
  spice_level?: number;
  preparation_time?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_halal?: boolean;
  is_gluten_free?: boolean;
  is_available?: boolean;
  image_url?: string;
  sort_order?: number;
  allergens?: string[];
  nutritional_info?: Record<string, any>;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {
  restaurant_id?: never; // Cannot update restaurant_id
}

export interface MenuStats {
  total: number;
  available: number;
  unavailable: number;
}

export interface MenuFilters {
  category?: string;
  available?: boolean;
  search?: string;
}

// Menu API functions
export const menuService = {
  // Get all menu items for a restaurant
  async getMenuItems(restaurantId: string, filters?: MenuFilters): Promise<{ data: MenuItem[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', filters.available.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/menu/${restaurantId}?${params.toString()}`);
    return response.data;
  },

  // Get menu item by ID
  async getMenuItem(id: string): Promise<{ data: MenuItem }> {
    const response = await api.get(`/menu/item/${id}`);
    return response.data;
  },

  // Create new menu item
  async createMenuItem(data: CreateMenuItemData): Promise<{ data: MenuItem; message: string }> {
    const response = await api.post('/menu', data);
    return response.data;
  },

  // Update menu item
  async updateMenuItem(id: string, data: UpdateMenuItemData): Promise<{ data: MenuItem; message: string }> {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },

  // Delete menu item
  async deleteMenuItem(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  // Bulk update menu availability
  async bulkUpdateAvailability(restaurantId: string, menuIds: string[], isAvailable: boolean): Promise<{ message: string }> {
    const response = await api.patch('/menu/bulk-availability', {
      restaurant_id: restaurantId,
      menu_ids: menuIds,
      is_available: isAvailable
    });
    return response.data;
  },

  // Get menu statistics
  async getMenuStats(restaurantId: string): Promise<{ data: MenuStats }> {
    const response = await api.get(`/menu/${restaurantId}/stats`);
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

export const getSpiceLevelText = (level: number): string => {
  const levels = ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดปานกลาง', 'เผ็ดมาก', 'เผ็ดมากที่สุด'];
  return levels[level - 1] || 'ไม่ระบุ';
};

export const getSpiceLevelColor = (level: number): string => {
  const colors = ['text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-red-800'];
  return colors[level - 1] || 'text-gray-600';
};

export const getDietaryIcons = (item: MenuItem): string[] => {
  const icons: string[] = [];
  if (item.is_vegetarian) icons.push('🥬');
  if (item.is_vegan) icons.push('🌱');
  if (item.is_halal) icons.push('☪️');
  if (item.is_gluten_free) icons.push('🌾');
  return icons;
};
