import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Modal, PageWrapper } from '../components/shared'
import { HiClock, HiUser, HiTrash, HiExternalLink } from 'react-icons/hi'

export default function MyEnrolledCourses() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [dropping, setDropping] = useState(null)
  const [confirmDrop, setConfirmDrop] = useState(null)

  useEffect(() => {
    document.title = 'My Courses — CourseFlow'
    api.get('/enrollments/my-courses')
      .then(res => setEnrollments(res.data))
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false))
  }, [])

  const handleDrop = async () => {
    if (!confirmDrop) return
    setDropping(confirmDrop._id)
    try {
      await api.delete(`/enrollments/${confirmDrop._id}`)
      setEnrollments(prev => prev.filter(e => e._id !== confirmDrop._id))
      toast.success('Enrollment dropped')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to drop')
    } finally {
      setDropping(null)
      setConfirmDrop(null)
    }
  }

  const slotsUsed = enrollments.length

  return (
    <PageWrapper>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1">My Courses</h1>
          <p className="text-sm" style={{ color: 'rgba(232,234,240,0.55)' }}>
            {slotsUsed}/3 enrollment slots used
          </p>
        </div>

        {/* Slot indicator */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                background: i < slotsUsed ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: i < slotsUsed ? 'rgba(79,142,247,0.4)' : 'rgba(255,255,255,0.08)',
                color: i < slotsUsed ? '#4f8ef7' : 'rgba(232,234,240,0.2)'
              }}>
              {i < slotsUsed ? '✓' : i + 1}
            </div>
          ))}
          <span className="text-xs ml-1" style={{ color: 'rgba(232,234,240,0.4)' }}>slots</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState emoji="📚" title="No courses yet"
          description="You haven't enrolled in any courses. Browse the catalog and start learning!"
          action={<Link to="/courses" className="btn-primary text-sm">Browse Courses</Link>}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {enrollments.map((enrollment, i) => {
              const course = enrollment.courseId
              if (!course) return null
              return (
                <motion.div key={enrollment._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="card p-5 flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(79,142,247,0.1)' }}>
                    {['⚛️', '🐍', '🎨', '☁️', '🤖', '💼'][i % 6]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-semibold text-sm">{course.title}</h3>
                      <span className="badge badge-green text-[10px]">Active</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'rgba(232,234,240,0.45)' }}>
                      <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{course.duration}</span>
                      <span className="flex items-center gap-1"><HiUser className="w-3 h-3" />{course.instructorName}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(232,234,240,0.4)' }}>
                      Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/courses/${course._id}`}
                      className="btn-ghost text-xs py-1.5 px-3">
                      <HiExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                    <button onClick={() => setConfirmDrop(enrollment)}
                      className="btn-danger text-xs py-1.5 px-3">
                      <HiTrash className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Drop</span>
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {slotsUsed < 3 && (
            <Link to="/courses"
              className="card p-5 flex items-center justify-center gap-3 border-dashed hover:bg-white/5 transition-colors text-sm"
              style={{ color: 'rgba(232,234,240,0.4)' }}>
              <span className="text-xl">+</span>
              Enroll in another course ({3 - slotsUsed} slot{3 - slotsUsed !== 1 ? 's' : ''} left)
            </Link>
          )}
        </div>
      )}

      {/* Drop confirmation modal */}
      <AnimatePresence>
        {confirmDrop && (
          <Modal isOpen={!!confirmDrop} onClose={() => setConfirmDrop(null)} title="Drop this course?">
            <p className="text-sm mb-1" style={{ color: 'rgba(232,234,240,0.7)' }}>
              You're about to drop <strong>{confirmDrop.courseTitle}</strong>.
            </p>
            <p className="text-xs mb-5" style={{ color: 'rgba(232,234,240,0.45)' }}>
              This will free up one enrollment slot. You can re-enroll later if seats are available.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDrop(null)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleDrop} disabled={!!dropping} className="btn-danger text-sm disabled:opacity-50">
                {dropping ? 'Dropping...' : 'Drop Course'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
