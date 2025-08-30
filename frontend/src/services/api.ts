import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Enhanced API instance with better typing
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better UX
  headers: {
    'Content-Type': 'application/json',
  },
})

// Enhanced request interceptor with better error handling
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('thaitable_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for performance monitoring
    const endTime = new Date()
    const startTime = (response.config as any).metadata?.startTime
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime()
      if (duration > 1000) {
        console.warn(`Slow API response: ${response.config.url} took ${duration}ms`)
      }
    }
    
    return response
  },
  (error: AxiosError) => {
    // Enhanced error handling with specific error types
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('thaitable_token')
      localStorage.removeItem('thaitable_user')
      window.location.href = '/login'
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
        type: 'AUTH_ERROR'
      })
    }

    if (error.response?.status === 403) {
      return Promise.reject({
        message: 'Access denied. You do not have permission for this action.',
        status: 403,
        type: 'PERMISSION_ERROR'
      })
    }

    if (error.response?.status === 429) {
      return Promise.reject({
        message: 'Too many requests. Please try again later.',
        status: 429,
        type: 'RATE_LIMIT_ERROR'
      })
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        type: 'NETWORK_ERROR'
      })
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status: error.response.status,
        type: 'SERVER_ERROR'
      })
    }

    return Promise.reject(error)
  }
)

// Enhanced API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: any
  meta?: {
    timestamp: string
    requestId?: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  message: string
  status: number
  type: 'AUTH_ERROR' | 'PERMISSION_ERROR' | 'RATE_LIMIT_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'VALIDATION_ERROR'
  errors?: any
}

// Enhanced API Service methods with better typing
export const apiService = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config
      })
      return response.data
    } catch (error) {
      return handleError(error)
    }
  },

  // New method for batch operations
  async batch<T>(operations: Array<{ method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: any }>): Promise<ApiResponse<T[]>> {
    try {
      const promises = operations.map(op => {
        switch (op.method) {
          case 'GET': return api.get<ApiResponse<T>>(op.url)
          case 'POST': return api.post<ApiResponse<T>>(op.url, op.data)
          case 'PUT': return api.put<ApiResponse<T>>(op.url, op.data)
          case 'PATCH': return api.patch<ApiResponse<T>>(op.url, op.data)
          case 'DELETE': return api.delete<ApiResponse<T>>(op.url)
        }
      })
      
      const responses = await Promise.all(promises)
      const results = responses.map(response => response.data.data)
      
      return {
        success: true,
        data: results,
        message: 'Batch operation completed successfully'
      }
    } catch (error) {
      return handleError(error)
    }
  }
}

// Enhanced error handler with better error categorization
const handleError = (error: any): ApiResponse => {
  console.error('API Error:', error)
  
  if (error.response?.data) {
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors,
      meta: {
        timestamp: new Date().toISOString()
      }
    }
  }

  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
    meta: {
      timestamp: new Date().toISOString()
    }
  }
}

// Enhanced health check with detailed status
export const healthCheck = async (): Promise<{ healthy: boolean; details: any }> => {
  try {
    const startTime = Date.now()
    const response = await api.get('/health')
    const endTime = Date.now()
    
    return {
      healthy: true,
      details: {
        responseTime: endTime - startTime,
        status: response.status,
        data: response.data
      }
    }
  } catch (error) {
    return {
      healthy: false,
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Utility function to retry failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> => {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))) // Exponential backoff
      }
    }
  }
  
  throw lastError
}

export default api
