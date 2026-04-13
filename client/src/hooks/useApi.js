import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'

// Generic fetch hook with request cancellation
export function useFetch(url, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cancelTokenRef = useRef(null)

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false)
      return
    }

    // Cancel previous request if exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort()
    }

    // Create new abort controller
    cancelTokenRef.current = new AbortController()

    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url, {
        signal: cancelTokenRef.current.signal
      })
      setData(res.data)
    } catch (err) {
      // Ignore abort errors and canceled requests (normal on unmount/component change)
      if (err.name !== 'AbortError' && err.message !== 'canceled') {
        setError(err.response?.data?.message || 'Failed to fetch')
        console.error(`Fetch error (${url}):`, err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
    return () => {
      // Cleanup: abort request on unmount
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort()
      }
    }
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Enrollment check hook with proper dependencies
export function useEnrollmentCheck(courseId, user) {
  const [enrolled, setEnrolled] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState(null)
  const [checkLoading, setCheckLoading] = useState(false)
  const cancelTokenRef = useRef(null)

  useEffect(() => {
    if (!courseId || !user?._id) return

    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort()
    }
    cancelTokenRef.current = new AbortController()

    setCheckLoading(true)
    api.get(`/enrollments/check/${courseId}`, {
      signal: cancelTokenRef.current.signal
    })
      .then(res => {
        setEnrolled(res.data.enrolled)
        setEnrollmentId(res.data.enrollment?._id || null)
      })
      .catch(err => {
        // Ignore abort errors (normal on unmount/dependency change)
        if (err.name !== 'AbortError' && err.message !== 'canceled') {
          console.error('Enrollment check error:', err.message)
        }
      })
      .finally(() => setCheckLoading(false))

    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort()
      }
    }
  }, [courseId, user?._id])

  return { enrolled, setEnrolled, enrollmentId, setEnrollmentId, checkLoading }
}

// Enrollment count hook with proper cleanup
export function useEnrollmentCount(user) {
  const [count, setCount] = useState(0)
  const cancelTokenRef = useRef(null)

  const fetchCount = useCallback(async () => {
    if (!user?._id) return

    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort()
    }
    cancelTokenRef.current = new AbortController()

    try {
      const res = await api.get('/enrollments/count', {
        signal: cancelTokenRef.current.signal
      })
      setCount(res.data.count)
    } catch (err) {
      // Ignore abort errors (normal on unmount/dependency change)
      if (err.name !== 'AbortError' && err.message !== 'canceled') {
        console.error('Enrollment count error:', err.message)
      }
    }
  }, [user?._id])

  useEffect(() => {
    fetchCount()
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort()
      }
    }
  }, [fetchCount])

  return { count, setCount, refetchCount: fetchCount }
}
