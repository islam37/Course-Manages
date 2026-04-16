import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useApi'
import { CourseCard, CardSkeleton, PageWrapper } from '../components/shared'
import { HiArrowRight, HiSparkles, HiLightningBolt } from 'react-icons/hi'

export default function Home() {
  const { user } = useAuth()
  const { data: popular, loading: popLoading } = useFetch('/courses/popular')
  const { data: latest, loading: latLoading } = useFetch('/courses/latest')

  useEffect(() => { document.title = 'CourseFlow — Learn Without Limits' }, [])

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl mb-10 px-8 py-16 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(124,92,252,0.12) 50%, rgba(30,203,138,0.08) 100%)', border: '0.5px solid rgba(255,255,255,0.1)' }}>

        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #7c5cfc, transparent)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span className="inline-flex items-center gap-1.5 badge badge-blue mb-5 py-1 px-3">
            <HiSparkles className="w-3 h-3" /> Online Learning Platform
          </span>
          <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4 leading-tight">
            Learn skills that<br />
            <span style={{ background: 'linear-gradient(90deg, #4f8ef7, #7c5cfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              shape your future
            </span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-8" style={{ color: 'rgba(232,234,240,0.65)' }}>
            Expert-led courses across development, data science, design and more.
            Enroll in up to 3 courses and learn at your own pace.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/courses" className="btn-primary text-sm px-6 py-2.5">
              <HiLightningBolt className="w-4 h-4" />
              Explore Courses
            </Link>
            {!user && (
              <Link to="/register" className="btn-ghost text-sm px-6 py-2.5">
                Create Free Account <HiArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center justify-center gap-10 mt-12 flex-wrap">
          {[['24+', 'Courses'], ['500+', 'Students'], ['10', 'Seats/Course'], ['3', 'Max Enrollments']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-display font-bold text-2xl">{val}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,240,0.5)' }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Popular courses */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-xl mb-0.5">Most popular</h2>
            <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>Highest enrolled courses on the platform</p>
          </div>
          <Link to="/courses" className="btn-ghost text-sm py-1.5">
            View all <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popLoading
            ? Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : popular?.slice(0, 3).map((course, i) => (
              <CourseCard key={course._id} course={course} index={i}
                actionSlot={
                  <Link to={`/courses/${course._id}`} className="btn-ghost text-xs py-1.5 justify-center w-full">
                    View Details <HiArrowRight className="w-3 h-3" />
                  </Link>
                }
              />
            ))
          }
        </div>
      </section>

      {/* Latest courses */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-xl mb-0.5">Recently added</h2>
            <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>Fresh content just for you</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latLoading
            ? Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : latest?.slice(0, 3).map((course, i) => (
              <CourseCard key={course._id} course={course} index={i}
                actionSlot={
                  <Link to={`/courses/${course._id}`} className="btn-ghost text-xs py-1.5 justify-center w-full">
                    View Details <HiArrowRight className="w-3 h-3" />
                  </Link>
                }
              />
            ))
          }
        </div>
      </section>
    </PageWrapper>
  )
}
