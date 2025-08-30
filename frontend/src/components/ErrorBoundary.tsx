import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })

    // Log error to external service (e.g., Sentry)
    // logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                เกิดข้อผิดพลาด
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Something went wrong. Please try again or contact support if the problem persists.
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error Details
                  </h3>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-sm text-gray-700 font-mono">
                      {this.state.error?.message || 'Unknown error'}
                    </p>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Stack Trace
                    </h3>
                    <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-gray-700 font-mono">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    ลองใหม่
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    หน้าแรก
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                If this problem continues, please contact support at{' '}
                <a href="mailto:support@thaitable.com" className="text-yellow-600 hover:text-yellow-500">
                  support@thaitable.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
