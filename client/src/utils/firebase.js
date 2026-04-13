import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzz26-n0xzUAoG8snsAP3Chqb3oYL1lw4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edu-manage-uni.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edu-manage-uni",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edu-manage-uni.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "80421936037",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:80421936037:web:b3a4707eab7d442348a64c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Y5Q69Y234E"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Configure Google Auth Provider with proper scopes
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')
// Restrict API key in Firebase Console: Enable only required APIs (Authentication)

export default app
