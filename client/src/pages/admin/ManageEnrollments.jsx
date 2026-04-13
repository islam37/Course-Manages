import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useFetch } from '../../hooks/useApi'
import { TableSkeleton, EmptyState, Modal, PageWrapper } from '../../components/shared'
import { HiTrash, HiSearch } from 'react-icons/hi'

export default function ManageEnrollments() {
  const { data, loading, refetch } = useFetch('/admin/all-enrollments?limit=50')
  const [removing, setRemoving] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { document.title = 'Manage Enrollments — CourseFlow' }, [])

  const handleRemove = async () => {
    if (!confirmRemove) return
    setRemoving(confirmRemove._id)
    try {
      await api.delete(`/admin/enrollments/${confirmRemove._id}`)
      toast.success('Enrollment removed')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove')
    } finally {
      setRemoving(null)
      setConfirmRemove(null)
    }
  }

  const enrollments = (data?.enrollments || []).filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.userId?.name?.toLowerCase().includes(q) ||
      e.userId?.email?.toLowerCase().includes(q) ||
      e.courseId?.title?.toLowerCase().includes(q)
    )
  })

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1">All Enrollments</h1>
          <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>
            {data?.total ?? 0} total enrollment{data?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(232,234,240,0.35)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user or course..."
            className="input-field pl-9 w-64" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <TableSkeleton rows={6} cols={5} /> : enrollments.length === 0 ? (
          <EmptyState emoji="📋" title="No enrollments found"
            description={search ? 'Try a different search term.' : 'No enrollments have been made yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {['Student', 'Course', 'Enrolled', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'rgba(232,234,240,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {enrollments.map((enrollment, i) => (
                    <motion.tr key={enrollment._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {enrollment.userId?.photoURL ? (
                            <img src={enrollment.userId.photoURL} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: 'rgba(79,142,247,0.2)', color: '#4f8ef7' }}>
                              {enrollment.userId?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{enrollment.userId?.name || enrollment.userName}</p>
                            <p className="text-xs" style={{ color: 'rgba(232,234,240,0.4)' }}>
                              {enrollment.userId?.email || enrollment.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm max-w-[200px] truncate">
                          {enrollment.courseId?.title || enrollment.courseTitle}
                        </p>
                        {enrollment.courseId?.instructorName && (
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,240,0.4)' }}>
                            {enrollment.courseId.instructorName}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: 'rgba(232,234,240,0.5)' }}>
                        {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-[10px] ${enrollment.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {enrollment.status === 'active' ? (
                          <button onClick={() => setConfirmRemove(enrollment)}
                            disabled={removing === enrollment._id}
                            className="btn-danger text-xs py-1 px-2.5 disabled:opacity-40">
                            <HiTrash className="w-3 h-3" />
                            {removing === enrollment._id ? '...' : 'Remove'}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: 'rgba(232,234,240,0.25)' }}>Dropped</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmRemove && (
          <Modal isOpen={!!confirmRemove} onClose={() => setConfirmRemove(null)} title="Remove enrollment?">
            <p className="text-sm mb-1" style={{ color: 'rgba(232,234,240,0.7)' }}>
              Remove <strong>{confirmRemove.userId?.name || confirmRemove.userName}</strong>'s enrollment from{' '}
              <strong>{confirmRemove.courseId?.title || confirmRemove.courseTitle}</strong>?
            </p>
            <p className="text-xs mb-5" style={{ color: 'rgba(232,234,240,0.45)' }}>
              This will free up a seat in the course and remove one of the student's enrollment slots.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmRemove(null)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleRemove} disabled={!!removing} className="btn-danger text-sm disabled:opacity-50">
                {removing ? 'Removing...' : 'Remove Enrollment'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
