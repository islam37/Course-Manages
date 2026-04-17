import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Footer from './Footer'
import {
  HiHome, HiBookOpen, HiAcademicCap, HiChartBar,
  HiPlusCircle, HiCog, HiUsers, HiClipboardList,
  HiMenu, HiLogout, HiChevronDown
} from 'react-icons/hi'

export default function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navItems = [
    { to: '/', icon: HiHome, label: 'Home', end: true },
    { to: '/courses', icon: HiBookOpen, label: 'Browse Courses' },
    ...(user ? [{ to: '/my-enrolled-courses', icon: HiAcademicCap, label: 'My Courses' }] : []),
  ]

  const adminItems = [
    { to: '/dashboard/admin', icon: HiChartBar, label: 'Dashboard' },
    { to: '/dashboard/add-course', icon: HiPlusCircle, label: 'Add Course' },
    { to: '/dashboard/manage-courses', icon: HiCog, label: 'Manage Courses' },
    { to: '/dashboard/manage-users', icon: HiUsers, label: 'Manage Users' },
    { to: '/dashboard/manage-enrollments', icon: HiClipboardList, label: 'Enrollments' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c5cfc)' }}>
          C
        </div>
        <span className="font-display font-bold text-base text-[#e8eaf0]">
          CourseFlow
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-3">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="px-3 mt-4">
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {user ? (
          <button
            onClick={handleLogout}
            className="nav-link w-full text-left"
            style={{ color: '#ff7b87' }}
          >
            <HiLogout className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <Link to="/login" className="btn-ghost text-center text-sm py-2">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-center text-sm py-2">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen" style={{ background: '#0f1624' }}>

      {/* SIDEBAR (fixed, no scroll movement) */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r h-screen"
        style={{
          background: '#1a2540',
          borderColor: 'rgba(255,255,255,0.08)'
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              className="fixed left-0 top-0 bottom-0 w-56 z-50 lg:hidden flex flex-col border-r"
              style={{
                background: '#1a2540',
                borderColor: 'rgba(255,255,255,0.08)'
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">

        {/* HEADER */}
        <header
          className="flex-shrink-0 h-14 border-b flex items-center px-4 lg:px-6"
          style={{
            background: '#1a2540',
            borderColor: 'rgba(255,255,255,0.08)'
          }}
        >
          <button className="lg:hidden p-1.5" onClick={() => setSidebarOpen(true)}>
            <HiMenu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass"
              >
                <span className="text-sm">{user.name}</span>
                <HiChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-44 rounded-xl border py-1 z-50"
                    style={{
                      background: '#1a2540',
                      borderColor: 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Register
              </Link>
            </div>
          )}
        </header>

        {/* SCROLLABLE CONTENT ONLY */}
        <main className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <Outlet />
          <Footer />
        </main>

      </div>
    </div>
  )
}