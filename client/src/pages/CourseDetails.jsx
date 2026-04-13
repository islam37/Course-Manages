import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useFetch, useEnrollmentCheck } from '../hooks/useApi'
import { PageWrapper } from '../components/shared'
import { HiClock, HiUser, HiUsers, HiArrowLeft, HiAcademicCap, HiCalendar } from 'react-icons/hi'

export default function CourseDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: course, loading } = useFetch(`/courses/${id}`)
  const { enrolled, setEnrolled, enrollmentId, setEnrollmentId, checkLoading } = useEnrollmentCheck(id, user)
  const [enrollCount, setEnrollCount] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)
  const [localCourse, setLocalCourse] = useState(null)

  useEffect(() => { if (course) setLocalCourse(course) }, [course])
  useEffect(() => { if (course) document.title = `${course.title} — CourseFlow` }, [course])
  useEffect(() => {
    if (!user) return
    api.get('/enrollments/count').then(r => setEnrollCount(r.data.count)).catch(() => {})
  }, [user])

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setActionLoading(true)
    try {
      const res = await api.post(`/enrollments/${id}`)
      setEnrolled(true)
      setEnrollmentId(res.data.enrollment._id)
      setEnrollCount(c => c + 1)
      setLocalCourse(prev => prev ? { ...prev, availableSeats: prev.availableSeats - 1, enrolledCount: prev.enrolledCount + 1 } : prev)
      toast.success('Successfully enrolled!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed')
    } finally { setActionLoading(false) }
  }

  const handleDrop = async () => {
    if (!enrollmentId) return
    setActionLoading(true)
    try {
      await api.delete(`/enrollments/${enrollmentId}`)
      setEnrolled(false)
      setEnrollmentId(null)
      setEnrollCount(c => c - 1)
      setLocalCourse(prev => prev ? { ...prev, availableSeats: prev.availableSeats + 1, enrolledCount: prev.enrolledCount - 1 } : prev)
      toast.success('Enrollment dropped')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to drop')
    } finally { setActionLoading(false) }
  }

  if (loading) return (
    <PageWrapper>
      <div className="animate-pulse space-y-4">
        <div className="skeleton h-8 rounded w-64" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-4 rounded w-5/6" />
      </div>
    </PageWrapper>
  )

  if (!localCourse) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-xl mb-4">Course not found</p>
        <Link to="/courses" className="btn-ghost text-sm">Back to courses</Link>
      </div>
    </PageWrapper>
  )

  const fillPct = Math.round(((localCourse.totalSeats - localCourse.availableSeats) / localCourse.totalSeats) * 100)
  const isFull = localCourse.availableSeats === 0

  return (
    <PageWrapper>
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors hover:text-accent"
        style={{ color: 'rgba(232,234,240,0.55)' }}>
        <HiArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-blue text-xs">{localCourse.category}</span>
            </div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-3 leading-tight">{localCourse.title}</h1>
            <p style={{ color: 'rgba(232,234,240,0.65)' }} className="text-sm leading-relaxed">{localCourse.shortDescription}</p>
          </motion.div>

          <div className="card p-5">
            <h2 className="font-display font-semibold text-base mb-3">About this course</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,234,240,0.7)' }}>{localCourse.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: HiClock, label: 'Duration', value: localCourse.duration },
              { icon: HiUser, label: 'Instructor', value: localCourse.instructorName },
              { icon: HiUsers, label: 'Enrolled', value: `${localCourse.enrolledCount} students` },
              { icon: HiCalendar, label: 'Seats left', value: `${localCourse.availableSeats}/${localCourse.totalSeats}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="card p-3.5">
                <Icon className="w-4 h-4 mb-2" style={{ color: '#4f8ef7' }} />
                <p className="text-[11px] mb-0.5" style={{ color: 'rgba(232,234,240,0.45)' }}>{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar card */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-6">
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: 'rgba(232,234,240,0.55)' }}>Seats available</span>
                <span className={`font-semibold ${isFull ? 'text-red-400' : ''}`}>
                  {localCourse.availableSeats}/{localCourse.totalSeats}
                </span>
              </div>
              <div className="seats-bar">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${fillPct}%`, background: isFull ? '#ff7b87' : fillPct >= 80 ? '#f5a623' : '#4f8ef7' }} />
              </div>
            </div>

            <div className="space-y-2.5 mb-5 text-sm" style={{ color: 'rgba(232,234,240,0.6)' }}>
              <div className="flex items-center gap-2"><HiClock className="w-4 h-4 text-accent" />{localCourse.duration}</div>
              <div className="flex items-center gap-2"><HiUser className="w-4 h-4 text-accent" />{localCourse.instructorName}</div>
              <div className="flex items-center gap-2"><HiAcademicCap className="w-4 h-4 text-accent" />{localCourse.category}</div>
            </div>

            {checkLoading ? (
              <div className="skeleton h-10 rounded-lg" />
            ) : enrolled ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 rounded-lg text-center text-sm font-medium"
                  style={{ background: 'rgba(30,203,138,0.15)', color: '#1ecb8a', border: '0.5px solid rgba(30,203,138,0.3)' }}>
                  ✓ You are enrolled
                </div>
                <button onClick={handleDrop} disabled={actionLoading}
                  className="btn-danger w-full justify-center text-sm disabled:opacity-50">
                  {actionLoading ? 'Dropping...' : 'Drop Course'}
                </button>
              </div>
            ) : (
              <button onClick={handleEnroll}
                disabled={isFull || actionLoading || (user && enrollCount >= 3)}
                className="btn-primary w-full justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                {actionLoading ? 'Enrolling...'
                  : !user ? 'Login to Enroll'
                  : isFull ? 'Course Full'
                  : enrollCount >= 3 ? 'Enrollment Limit Reached'
                  : 'Enroll Now'}
              </button>
            )}

            {user && !enrolled && enrollCount >= 3 && (
              <p className="text-xs text-center mt-2" style={{ color: 'rgba(232,234,240,0.4)' }}>
                Drop a course to free up a slot
              </p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
