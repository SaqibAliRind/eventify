import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production you would log this to a service like Sentry
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // If a reset callback is provided, call it
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--color-bg, #0a0c11)',
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem', color: '#ef4444',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 0 1.5rem' }}>
            {this.props.message || 'An unexpected error occurred in this section of the application.'}
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details
              style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
                maxWidth: '540px', textAlign: 'left', color: '#fca5a5', fontSize: '0.78rem',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 4 }}>Error details (dev mode)</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.6rem 1.2rem', borderRadius: '8px',
                background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)',
                color: '#d4af37', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.6rem 1.2rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
              }}
            >
              <Home size={15} /> Go Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
