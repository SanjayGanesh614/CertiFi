import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>An unexpected error occurred in the application.</p>

            <div className="error-details">
              <h3>Error Details:</h3>
              <pre className="error-message">
                {this.state.error && this.state.error.toString()}
              </pre>

              {process.env.NODE_ENV === 'development' && (
                <details className="error-stack">
                  <summary>Stack Trace (Development Only)</summary>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>

            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                🔄 Reload Page
              </button>

              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="btn-secondary"
              >
                ↩️ Try Again
              </button>
            </div>

            <div className="error-support">
              <p>If this error persists, please:</p>
              <ul>
                <li>Check your internet connection</li>
                <li>Ensure MetaMask is installed and connected</li>
                <li>Try switching to 0G Testnet</li>
                <li>Clear browser cache and reload</li>
                <li>Contact support with the error details above</li>
              </ul>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }

            .error-container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              max-width: 800px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }

            .error-container h2 {
              color: #e74c3c;
              margin-bottom: 20px;
              font-size: 2.5rem;
            }

            .error-container p {
              color: #666;
              margin-bottom: 30px;
              font-size: 1.1rem;
            }

            .error-details {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }

            .error-details h3 {
              color: #333;
              margin-bottom: 15px;
              font-size: 1.2rem;
            }

            .error-message {
              background: #ffebee;
              color: #c62828;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #e74c3c;
              overflow-x: auto;
              font-family: 'Courier New', monospace;
              font-size: 0.9rem;
            }

            .error-stack {
              margin-top: 15px;
            }

            .error-stack summary {
              cursor: pointer;
              color: #666;
              padding: 10px;
              background: #e9ecef;
              border-radius: 4px;
            }

            .error-stack pre {
              background: #f1f3f4;
              padding: 15px;
              border-radius: 6px;
              overflow-x: auto;
              font-family: 'Courier New', monospace;
              font-size: 0.8rem;
              color: #333;
              margin-top: 10px;
            }

            .error-actions {
              display: flex;
              gap: 15px;
              justify-content: center;
              margin: 30px 0;
            }

            .btn-primary, .btn-secondary {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 8px;
            }

            .btn-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            }

            .btn-secondary {
              background: #6c757d;
              color: white;
            }

            .btn-secondary:hover {
              background: #5a6268;
              transform: translateY(-2px);
            }

            .error-support {
              background: #e8f4f8;
              border-radius: 8px;
              padding: 20px;
              text-align: left;
              margin-top: 20px;
            }

            .error-support p {
              color: #2c3e50;
              font-weight: 600;
              margin-bottom: 15px;
            }

            .error-support ul {
              color: #34495e;
              margin: 0;
              padding-left: 20px;
            }

            .error-support li {
              margin-bottom: 8px;
              line-height: 1.5;
            }

            @media (max-width: 768px) {
              .error-container {
                padding: 20px;
                margin: 10px;
              }

              .error-container h2 {
                font-size: 2rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .btn-primary, .btn-secondary {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;