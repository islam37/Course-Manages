/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize user input to prevent HTML/script injection
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid, errors }
 */
export function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) errors.push('Password must be at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must include uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must include lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must include number')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Trim and validate text field
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} { isValid, error, value }
 */
export function validateTextField(text, minLength = 1, maxLength = 1000) {
  const trimmed = text.trim()
  
  if (trimmed.length < minLength) {
    return { isValid: false, error: `Minimum ${minLength} characters required` }
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Maximum ${maxLength} characters allowed` }
  }
  
  return { isValid: true, value: sanitizeInput(trimmed) }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
