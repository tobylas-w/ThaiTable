import api from './api';

// Types
export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name_th: string;
  name_en: string;
  description_th?: string;
  description_en?: string;
  sort_order: number;
  is_active: boolean;
  _count?: {
    menus: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  restaurant_id: string;
  name_th: string;
  name_en: string;
  description_th?: string;
  description_en?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  restaurant_id?: never; // Cannot update restaurant_id
}

export interface CategoryOrder {
  id: string;
  sort_order: number;
}

// Category API functions
export const categoryService = {
  // Get all categories for a restaurant
  async getCategories(restaurantId: string, active?: boolean): Promise<{ data: MenuCategory[]; count: number }> {
    const params = new URLSearchParams();
    if (active !== undefined) params.append('active', active.toString());

    const response = await api.get(`/categories/${restaurantId}?${params.toString()}`);
    return response.data;
  },

  // Get category by ID
  async getCategory(id: string): Promise<{ data: MenuCategory }> {
    const response = await api.get(`/categories/item/${id}`);
    return response.data;
  },

  // Create new category
  async createCategory(data: CreateCategoryData): Promise<{ data: MenuCategory; message: string }> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category
  async updateCategory(id: string, data: UpdateCategoryData): Promise<{ data: MenuCategory; message: string }> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Reorder categories
  async reorderCategories(restaurantId: string, categoryOrders: CategoryOrder[]): Promise<{ message: string }> {
    const response = await api.patch('/categories/reorder', {
      restaurant_id: restaurantId,
      category_orders: categoryOrders
    });
    return response.data;
  }
};

// Utility functions
export const getCategoryDisplayName = (category: MenuCategory, language: 'th' | 'en' = 'th'): string => {
  return language === 'th' ? category.name_th : category.name_en;
};

export const getCategoryDescription = (category: MenuCategory, language: 'th' | 'en' = 'th'): string => {
  if (language === 'th') {
    return category.description_th || category.name_th;
  }
  return category.description_en || category.name_en;
};
