import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Suppress harmless warnings and messages
const originalWarn = console.warn
const originalError = console.error
const originalLog = console.log

const shouldSuppress = (msg) => {
  const str = msg?.toString?.() || ''
  return (
    str.includes('Cross-Origin-Opener-Policy') ||
    str.includes('Download the React DevTools') ||
    str.includes('react-devtools')
  )
}

console.warn = function(...args) {
  if (!args.some(shouldSuppress)) originalWarn.apply(console, args)
}
console.error = function(...args) {
  if (!args.some(shouldSuppress)) originalError.apply(console, args)
}
console.log = function(...args) {
  if (!args.some(shouldSuppress)) originalLog.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a2540',
              color: '#e8eaf0',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#1ecb8a', secondary: '#1a2540' } },
            error: { iconTheme: { primary: '#ff7b87', secondary: '#1a2540' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
