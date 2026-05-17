import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ marginBottom: 8, color: '#1F2937' }}>Something went wrong</h2>
          <p style={{ color: '#6B7280', marginBottom: 16 }}>The application encountered an unexpected error.</p>
          <details style={{ marginTop: 16, textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
            <summary style={{ cursor: 'pointer', color: '#185FA5' }}>Error details</summary>
            <pre style={{ marginTop: 8, fontSize: 12, color: '#D85A30', background: '#F3F4F6', padding: 12, borderRadius: 8, overflow: 'auto' }}>
              {this.state.error?.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: '8px 16px',
              background: '#185FA5',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}