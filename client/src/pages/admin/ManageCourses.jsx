import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useFetch } from '../../hooks/useApi'
import { TableSkeleton, EmptyState, Modal, PageWrapper } from '../../components/shared'
import { HiPlus, HiPencil, HiTrash, HiUsers } from 'react-icons/hi'

export default function ManageCourses() {
  const { data, loading, refetch } = useFetch('/courses?limit=50')
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { document.title = 'Manage Courses — CourseFlow' }, [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(confirmDelete._id)
    try {
      await api.delete(`/courses/${confirmDelete._id}`)
      toast.success('Course deleted')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  const courses = data?.courses || []

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1">Manage Courses</h1>
          <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/dashboard/add-course" className="btn-primary text-sm">
          <HiPlus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? <TableSkeleton rows={5} cols={5} /> : courses.length === 0 ? (
          <EmptyState emoji="📚" title="No courses yet"
            description="Add your first course to get started."
            action={<Link to="/dashboard/add-course" className="btn-primary text-sm">Add Course</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {['Course', 'Category', 'Instructor', 'Seats', 'Fill', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'rgba(232,234,240,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {courses.map((course, i) => {
                    const fillPct = Math.round(((course.totalSeats - course.availableSeats) / course.totalSeats) * 100)
                    const isFull = course.availableSeats === 0
                    return (
                      <motion.tr key={course._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium max-w-[200px] truncate">{course.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,240,0.4)' }}>{course.duration}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="badge badge-blue text-[10px]">{course.category}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm" style={{ color: 'rgba(232,234,240,0.6)' }}>
                          <span className="max-w-[120px] truncate block">{course.instructorName}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(232,234,240,0.6)' }}>
                            <HiUsers className="w-3 h-3" />
                            {course.availableSeats}/{course.totalSeats}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 seats-bar">
                              <div className="h-full rounded-full"
                                style={{ width: `${fillPct}%`, background: isFull ? '#ff7b87' : fillPct >= 80 ? '#f5a623' : '#4f8ef7' }} />
                            </div>
                            <span className="text-xs" style={{ color: 'rgba(232,234,240,0.5)' }}>{fillPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Link to={`/dashboard/edit-course/${course._id}`}
                              className="btn-ghost text-xs py-1 px-2.5">
                              <HiPencil className="w-3 h-3" /> Edit
                            </Link>
                            <button onClick={() => setConfirmDelete(course)}
                              className="btn-danger text-xs py-1 px-2.5">
                              <HiTrash className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete course?">
            <p className="text-sm mb-1" style={{ color: 'rgba(232,234,240,0.7)' }}>
              You're about to permanently delete <strong>{confirmDelete.title}</strong>.
            </p>
            <p className="text-xs mb-5" style={{ color: 'rgba(232,234,240,0.45)' }}>
              All {confirmDelete.enrolledCount} student enrollment{confirmDelete.enrolledCount !== 1 ? 's' : ''} will also be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={!!deleting} className="btn-danger text-sm disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
