import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useFetch } from '../../hooks/useApi'
import { TableSkeleton, EmptyState, Modal, PageWrapper } from '../../components/shared'
import { useAuth } from '../../context/AuthContext'
import { HiShieldCheck, HiUser } from 'react-icons/hi'

export default function ManageUsers() {
  const { user: currentUser } = useAuth()
  const { data, loading, refetch } = useFetch('/admin/users?limit=50')
  const [updating, setUpdating] = useState(null)
  const [confirmRole, setConfirmRole] = useState(null)

  useEffect(() => { document.title = 'Manage Users — CourseFlow' }, [])

  const handleRoleChange = async () => {
    if (!confirmRole) return
    const { userId, newRole } = confirmRole
    setUpdating(userId)
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      toast.success(`User role updated to ${newRole}`)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
      setConfirmRole(null)
    }
  }

  const users = data?.users || []

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1">Manage Users</h1>
        <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>
          {data?.total ?? 0} registered user{data?.total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="card overflow-hidden">
        {loading ? <TableSkeleton rows={6} cols={5} /> : users.length === 0 ? (
          <EmptyState emoji="👥" title="No users yet" description="Users will appear here once they register." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {['User', 'Email', 'Role', 'Enrollments', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'rgba(232,234,240,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u, i) => (
                    <motion.tr key={u._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: 'rgba(79,142,247,0.2)', color: '#4f8ef7' }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium max-w-[130px] truncate">{u.name}</span>
                          {u._id === currentUser?._id && (
                            <span className="badge text-[9px] px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(232,234,240,0.4)' }}>you</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs max-w-[180px] truncate" style={{ color: 'rgba(232,234,240,0.5)' }}>
                        {u.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-[10px] ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center" style={{ color: 'rgba(232,234,240,0.6)' }}>
                        {u.enrollmentCount}/3
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: 'rgba(232,234,240,0.4)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        {u._id === currentUser?._id ? (
                          <span className="text-xs" style={{ color: 'rgba(232,234,240,0.25)' }}>—</span>
                        ) : (
                          <button
                            onClick={() => setConfirmRole({ userId: u._id, name: u.name, currentRole: u.role, newRole: u.role === 'admin' ? 'user' : 'admin' })}
                            disabled={updating === u._id}
                            className={`text-xs py-1 px-3 rounded-lg border transition-all disabled:opacity-40 flex items-center gap-1.5 ${u.role === 'admin' ? 'btn-danger' : 'btn-ghost'}`}>
                            {updating === u._id ? '...' : u.role === 'admin' ? (
                              <><HiUser className="w-3 h-3" /> Remove Admin</>
                            ) : (
                              <><HiShieldCheck className="w-3 h-3" /> Make Admin</>
                            )}
                          </button>
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
        {confirmRole && (
          <Modal isOpen={!!confirmRole} onClose={() => setConfirmRole(null)}
            title={`${confirmRole.newRole === 'admin' ? 'Grant' : 'Revoke'} admin access?`}>
            <p className="text-sm mb-5" style={{ color: 'rgba(232,234,240,0.65)' }}>
              {confirmRole.newRole === 'admin'
                ? `${confirmRole.name} will gain full admin access to manage courses, users and enrollments.`
                : `${confirmRole.name} will lose admin access and become a regular user.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmRole(null)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleRoleChange} className={`text-sm ${confirmRole.newRole === 'admin' ? 'btn-primary' : 'btn-danger'}`}>
                Confirm
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
