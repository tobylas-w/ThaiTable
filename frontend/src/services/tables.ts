import api from './api';

// Types
export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'OUT_OF_SERVICE';
  location_x?: number;
  location_y?: number;
  orders?: Order[];
  _count?: {
    orders: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_thb: number;
  user: {
    name_th: string;
    name_en: string;
  };
  order_items: {
    menu: {
      name_th: string;
      name_en: string;
      price_thb: number;
    };
    quantity: number;
  }[];
  created_at: string;
}

export interface CreateTableData {
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'OUT_OF_SERVICE';
  location_x?: number;
  location_y?: number;
}

export interface UpdateTableData extends Partial<CreateTableData> {
  restaurant_id?: never; // Cannot update restaurant_id
}

export interface TablePosition {
  id: string;
  location_x: number;
  location_y: number;
}

export interface TableStats {
  total_tables: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  cleaning_tables: number;
  out_of_service_tables: number;
  utilization_rate: number;
}

// Table API functions
export const tableService = {
  // Get all tables for a restaurant
  async getTables(restaurantId: string, status?: string, capacity?: number): Promise<{ data: Table[]; count: number }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (capacity) params.append('capacity', capacity.toString());

    const response = await api.get(`/tables/restaurant/${restaurantId}?${params.toString()}`);
    return response.data;
  },

  // Get table by ID
  async getTable(id: string): Promise<{ data: Table }> {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  // Create new table
  async createTable(data: CreateTableData): Promise<{ data: Table; message: string }> {
    const response = await api.post('/tables', data);
    return response.data;
  },

  // Update table
  async updateTable(id: string, data: UpdateTableData): Promise<{ data: Table; message: string }> {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  // Delete table
  async deleteTable(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },

  // Update table status
  async updateTableStatus(id: string, status: Table['status']): Promise<{ data: Table; message: string }> {
    const response = await api.patch(`/tables/${id}/status`, { status });
    return response.data;
  },

  // Update table positions (for floor plan)
  async updateTablePositions(restaurantId: string, tablePositions: TablePosition[]): Promise<{ message: string }> {
    const response = await api.patch(`/tables/restaurant/${restaurantId}/positions`, {
      table_positions: tablePositions
    });
    return response.data;
  },

  // Get table statistics
  async getTableStats(restaurantId: string): Promise<{ data: TableStats }> {
    const response = await api.get(`/tables/restaurant/${restaurantId}/stats`);
    return response.data;
  },

  // Bulk create tables
  async bulkCreateTables(restaurantId: string, tables: Omit<CreateTableData, 'restaurant_id'>[]): Promise<{ data: Table[]; message: string }> {
    const response = await api.post(`/tables/restaurant/${restaurantId}/bulk`, { tables });
    return response.data;
  }
};

// Utility functions
export const getTableStatusText = (status: Table['status']): string => {
  const statusMap = {
    'AVAILABLE': 'ว่าง',
    'OCCUPIED': 'มีลูกค้า',
    'RESERVED': 'จองแล้ว',
    'CLEANING': 'กำลังทำความสะอาด',
    'OUT_OF_SERVICE': 'ไม่ให้บริการ'
  };
  return statusMap[status] || status;
};

export const getTableStatusColor = (status: Table['status']): string => {
  const colorMap = {
    'AVAILABLE': 'bg-green-100 text-green-800',
    'OCCUPIED': 'bg-red-100 text-red-800',
    'RESERVED': 'bg-blue-100 text-blue-800',
    'CLEANING': 'bg-yellow-100 text-yellow-800',
    'OUT_OF_SERVICE': 'bg-gray-100 text-gray-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getTableStatusIcon = (status: Table['status']): string => {
  const iconMap = {
    'AVAILABLE': '✓',
    'OCCUPIED': '👥',
    'RESERVED': '📅',
    'CLEANING': '🧹',
    'OUT_OF_SERVICE': '🚫'
  };
  return iconMap[status] || '?';
};

export const formatTableNumber = (tableNumber: string): string => {
  return `โต๊ะ ${tableNumber}`;
};

export const getCapacityText = (capacity: number): string => {
  return `${capacity} ที่นั่ง`;
};

export const getCapacityColor = (capacity: number): string => {
  if (capacity <= 2) return 'bg-blue-100 text-blue-800';
  if (capacity <= 4) return 'bg-green-100 text-green-800';
  if (capacity <= 6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Floor plan utilities
export const calculateTablePosition = (index: number, totalTables: number, containerWidth: number, containerHeight: number): { x: number; y: number } => {
  const cols = Math.ceil(Math.sqrt(totalTables));
  const rows = Math.ceil(totalTables / cols);
  
  const col = index % cols;
  const row = Math.floor(index / cols);
  
  const x = (col / (cols - 1)) * containerWidth;
  const y = (row / (rows - 1)) * containerHeight;
  
  return { x, y };
};

export const generateDefaultTablePositions = (tables: Table[], containerWidth: number, containerHeight: number): TablePosition[] => {
  return tables.map((table, index) => {
    const position = calculateTablePosition(index, tables.length, containerWidth, containerHeight);
    return {
      id: table.id,
      location_x: table.location_x || position.x,
      location_y: table.location_y || position.y
    };
  });
};

// Table management utilities
export const getAvailableTables = (tables: Table[]): Table[] => {
  return tables.filter(table => table.status === 'AVAILABLE');
};

export const getOccupiedTables = (tables: Table[]): Table[] => {
  return tables.filter(table => table.status === 'OCCUPIED');
};

export const getTablesByCapacity = (tables: Table[], capacity: number): Table[] => {
  return tables.filter(table => table.capacity >= capacity);
};

export const sortTablesByNumber = (tables: Table[]): Table[] => {
  return [...tables].sort((a, b) => {
    const aNum = parseInt(a.table_number) || 0;
    const bNum = parseInt(b.table_number) || 0;
    return aNum - bNum;
  });
};

export const getTableUtilizationRate = (tables: Table[]): number => {
  if (tables.length === 0) return 0;
  
  const occupiedTables = tables.filter(table => 
    table.status === 'OCCUPIED' || table.status === 'RESERVED'
  ).length;
  
  return (occupiedTables / tables.length) * 100;
};
