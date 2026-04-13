import { Component } from 'react'
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f1624' }}>
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,123,135,0.12)' }}>
                <HiExclamationCircle className="w-8 h-8" style={{ color: '#ff7b87' }} />
              </div>
            </div>
            <h1 className="font-display font-bold text-xl mb-2">Oops! Something went wrong</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(232,234,240,0.55)' }}>
              We encountered an unexpected error. Try refreshing the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/20">
                <summary className="cursor-pointer font-mono mb-2" style={{ color: '#ff7b87' }}>
                  Error Details (Development Only)
                </summary>
                <pre className="overflow-auto text-[10px]" style={{ color: 'rgba(232,234,240,0.7)' }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary flex items-center justify-center gap-2">
                <HiRefresh className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
