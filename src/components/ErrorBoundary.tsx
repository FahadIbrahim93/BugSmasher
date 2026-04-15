import * as React from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const BaseErrorBoundary = React.Component as unknown as new (...args: any[]) => any;

export class ErrorBoundary extends BaseErrorBoundary {
  public state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#ff4444',
            fontFamily: "'Orbitron', monospace",
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>SYSTEM FAILURE</h1>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: 'transparent',
              border: '2px solid #ff4444',
              color: '#ff4444',
              padding: '10px 30px',
              fontFamily: "'Orbitron', monospace",
              cursor: 'pointer',
              fontSize: '14px',
              letterSpacing: '2px',
            }}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
