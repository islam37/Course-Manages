import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => { document.title = '404 — Page Not Found' }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0f1624' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="text-center max-w-sm">

        {/* Glitchy 404 */}
        <div className="relative mb-6 inline-block">
          <p className="font-display font-bold select-none"
            style={{ fontSize: '96px', lineHeight: 1, color: 'rgba(79,142,247,0.15)', letterSpacing: '-4px' }}>
            404
          </p>
          <p className="font-display font-bold absolute inset-0 flex items-center justify-center"
            style={{ fontSize: '96px', lineHeight: 1, color: 'rgba(232,234,240,0.06)', letterSpacing: '-4px', transform: 'translate(2px, 2px)' }}>
            404
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(124,92,252,0.2))', border: '0.5px solid rgba(79,142,247,0.3)' }}>
          <span className="text-2xl">🔭</span>
        </div>

        <h1 className="font-display font-bold text-2xl mb-2">Page not found</h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(232,234,240,0.5)' }}>
          The page you're looking for doesn't exist or has been moved somewhere else.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
            ← Go back
          </button>
          <Link to="/" className="btn-primary text-sm">
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
