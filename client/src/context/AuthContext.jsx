import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../utils/firebase'
import api, { setOn401Callback, fetchCSRFToken } from '../utils/api'

const AuthContext = createContext(null)

const TOKEN_REFRESH_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours (adjust based on backend)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch (err) {
      console.error('Failed to parse stored user:', err)
      return null
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Setup 401 callback
  useEffect(() => {
    setOn401Callback(() => {
      setUserState(null)
      setError('Session expired. Please login again.')
      // Navigate to login on next render
      window.location.href = '/login'
    })
    
    // Fetch CSRF token on app initialization
    fetchCSRFToken()
  }, [])

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const res = await api.get('/auth/verify')
        saveUser(res.data.user)
      } catch (err) {
        console.error('Token verification failed:', err.message)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUserState(null)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  // Token refresh timer
  useEffect(() => {
    if (!user) return
    const refreshToken = async () => {
      try {
        const res = await api.post('/auth/refresh')
        localStorage.setItem('token', res.data.token)
        console.log('Token refreshed successfully')
      } catch (err) {
        console.error('Token refresh failed:', err.message)
      }
    }

    const interval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [user])

  const saveUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUserState(userData)
    setError(null)
  }

  const register = async (name, email, password, photoURL) => {
    try {
      setError(null)
      const res = await api.post('/auth/register', { name, email, password, photoURL })
      localStorage.setItem('token', res.data.token)
      saveUser(res.data.user)
      return res.data
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      saveUser(res.data.user)
      return res.data
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw err
    }
  }

  const loginWithGoogle = async () => {
    try {
      setError(null)
      const result = await signInWithPopup(auth, googleProvider)
      const { displayName, email, photoURL, uid } = result.user
      const res = await api.post('/auth/google', { name: displayName, email, photoURL, googleId: uid })
      localStorage.setItem('token', res.data.token)
      saveUser(res.data.user)
      return res.data
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed'
      setError(message)
      throw err
    }
  }

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Firebase signout failed:', err.message)
    }

    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout API call failed:', err.message)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('csrf-token')
    setUserState(null)
    setError(null)
  }, [])

  const isAdmin = user?.role === 'admin'

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAdmin,
    register,
    login,
    loginWithGoogle,
    logout,
  }), [user, loading, error, isAdmin, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
