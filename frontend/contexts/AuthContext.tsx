'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  username: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, tokenType: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token')
    const storedTokenType = localStorage.getItem('tokenType')
    
    if (storedToken && storedTokenType) {
      setToken(storedToken)
      fetchUserProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token might be expired, clear it
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (newToken: string, tokenType: string) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    localStorage.setItem('tokenType', tokenType)
    
    // For now, set a mock user since we don't have a profile endpoint
    // In a real app, you'd decode the JWT or call a profile endpoint
    setUser({
      username: 'admin',
      roles: ['ROLE_ADMIN', 'ROLE_USER']
    })
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('tokenType')
    setLoading(false)
  }

  const isAuthenticated = !!user && !!token
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
