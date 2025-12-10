import { Component, ErrorInfo, ReactNode } from 'react'
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <div className="text-center">
              <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-slate-600 mb-6">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
              
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-red-800 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

