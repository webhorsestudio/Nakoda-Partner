import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div 
          className="min-h-screen bg-white flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <Card className="border border-slate-200 max-w-md w-full">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg font-medium text-slate-900">
                Component Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-slate-600">
                Something went wrong with this component. Please try refreshing the page.
              </p>
              
              <Button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Try to reload the component"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
              
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  Error Details
                </summary>
                <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 font-mono">
                  <p><strong>Error:</strong> {this.state.error?.message}</p>
                  <p><strong>Stack:</strong></p>
                  <pre className="whitespace-pre-wrap text-xs">
                    {this.state.error?.stack}
                  </pre>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
