import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { PageWrapper } from '../../components/shared'
import { HiArrowLeft, HiBookOpen } from 'react-icons/hi'

const CATEGORIES = ['Development', 'Data Science', 'Design', 'Cloud', 'Business', 'Other']

function CourseForm({ initialData, onSubmit, loading, title }) {
  const [form, setForm] = useState({
    title: '', shortDescription: '', description: '',
    imageURL: '', category: 'Development', duration: '',
    totalSeats: 10, instructorEmail: '', instructorName: '', priceBDT: 0,
    ...initialData
  })

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.shortDescription || !form.description || !form.duration || !form.instructorEmail || !form.instructorName) {
      toast.error('Please fill in all required fields')
      return
    }
    onSubmit(form)
  }

  const fieldClass = "input-field"
  const labelClass = "block text-xs mb-1.5"
  const labelStyle = { color: 'rgba(232,234,240,0.6)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Course title *</label>
            <input value={form.title} onChange={set('title')} required
              placeholder="e.g. React Advanced Patterns" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Short description * <span style={labelStyle}>(max 200 chars)</span></label>
            <input value={form.shortDescription} onChange={set('shortDescription')} required maxLength={200}
              placeholder="A brief summary shown on the course card" className={fieldClass} />
            <p className="text-[11px] mt-1" style={{ color: 'rgba(232,234,240,0.3)' }}>{form.shortDescription.length}/200</p>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Full description *</label>
            <textarea value={form.description} onChange={set('description')} required rows={5}
              placeholder="Detailed course description, what students will learn..." className={fieldClass}
              style={{ resize: 'vertical', minHeight: '120px' }} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Image URL</label>
            <input value={form.imageURL} onChange={set('imageURL')}
              placeholder="https://example.com/image.jpg" className={fieldClass} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Category *</label>
            <select value={form.category} onChange={set('category')} className={fieldClass}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a2540' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Duration *</label>
            <input value={form.duration} onChange={set('duration')} required
              placeholder="e.g. 8 weeks" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Total seats *</label>
            <input type="number" value={form.totalSeats} onChange={set('totalSeats')}
              min={1} max={100} className={fieldClass} />
            <p className="text-[11px] mt-1" style={{ color: 'rgba(232,234,240,0.35)' }}>
              Max seats for this course (1–100)
            </p>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Course Price (BDT)</label>
            <input type="number" value={form.priceBDT} onChange={set('priceBDT')}
              min={0} className={fieldClass} placeholder="0" />
            <p className="text-[11px] mt-1" style={{ color: 'rgba(232,234,240,0.35)' }}>
              Price in Bangladeshi Taka (leave as 0 for free course)
            </p>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Instructor name *</label>
            <input value={form.instructorName} onChange={set('instructorName')} required
              placeholder="Dr. Jane Smith" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Instructor email *</label>
            <input type="email" value={form.instructorEmail} onChange={set('instructorEmail')} required
              placeholder="instructor@example.com" className={fieldClass} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          <HiBookOpen className="w-4 h-4" />
          {loading ? 'Saving...' : title}
        </button>
      </div>
    </form>
  )
}

export function AddCourse() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => { document.title = 'Add Course — CourseFlow' }, [])

  const handleSubmit = async (form) => {
    setLoading(true)
    try {
      await api.post('/courses', form)
      toast.success('Course created successfully!')
      navigate('/dashboard/manage-courses')
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create course'
      const errorDetails = err.response?.data?.errors
      
      console.error('Course creation failed:', {
        status: err.response?.status,
        message: errorMessage,
        errors: errorDetails,
        fullError: err
      })
      
      if (errorDetails && Array.isArray(errorDetails)) {
        toast.error(errorDetails.join(', '))
      } else {
        toast.error(errorMessage)
      }
    } finally { setLoading(false) }
  }

  return (
    <PageWrapper>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors hover:text-accent"
        style={{ color: 'rgba(232,234,240,0.55)' }}>
        <HiArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1">Add New Course</h1>
        <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>Fill in the details to create a new course</p>
      </div>
      <div className="card p-6">
        <CourseForm title="Create Course" loading={loading} onSubmit={handleSubmit} />
      </div>
    </PageWrapper>
  )
}

export function EditCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Edit Course — CourseFlow'
    api.get(`/courses/${id}`)
      .then(res => setCourse(res.data))
      .catch(() => { toast.error('Course not found'); navigate('/dashboard/manage-courses') })
      .finally(() => setPageLoading(false))
  }, [id])

  const handleSubmit = async (form) => {
    setSaving(true)
    try {
      await api.put(`/courses/${id}`, form)
      toast.success('Course updated!')
      navigate('/dashboard/manage-courses')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  if (pageLoading) return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="skeleton h-8 rounded w-48" />
        <div className="card p-6 space-y-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
        </div>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors hover:text-accent"
        style={{ color: 'rgba(232,234,240,0.55)' }}>
        <HiArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1">Edit Course</h1>
        <p className="text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>{course?.title}</p>
      </div>
      <div className="card p-6">
        {course && <CourseForm title="Save Changes" loading={saving} onSubmit={handleSubmit} initialData={course} />}
      </div>
    </PageWrapper>
  )
}

export default AddCourse
