import { memo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiClock, HiUser, HiUsers, HiCurrencyDollar } from 'react-icons/hi'

// ── Page wrapper with fade-slide animation ──────────────────────────────────
export const PageWrapper = memo(function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`p-5 lg:p-7 ${className}`}>
      {children}
    </motion.div>
  )
})

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

// ── Course Card ──────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  'Development': { emoji: '⚛️', color: 'rgba(79,142,247,0.12)', accent: '#4f8ef7' },
  'Data Science': { emoji: '🐍', color: 'rgba(30,203,138,0.12)', accent: '#1ecb8a' },
  'Design': { emoji: '🎨', color: 'rgba(230,69,83,0.12)', accent: '#ff7b87' },
  'Cloud': { emoji: '☁️', color: 'rgba(245,166,35,0.12)', accent: '#f5a623' },
  'Business': { emoji: '💼', color: 'rgba(124,92,252,0.12)', accent: '#a98dff' },
  'Other': { emoji: '📚', color: 'rgba(255,255,255,0.06)', accent: '#e8eaf0' },
}

const CourseCardComponent = ({ course, actionSlot, index = 0 }) => {
  const cfg = CATEGORY_CONFIG[course.category] || CATEGORY_CONFIG['Other']
  const fillPct = Math.round(((course.totalSeats - course.availableSeats) / course.totalSeats) * 100)
  const isFull = course.availableSeats === 0
  const isAlmostFull = !isFull && fillPct >= 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="card overflow-hidden flex flex-col group hover:border-white/20 transition-all duration-200"
      style={{ transform: 'translateZ(0)' }}>

      {/* Image / header */}
      <div className="h-28 flex items-center justify-center text-4xl relative overflow-hidden"
        style={{ background: course.imageURL ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${course.imageURL}')` : cfg.color, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {!course.imageURL && <span style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{cfg.emoji}</span>}
        <span className="badge absolute top-3 left-3 text-[10px]"
          style={{ background: 'rgba(0,0,0,0.35)', color: '#e8eaf0', backdropFilter: 'blur(4px)' }}>
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/courses/${course._id}`}>
          <h3 className="font-display font-semibold text-sm leading-snug mb-1.5 hover:text-accent transition-colors line-clamp-2">
            {course.title}
          </h3>
        </Link>
        <p className="text-xs leading-relaxed mb-3 flex-1 line-clamp-2" style={{ color: 'rgba(232,234,240,0.55)' }}>
          {course.shortDescription}
        </p>

        <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: 'rgba(232,234,240,0.45)' }}>
          <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{course.duration}</span>
          <span className="flex items-center gap-1"><HiUser className="w-3 h-3" />{course.instructorName}</span>
        </div>

        {/* Price display */}
        {course.priceBDT !== undefined && (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#4f8ef7' }}>
            <HiCurrencyDollar className="w-3 h-3" />
            {course.priceBDT > 0 ? `${course.priceBDT} BDT` : 'Free'}
          </div>
        )}

        {/* Seats bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(232,234,240,0.45)' }}>
              <HiUsers className="w-3 h-3" />
              {course.availableSeats}/{course.totalSeats} seats left
            </span>
            {isFull && <span className="badge badge-red text-[10px]">Full</span>}
            {isAlmostFull && <span className="badge badge-amber text-[10px]">Almost full</span>}
          </div>
          <div className="seats-bar">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fillPct}%`,
                background: isFull ? '#ff7b87' : isAlmostFull ? '#f5a623' : cfg.accent
              }} />
          </div>
        </div>

        {/* Action slot */}
        {actionSlot}
      </div>
    </motion.div>
  )
}

CourseCardComponent.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    shortDescription: PropTypes.string,
    duration: PropTypes.string.isRequired,
    instructorName: PropTypes.string.isRequired,
    availableSeats: PropTypes.number.isRequired,
    totalSeats: PropTypes.number.isRequired,
  }).isRequired,
  actionSlot: PropTypes.node,
  index: PropTypes.number,
}

export const CourseCard = memo(CourseCardComponent)

// ── Modal ────────────────────────────────────────────────────────────────────
const ModalComponent = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }}
        onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
        className="relative w-full max-w-md rounded-2xl p-6 border z-10"
        style={{ background: '#1a2540', borderColor: 'rgba(255,255,255,0.12)' }}>
        {title && (
          <h2 className="font-display font-semibold text-base mb-4">{title}</h2>
        )}
        {children}
      </motion.div>
    </div>
  )
}

ModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
}

export const Modal = memo(ModalComponent)

// ── Skeleton loaders ─────────────────────────────────────────────────────────
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-28 skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-5/6" />
        <div className="skeleton h-2 rounded-full w-full mt-3" />
        <div className="skeleton h-8 rounded-lg w-full mt-2" />
      </div>
    </div>
  )
})

const TableSkeletonComponent = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-4 rounded flex-1" style={{ maxWidth: j === 0 ? '200px' : undefined }} />
          ))}
        </div>
      ))}
    </div>
  )
}

TableSkeletonComponent.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
}

export const TableSkeleton = memo(TableSkeletonComponent)

export const StatSkeleton = memo(function StatSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton h-3 rounded w-24 mb-3" />
      <div className="skeleton h-8 rounded w-16 mb-2" />
      <div className="skeleton h-3 rounded w-32" />
    </div>
  )
})

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyStateComponent = ({ emoji = '📭', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-display font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm max-w-xs mb-5" style={{ color: 'rgba(232,234,240,0.5)' }}>{description}</p>
      {action}
    </div>
  )
}

EmptyStateComponent.propTypes = {
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node,
}

export const EmptyState = memo(EmptyStateComponent)

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCardComponent = ({ label, value, sub, color = '#e8eaf0', icon: Icon }) => {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs" style={{ color: 'rgba(232,234,240,0.5)' }}>{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>
      <p className="font-display font-bold text-3xl mb-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(232,234,240,0.45)' }}>{sub}</p>}
    </div>
  )
}

StatCardComponent.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.elementType,
}

export const StatCard = memo(StatCardComponent)
