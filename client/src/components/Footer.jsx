import { Link } from 'react-router-dom'
import {
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiGlobe,
  HiAcademicCap,
  HiBookOpen,
  HiUsers,
  HiChartBar
} from 'react-icons/hi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'Browse Courses', to: '/courses', icon: HiBookOpen },
      { name: 'My Courses', to: '/my-enrolled-courses', icon: HiAcademicCap },
      { name: 'Dashboard', to: '/dashboard/admin', icon: HiChartBar },
    ],
    support: [
      { name: 'Help Center', href: '#', icon: HiGlobe },
      { name: 'Contact Us', href: '#', icon: HiMail },
      { name: 'Privacy Policy', href: '#', icon: HiUsers },
    ]
  }

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/islam37/Course-Manages', icon: '🐙' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Twitter', href: '#', icon: '🐦' },
  ]

  return (
    <footer className="w-full border-t" style={{ background: '#0f1624', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c5cfc)' }}>
                  C
                </div>
                <span className="font-display font-bold text-xl text-[#e8eaf0]">CourseFlow</span>
              </Link>

              <p className="text-sm leading-relaxed mb-6 max-w-md" style={{ color: 'rgba(232,234,240,0.7)' }}>
                Empowering learners worldwide with quality education. Discover, enroll, and excel in your learning journey with our comprehensive course management platform.
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(232,234,240,0.6)' }}>
                  <HiMail className="w-4 h-4 flex-shrink-0" />
                  <span>support@courseflow.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(232,234,240,0.6)' }}>
                  <HiPhone className="w-4 h-4 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(232,234,240,0.6)' }}>
                  <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h3 className="font-semibold text-[#e8eaf0] mb-4">Platform</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2 text-sm transition-colors hover:text-[#4f8ef7]"
                      style={{ color: 'rgba(232,234,240,0.6)' }}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h3 className="font-semibold text-[#e8eaf0] mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center gap-2 text-sm transition-colors hover:text-[#4f8ef7]"
                      style={{ color: 'rgba(232,234,240,0.6)' }}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Social links */}
              <div className="mt-6">
                <h4 className="font-medium text-[#e8eaf0] mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110 hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>

            <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(232,234,240,0.5)' }}>
              <span>© {currentYear} CourseFlow. All rights reserved.</span>
              <span className="hidden md:block">•</span>
              <span>Made with ❤️ for learners</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="transition-colors hover:text-[#4f8ef7]"
                style={{ color: 'rgba(232,234,240,0.5)' }}>
                Terms of Service
              </a>
              <a href="#" className="transition-colors hover:text-[#4f8ef7]"
                style={{ color: 'rgba(232,234,240,0.5)' }}>
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-[#4f8ef7]"
                style={{ color: 'rgba(232,234,240,0.5)' }}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}