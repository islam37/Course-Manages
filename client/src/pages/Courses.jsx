import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { CourseCard, CardSkeleton, EmptyState, PageWrapper } from '../components/shared'
import { HiSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const CATEGORIES = ['All', 'Development', 'Data Science', 'Design', 'Cloud', 'Business', 'Other']

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [enrollingId, setEnrollingId] = useState(null)
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const [enrollCount, setEnrollCount] = useState(0)
  
  // For request cancellation
  const cancelTokenRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const fetchCourses = useCallback(async (pg = 1, searchTerm = '', cat = 'All') => {
    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort()
    }
    cancelTokenRef.current = new AbortController()

    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 9 })
      if (searchTerm) params.append('search', searchTerm.trim())
      if (cat !== 'All') params.append('category', cat)
      
      const res = await api.get(`/courses?${params}`, {
        signal: cancelTokenRef.current.signal
      })
      
      // Validate response
      if (!Array.isArray(res.data?.courses)) {
        throw new Error('Invalid courses response format')
      }
      
      setCourses(res.data.courses)
      setTotalPages(Math.max(1, res.data.totalPages || 1))
    } catch (err) {
      // Ignore abort and canceled errors (normal on unmount/dependency change)
      if (err.name !== 'AbortError' && err.message !== 'canceled') {
        console.error('Failed to load courses:', err.message)
        toast.error('Failed to load courses')
        setCourses([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch courses when page or category changes
  useEffect(() => {
    fetchCourses(page, search, category)
  }, [page, category, fetchCourses])

  // Debounced search - prevents race conditions
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1)
      fetchCourses(1, search, category)
    }, 400)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search, category, fetchCourses])

  // Fetch user's enrollments
  useEffect(() => {
    if (!user) return

    const enrollmentsCancelToken = new AbortController()

    Promise.all([
      api.get('/enrollments/my-courses', { signal: enrollmentsCancelToken.signal })
        .then(res => {
          if (Array.isArray(res.data)) {
            setEnrolledIds(new Set(res.data.map(e => e.courseId?._id || e.courseId)))
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch enrollments:', err.message)
          }
        }),
      api.get('/enrollments/count', { signal: enrollmentsCancelToken.signal })
        .then(res => {
          if (typeof res.data?.count === 'number') {
            setEnrollCount(res.data.count)
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch enrollment count:', err.message)
          }
        })
    ])

    return () => enrollmentsCancelToken.abort()
  }, [user])

  useEffect(() => {
    document.title = 'Browse Courses — CourseFlow'
  }, [])

  const handleEnroll = async (courseId, courseTitle) => {
    if (!user) {
      toast.error('Please login to enroll')
      return
    }
    if (enrollCount >= 3) {
      toast.error('You can only enroll in 3 courses at a time')
      return
    }

    // Prevent duplicate submissions
    if (enrollingId === courseId) return

    setEnrollingId(courseId)
    try {
      await api.post(`/enrollments/${courseId}`)
      setEnrolledIds(prev => new Set([...prev, courseId]))
      setEnrollCount(c => c + 1)
      setCourses(prev => prev.map(c => c._id === courseId
        ? { ...c, availableSeats: Math.max(0, c.availableSeats - 1), enrolledCount: (c.enrolledCount || 0) + 1 }
        : c))
      toast.success(`Enrolled in ${courseTitle}!`)
    } catch (err) {
      const message = err.response?.data?.message || 'Enrollment failed'
      toast.error(message)
      console.error('Enrollment error:', message)
    } finally {
      setEnrollingId(null)
    }
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1">Browse Courses</h1>
        <p className="text-sm" style={{ color: 'rgba(232,234,240,0.55)' }}>
          {user ? `${3 - enrollCount} enrollment slot${3 - enrollCount !== 1 ? 's' : ''} remaining` : 'Login to start enrolling'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(232,234,240,0.35)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat)
                setPage(1)
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: category === cat ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.05)',
                color: category === cat ? '#82b4ff' : 'rgba(232,234,240,0.55)',
                border: `0.5px solid ${category === cat ? 'rgba(79,142,247,0.4)' : 'rgba(255,255,255,0.08)'}`
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No courses found"
          description="Try adjusting your search or filter criteria."
          action={<button onClick={() => { setSearch(''); setCategory('All'); setPage(1) }} className="btn-ghost text-sm">Clear filters</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => {
            const isEnrolled = enrolledIds.has(course._id)
            const isFull = course.availableSeats === 0
            return (
              <CourseCard
                key={course._id}
                course={course}
                index={i}
                actionSlot={
                  <div className="flex gap-2">
                    <Link to={`/courses/${course._id}`} className="btn-ghost text-xs py-1.5 flex-1 justify-center">
                      Details
                    </Link>
                    {user ? (
                      isEnrolled ? (
                        <button disabled className="btn-success text-xs py-1.5 flex-1 justify-center opacity-80 cursor-not-allowed">
                          ✓ Enrolled
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course._id, course.title)}
                          disabled={isFull || enrollingId === course._id || enrollCount >= 3}
                          className="btn-primary text-xs py-1.5 flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                          {enrollingId === course._id ? 'Enrolling...' : isFull ? 'Full' : 'Enroll'}
                        </button>
                      )
                    ) : (
                      <Link to="/login" className="btn-primary text-xs py-1.5 flex-1 justify-center">
                        Login to enroll
                      </Link>
                    )}
                  </div>
                }
              />
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost py-1.5 px-2.5 disabled:opacity-30">
            <HiChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 rounded-lg text-sm transition-all"
              style={{
                background: p === page ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.05)',
                color: p === page ? '#82b4ff' : 'rgba(232,234,240,0.6)',
                border: `0.5px solid ${p === page ? 'rgba(79,142,247,0.35)' : 'rgba(255,255,255,0.08)'}`
              }}>
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost py-1.5 px-2.5 disabled:opacity-30">
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </PageWrapper>
  )
}
