import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="page">
          <div className="page-header">
            <h1>Algo deu errado</h1>
          </div>
          <section className="card admin-error-box" style={{ maxWidth: '40rem' }}>
            <p><strong>Ocorreu um erro inesperado na aplicação.</strong></p>
            {this.state.error && (
              <pre className="code-block" style={{ marginTop: 'var(--space-3)' }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              className="pill subtle"
              onClick={this.handleReset}
              style={{ marginTop: 'var(--space-4)' }}
            >
              Tentar novamente
            </button>
          </section>
        </div>
      )
    }

    return this.props.children
  }
}
