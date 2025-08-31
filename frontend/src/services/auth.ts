import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name_th: string
  name_en: string
  role: string
  restaurant_id: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    const { user, token } = response.data

    // Store token in localStorage
    localStorage.setItem('thaitable_token', token)
    localStorage.setItem('thaitable_user', JSON.stringify(user))

    return { user, token }
  },

  async register(userData: any): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData)
    const { user, token } = response.data

    // Store token in localStorage
    localStorage.setItem('thaitable_token', token)
    localStorage.setItem('thaitable_user', JSON.stringify(user))

    return { user, token }
  },

  logout(): void {
    localStorage.removeItem('thaitable_token')
    localStorage.removeItem('thaitable_user')
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('thaitable_user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }
}
