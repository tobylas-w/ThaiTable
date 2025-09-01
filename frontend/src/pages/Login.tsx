import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Clear auth error when user starts typing
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = t('validation.required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email')
    }

    if (!formData.password) {
      newErrors.password = t('validation.required')
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.minLength', { min: 6 })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    clearError()

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background-secondary rounded-2xl shadow-xl p-8 border border-border-primary">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍜</span>
          </div>
          <h1 className="text-3xl font-bold text-heading mb-2">
            {t('login.title')}
          </h1>
          <p className="text-text-secondary">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="notification-error mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="form-label">
              {t('login.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field pl-10 ${errors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="form-label">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className={`input-field pl-10 pr-12 ${errors.password ? 'border-red-500 dark:border-red-400' : ''}`}
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('login.signingIn')}
              </div>
            ) : (
              t('login.signIn')
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            {t('login.footer')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
