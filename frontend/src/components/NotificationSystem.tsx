import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  ShoppingCart,
  X
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'order'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
  autoClose?: boolean
  duration?: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onClearAll: () => void
  maxVisible?: number
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onClearAll,
  maxVisible = 5
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Update visible notifications
  useEffect(() => {
    const recent = notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxVisible)
    setVisibleNotifications(recent)
  }, [notifications, maxVisible])

  // Auto-close notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    visibleNotifications.forEach(notification => {
      if (notification.autoClose && !notification.read) {
        const timer = setTimeout(() => {
          onDismiss(notification.id)
        }, notification.duration || 5000)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [visibleNotifications, onDismiss])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'order':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (notification.action) {
      notification.action.onClick()
    }
  }, [onMarkAsRead])

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-lg transition-colors"
        aria-label="Open notifications"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('notifications.title')}
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {t('notifications.clearAll')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close notifications"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {visibleNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{t('notifications.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-25' : ''
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                          {notification.message}
                        </p>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              notification.action!.onClick()
                            }}
                            className="mt-2 text-sm text-amber-600 hover:text-amber-500 font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDismiss(notification.id)
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss notification"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > maxVisible && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button className="text-sm text-amber-600 hover:text-amber-500 font-medium">
                {t('notifications.viewAll')} ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast Notifications for New Items */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {visibleNotifications
          .filter(n => !n.read && n.autoClose !== false)
          .slice(0, 3)
          .map((notification) => (
            <div
              key={`toast-${notification.id}`}
              className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm transform transition-all duration-300 ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>
                  {notification.action && (
                    <button
                      onClick={notification.action.onClick}
                      className="mt-2 text-sm text-amber-600 hover:text-amber-500 font-medium"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss toast notification"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default NotificationSystem

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
    return newNotification.id
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  // Helper functions for different notification types
  const notifySuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 4000,
      ...options
    })
  }, [addNotification])

  const notifyError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      autoClose: false,
      ...options
    })
  }, [addNotification])

  const notifyWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration: 6000,
      ...options
    })
  }, [addNotification])

  const notifyOrder = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'order',
      title,
      message,
      autoClose: false,
      ...options
    })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    markAsRead,
    dismiss,
    clearAll,
    markAllAsRead,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyOrder
  }
}
