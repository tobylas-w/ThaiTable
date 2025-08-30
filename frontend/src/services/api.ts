import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('thaitable_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('thaitable_token')
      localStorage.removeItem('thaitable_user')
      window.location.href = '/login'
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0
      })
    }

    return Promise.reject(error)
  }
)

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Service methods
export const apiService = {
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.get(url, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.post(url, data, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.put(url, data, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.patch(url, data, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete(url, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async upload<T>(url: string, file: File, config?: any): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config
      })
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }
}

// Error handler
const handleError = (error: any): ApiResponse => {
  if (error.response?.data) {
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors
    }
  }

  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
  }
}

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health')
    return true
  } catch (error) {
    return false
  }
}

export default api
