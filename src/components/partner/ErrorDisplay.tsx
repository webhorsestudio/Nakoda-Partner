import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  redirectMessage?: string;
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  redirectMessage = "Redirecting to login..." 
}: ErrorDisplayProps) {
  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
      aria-label="Error occurred"
    >
      <Card className="border border-slate-200 max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg font-medium text-slate-900">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-slate-600" role="status">{error}</p>
          
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Try to resolve the error again"
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          )}
          
          <p className="text-sm text-slate-500" role="status">{redirectMessage}</p>
        </CardContent>
      </Card>
    </div>
  );
}
