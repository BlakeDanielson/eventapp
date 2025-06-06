'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { AppError, ErrorType, createAppError, logError } from '@/lib/error-handling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: AppError | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Convert the error to our standardized format
    const appError = createAppError(
      ErrorType.SERVER_ERROR,
      error.message || 'Component error occurred',
      {
        details: error.stack,
        code: 'COMPONENT_ERROR',
      }
    );

    return {
      hasError: true,
      error: appError,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = createAppError(
      ErrorType.SERVER_ERROR,
      error.message || 'Component error occurred',
      {
        details: `${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`,
        code: 'COMPONENT_ERROR',
      }
    );

    // Log the error
    logError(appError, 'ErrorBoundary');

    // Call the onError callback if provided
    this.props.onError?.(appError, errorInfo);

    this.setState({
      error: appError,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
                </AlertDescription>
              </Alert>

              {this.props.showDetails && this.state.error?.details && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    <Bug className="inline h-4 w-4 mr-1" />
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-40 text-gray-800">
                    {this.state.error.details}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={this.handleReset}
                  className="flex items-center gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex items-center gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 flex-1"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  If this problem persists, please contact support with the error details above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary context (for functional components)
export function useErrorHandler() {
  return (error: Error, _errorInfo?: ErrorInfo) => {
    // Convert to AppError and log
    const appError = createAppError(
      ErrorType.SERVER_ERROR,
      error.message,
      {
        details: error.stack,
        code: 'MANUAL_ERROR',
      }
    );

    logError(appError, 'useErrorHandler');
    
    // Re-throw to be caught by error boundary
    throw error;
  };
} 