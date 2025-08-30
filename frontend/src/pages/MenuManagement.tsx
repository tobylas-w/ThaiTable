import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { menuService, MenuItem, CreateMenuItemData, MenuFilters, formatThaiCurrency, getSpiceLevelText, getSpiceLevelColor, getDietaryIcons } from '../services/menu';
import { categoryService, MenuCategory } from '../services/categories';

const MenuManagement = () => {
  const { t, i18n } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [stats, setStats] = useState({ total: 0, available: 0, unavailable: 0 });

  // Mock restaurant ID - in real app, get from auth context
  const restaurantId = 'mock-restaurant-id';

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoriesResponse, statsResponse] = await Promise.all([
        menuService.getMenuItems(restaurantId, filters),
        categoryService.getCategories(restaurantId, true),
        menuService.getMenuStats(restaurantId)
      ]);

      setMenuItems(menuResponse.data);
      setCategories(categoriesResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (data: CreateMenuItemData) => {
    try {
      await menuService.createMenuItem(data);
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเพิ่มเมนู');
    }
  };

  const handleUpdateItem = async (id: string, data: Partial<CreateMenuItemData>) => {
    try {
      await menuService.updateMenuItem(id, data);
      setEditingItem(null);
      loadData();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปเดตเมนู');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?')) return;

    try {
      await menuService.deleteMenuItem(id);
      loadData();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบเมนู');
    }
  };

  const handleBulkAvailability = async (isAvailable: boolean) => {
    if (selectedItems.length === 0) return;

    try {
      await menuService.bulkUpdateAvailability(restaurantId, selectedItems, isAvailable);
      setSelectedItems([]);
      loadData();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปเดตสถานะเมนู');
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedItems.length === menuItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(menuItems.map(item => item.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('menu.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการเมนูของร้านอาหาร</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มเมนู
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">เมนูทั้งหมด</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">เปิดใช้งาน</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.available}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">❌</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ปิดใช้งาน</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.unavailable}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="ค้นหาเมนู..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            value={filters.category || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {i18n.language === 'th' ? category.name_th : category.name_en}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            value={filters.available?.toString() || ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              available: e.target.value === '' ? undefined : e.target.value === 'true' 
            }))}
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="true">เปิดใช้งาน</option>
            <option value="false">ปิดใช้งาน</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">
              เลือกแล้ว {selectedItems.length} รายการ
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAvailability(true)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                เปิดใช้งาน
              </button>
              <button
                onClick={() => handleBulkAvailability(false)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                ปิดใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === menuItems.length && menuItems.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เมนู
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {item.image_url && (
                        <img
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                          src={item.image_url}
                          alt={i18n.language === 'th' ? item.name_th : item.name_en}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {i18n.language === 'th' ? item.name_th : item.name_en}
                        </div>
                        <div className="text-sm text-gray-500">
                          {i18n.language === 'th' ? item.description_th : item.description_en}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {item.spice_level && (
                            <span className={`text-xs px-2 py-1 rounded ${getSpiceLevelColor(item.spice_level)}`}>
                              {getSpiceLevelText(item.spice_level)}
                            </span>
                          )}
                          {getDietaryIcons(item).map((icon, index) => (
                            <span key={index} className="text-sm">{icon}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category ? (i18n.language === 'th' ? item.category.name_th : item.category.name_en) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatThaiCurrency(item.price_thb)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_available ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบเมนู</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <MenuFormModal
          item={editingItem}
          categories={categories}
          restaurantId={restaurantId}
          onClose={() => {
            setShowCreateModal(false);
            setEditingItem(null);
          }}
          onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
        />
      )}
    </div>
  );
};

// Menu Form Modal Component
interface MenuFormModalProps {
  item?: MenuItem | null;
  categories: MenuCategory[];
  restaurantId: string;
  onClose: () => void;
  onSubmit: (id: string, data: CreateMenuItemData) => Promise<void> | ((data: CreateMenuItemData) => Promise<void>);
}

const MenuFormModal: React.FC<MenuFormModalProps> = ({ item, categories, restaurantId, onClose, onSubmit }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<CreateMenuItemData>({
    restaurant_id: restaurantId,
    name_th: item?.name_th || '',
    name_en: item?.name_en || '',
    description_th: item?.description_th || '',
    description_en: item?.description_en || '',
    price_thb: item?.price_thb || 0,
    cost_thb: item?.cost_thb || 0,
    spice_level: item?.spice_level || undefined,
    preparation_time: item?.preparation_time || undefined,
    is_vegetarian: item?.is_vegetarian || false,
    is_vegan: item?.is_vegan || false,
    is_halal: item?.is_halal || false,
    is_gluten_free: item?.is_gluten_free || false,
    is_available: item?.is_available ?? true,
    category_id: item?.category_id || undefined,
    image_url: item?.image_url || '',
    sort_order: item?.sort_order || 0,
    allergens: item?.allergens || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      await onSubmit(item.id, formData);
    } else {
      await (onSubmit as (data: CreateMenuItemData) => Promise<void>)(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {item ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อเมนู (ไทย)</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.name_th}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_th: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อเมนู (อังกฤษ)</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value || undefined }))}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {i18n.language === 'th' ? category.name_th : category.name_en}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ราคา (บาท)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.price_thb}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_thb: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ระดับความเผ็ด</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.spice_level || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, spice_level: e.target.value ? parseInt(e.target.value) : undefined }))}
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="1">ไม่เผ็ด</option>
                  <option value="2">เผ็ดน้อย</option>
                  <option value="3">เผ็ดปานกลาง</option>
                  <option value="4">เผ็ดมาก</option>
                  <option value="5">เผ็ดมากที่สุด</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">เวลาปรุง (นาที)</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.preparation_time || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">คำอธิบาย (ไทย)</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={formData.description_th}
                onChange={(e) => setFormData(prev => ({ ...prev, description_th: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">คำอธิบาย (อังกฤษ)</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={formData.description_en}
                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  checked={formData.is_vegetarian}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_vegetarian: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-700">มังสวิรัติ</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  checked={formData.is_vegan}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_vegan: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-700">วีแกน</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  checked={formData.is_halal}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_halal: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-700">ฮาลาล</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  checked={formData.is_gluten_free}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_gluten_free: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-700">ไม่มีกลูเตน</span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                checked={formData.is_available}
                onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {item ? 'อัปเดต' : 'เพิ่มเมนู'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
