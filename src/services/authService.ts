import axios from 'axios'

const API_URL = 'http://localhost:3000/v1'

export interface LoginCredentials {
  user: {
    email: string
    password: string
  }
}

export interface SignUpCredentials {
  user: {
    name: string
    email: string
    password: string
  }
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

export const authService = {
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/sign_up`, credentials)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.put(`${API_URL}/auth/sign_in`, credentials)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getUserInfo(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/users/infos`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  getUser(): any {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
} 