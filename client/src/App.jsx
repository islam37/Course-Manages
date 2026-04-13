import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import CourseDetails from './pages/CourseDetails'
import MyEnrolledCourses from './pages/MyEnrolledCourses'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddCourse from './pages/admin/AddCourse'
import EditCourse from './pages/admin/EditCourse'
import ManageCourses from './pages/admin/ManageCourses'
import ManageUsers from './pages/admin/ManageUsers'
import ManageEnrollments from './pages/admin/ManageEnrollments'
import NotFound from './pages/NotFound'

function AppContent() {
  const location = useLocation()
  const { loading } = useAuth()

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0f1624' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c5cfc)' }}>C</div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{ animation: `bounce 1s ${i * 0.15}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="my-enrolled-courses" element={<MyEnrolledCourses />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="dashboard/admin" element={<AdminDashboard />} />
            <Route path="dashboard/add-course" element={<AddCourse />} />
            <Route path="dashboard/edit-course/:id" element={<EditCourse />} />
            <Route path="dashboard/manage-courses" element={<ManageCourses />} />
            <Route path="dashboard/manage-users" element={<ManageUsers />} />
            <Route path="dashboard/manage-enrollments" element={<ManageEnrollments />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}
