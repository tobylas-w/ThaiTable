import { ApiError } from '../services/api'

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Enhanced error interface
export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  messageEn: string
  code?: string
  details?: any
  timestamp: string
  userAction?: string
  retryable: boolean
}

// Error messages in Thai and English
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    th: 'เกิดปัญหาในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    en: 'Network connection issue. Please check your internet connection',
    severity: ErrorSeverity.MEDIUM,
    retryable: true
  },
  [ErrorType.AUTHENTICATION]: {
    th: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
    en: 'Session expired. Please login again',
    severity: ErrorSeverity.HIGH,
    retryable: false
  },
  [ErrorType.AUTHORIZATION]: {
    th: 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้',
    en: 'You do not have permission to access this feature',
    severity: ErrorSeverity.HIGH,
    retryable: false
  },
  [ErrorType.VALIDATION]: {
    th: 'ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
    en: 'Invalid data provided. Please check and try again',
    severity: ErrorSeverity.LOW,
    retryable: true
  },
  [ErrorType.NOT_FOUND]: {
    th: 'ไม่พบข้อมูลที่ต้องการ',
    en: 'Requested data not found',
    severity: ErrorSeverity.MEDIUM,
    retryable: false
  },
  [ErrorType.SERVER]: {
    th: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
    en: 'Server error occurred. Please try again later',
    severity: ErrorSeverity.HIGH,
    retryable: true
  },
  [ErrorType.UNKNOWN]: {
    th: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    en: 'An unknown error occurred',
    severity: ErrorSeverity.MEDIUM,
    retryable: true
  }
}

// User action suggestions
const USER_ACTIONS = {
  [ErrorType.NETWORK]: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่',
  [ErrorType.AUTHENTICATION]: 'เข้าสู่ระบบใหม่',
  [ErrorType.AUTHORIZATION]: 'ติดต่อผู้ดูแลระบบ',
  [ErrorType.VALIDATION]: 'ตรวจสอบข้อมูลที่กรอก',
  [ErrorType.NOT_FOUND]: 'ตรวจสอบข้อมูลที่ต้องการ',
  [ErrorType.SERVER]: 'ลองใหม่อีกครั้งในภายหลัง',
  [ErrorType.UNKNOWN]: 'ลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ'
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Convert API error to AppError
  handleApiError(error: ApiError | any, language: 'th' | 'en' = 'th'): AppError {
    let errorType = ErrorType.UNKNOWN
    let message = ''
    let messageEn = ''

    // Determine error type based on API error
    if (error.type) {
      switch (error.type) {
        case 'AUTH_ERROR':
          errorType = ErrorType.AUTHENTICATION
          break
        case 'PERMISSION_ERROR':
          errorType = ErrorType.AUTHORIZATION
          break
        case 'NETWORK_ERROR':
          errorType = ErrorType.NETWORK
          break
        case 'SERVER_ERROR':
          errorType = ErrorType.SERVER
          break
        case 'VALIDATION_ERROR':
          errorType = ErrorType.VALIDATION
          break
        default:
          errorType = ErrorType.UNKNOWN
      }
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorType = ErrorType.AUTHENTICATION
          break
        case 403:
          errorType = ErrorType.AUTHORIZATION
          break
        case 404:
          errorType = ErrorType.NOT_FOUND
          break
        case 422:
          errorType = ErrorType.VALIDATION
          break
        case 500:
        case 502:
        case 503:
          errorType = ErrorType.SERVER
          break
        default:
          errorType = ErrorType.UNKNOWN
      }
    }

    // Get error messages
    const errorInfo = ERROR_MESSAGES[errorType]
    message = error.message || errorInfo.th
    messageEn = errorInfo.en

    const appError: AppError = {
      type: errorType,
      severity: errorInfo.severity,
      message: language === 'th' ? message : messageEn,
      messageEn,
      code: error.status?.toString(),
      details: error.errors || error,
      timestamp: new Date().toISOString(),
      userAction: USER_ACTIONS[errorType],
      retryable: errorInfo.retryable
    }

    // Log error
    this.logError(appError)

    return appError
  }

  // Handle generic errors
  handleError(error: any, context?: string): AppError {
    console.error('Error occurred:', error, 'Context:', context)

    let appError: AppError

    if (error instanceof Error) {
      appError = {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        messageEn: error.message,
        details: { stack: error.stack, context },
        timestamp: new Date().toISOString(),
        userAction: USER_ACTIONS[ErrorType.UNKNOWN],
        retryable: true
      }
    } else {
      appError = {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        messageEn: 'An unknown error occurred',
        details: { error, context },
        timestamp: new Date().toISOString(),
        userAction: USER_ACTIONS[ErrorType.UNKNOWN],
        retryable: true
      }
    }

    this.logError(appError)
    return appError
  }

  // Log error for debugging
  private logError(error: AppError): void {
    this.errorLog.push(error)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error: ${error.type}`)
      console.error('Message:', error.message)
      console.error('Severity:', error.severity)
      console.error('Timestamp:', error.timestamp)
      console.error('Details:', error.details)
      console.error('User Action:', error.userAction)
      console.groupEnd()
    }

    // TODO: Send to error tracking service in production
    // if (import.meta.env.PROD) {
    //   this.sendToErrorTracking(error)
    // }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
  }

  // Get errors by type
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type)
  }

  // Get errors by severity
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorLog.filter(error => error.severity === severity)
  }

  // Check if there are critical errors
  hasCriticalErrors(): boolean {
    return this.errorLog.some(error => error.severity === ErrorSeverity.CRITICAL)
  }

  // Get error statistics
  getErrorStats(): {
    total: number
    byType: Record<ErrorType, number>
    bySeverity: Record<ErrorSeverity, number>
  } {
    const byType: Record<ErrorType, number> = {} as any
    const bySeverity: Record<ErrorSeverity, number> = {} as any

    // Initialize counters
    Object.values(ErrorType).forEach(type => byType[type] = 0)
    Object.values(ErrorSeverity).forEach(severity => bySeverity[severity] = 0)

    // Count errors
    this.errorLog.forEach(error => {
      byType[error.type]++
      bySeverity[error.severity]++
    })

    return {
      total: this.errorLog.length,
      byType,
      bySeverity
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
export const handleNetworkError = (error: any) => {
  return errorHandler.handleError(error, 'Network operation')
}

export const handleValidationError = (error: any) => {
  return errorHandler.handleError(error, 'Form validation')
}

export const handleApiRequestError = (error: any) => {
  return errorHandler.handleApiError(error)
}

// Error boundary helper
export const createErrorBoundaryFallback = (error: AppError) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">เกิดข้อผิดพลาด</h3>
          <p className="mt-2 text-sm text-gray-500">{error.message}</p>
          {error.userAction && (
            <p className="mt-2 text-xs text-gray-400">{error.userAction}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    </div>
  )
}
