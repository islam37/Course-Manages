import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFetch } from '../../hooks/useApi'
import { StatCard, StatSkeleton, PageWrapper } from '../../components/shared'
import { HiBookOpen, HiUsers, HiAcademicCap, HiTrendingUp } from 'react-icons/hi'

export default function AdminDashboard() {
  const { data, loading } = useFetch('/admin/dashboard')

  useEffect(() => { document.title = 'Admin Dashboard — CourseFlow' }, [])

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1">Dashboard</h1>
        <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />) : (
          <>
            <StatCard label="Total courses" value={data?.totalCourses ?? '—'} sub="Available on platform"
              color="#4f8ef7" icon={HiBookOpen} />
            <StatCard label="Registered users" value={data?.totalUsers ?? '—'} sub="All time"
              color="#7c5cfc" icon={HiUsers} />
            <StatCard label="Active enrollments" value={data?.activeEnrollments ?? '—'} sub="Currently active"
              color="#1ecb8a" icon={HiAcademicCap} />
            <StatCard label="Avg seat fill" value={data ? `${data.avgSeatFill}%` : '—'} sub="Across all courses"
              color="#f5a623" icon={HiTrendingUp} />
          </>
        )}
      </div>

      {/* Top courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-base mb-4">Top courses by enrollment</h2>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.topCourses?.map((course, i) => {
                const pct = Math.round((course.enrolledCount / course.totalSeats) * 100)
                return (
                  <motion.div key={course._id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3">
                    <span className="text-xs w-4 flex-shrink-0 text-center font-bold" style={{ color: 'rgba(232,234,240,0.35)' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium truncate pr-2">{course.title}</p>
                        <span className="text-xs flex-shrink-0" style={{ color: 'rgba(232,234,240,0.5)' }}>
                          {course.enrolledCount}/{course.totalSeats}
                        </span>
                      </div>
                      <div className="seats-bar">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 90 ? '#ff7b87' : pct >= 70 ? '#f5a623' : '#4f8ef7'
                          }} />
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0 font-semibold w-10 text-right"
                      style={{ color: pct >= 90 ? '#ff7b87' : pct >= 70 ? '#f5a623' : '#4f8ef7' }}>
                      {pct}%
                    </span>
                  </motion.div>
                )
              })}
              {(!data?.topCourses || data.topCourses.length === 0) && (
                <p className="text-sm text-center py-6" style={{ color: 'rgba(232,234,240,0.4)' }}>No courses yet</p>
              )}
            </div>
          )}
        </div>

        {/* Quick stats panel */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-base mb-4">Platform health</h2>
          <div className="space-y-4">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />) : (
              <>
                {[
                  { label: 'Total enrollments (all time)', value: data?.totalEnrollments ?? 0, color: '#4f8ef7' },
                  { label: 'Active enrollments', value: data?.activeEnrollments ?? 0, color: '#1ecb8a' },
                  { label: 'Dropped enrollments', value: (data?.totalEnrollments ?? 0) - (data?.activeEnrollments ?? 0), color: '#f5a623' },
                  { label: 'Average seat fill rate', value: `${data?.avgSeatFill ?? 0}%`, color: '#a98dff' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-sm" style={{ color: 'rgba(232,234,240,0.6)' }}>{label}</p>
                    <p className="font-display font-bold text-lg" style={{ color }}>{value}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
