import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Suppress harmless Firebase COOP policy warnings
const originalWarn = console.warn
const originalError = console.error
const originalLog = console.log

const isCOOPMessage = (msg) => msg?.toString?.()?.includes?.('Cross-Origin-Opener-Policy')

console.warn = function(...args) {
  if (!args.some(isCOOPMessage)) originalWarn.apply(console, args)
}
console.error = function(...args) {
  if (!args.some(isCOOPMessage)) originalError.apply(console, args)
}
console.log = function(...args) {
  if (!args.some(isCOOPMessage)) originalLog.apply(console, args)
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
