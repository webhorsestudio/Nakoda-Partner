import React, { useState } from 'react';
import { PaymentLogger, PaymentLogEntry } from '@/utils/paymentLogger';
import { paymentErrorExamples } from '@/utils/paymentErrorExamples';

interface ErrorAnalysisProps {
  className?: string;
}

export default function ErrorAnalysis({ className = '' }: ErrorAnalysisProps) {
  const [selectedErrorType, setSelectedErrorType] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    totalErrors: number;
    errorTypes: Record<string, number>;
    commonPatterns: string[];
    recommendations: string[];
    recentErrors: Array<{
      message: string;
      timestamp: string;
      data?: {
        error?: {
          name?: string;
          message?: string;
        };
        hasSessionExpired?: boolean;
        context?: string;
      };
    }>;
  } | null>(null);

  const analyzeErrors = () => {
    const errorLogs = PaymentLogger.getErrorLogs();
    const analysis = {
      totalErrors: errorLogs.length,
      errorTypes: {} as Record<string, number>,
      commonPatterns: [] as string[],
      recommendations: [] as string[],
      recentErrors: errorLogs.slice(0, 10)
    };

    // Analyze error types
    errorLogs.forEach(log => {
      const errorData = log.data as Record<string, unknown> | undefined;
      const error = errorData?.error as Record<string, unknown> | undefined;
      const errorType = (error?.name as string) || 'Unknown';
      analysis.errorTypes[errorType] = (analysis.errorTypes[errorType] || 0) + 1;
    });

    // Check for common patterns
    const sessionExpiredCount = errorLogs.filter(log => 
      log.message.includes('Session Expired') || 
      (log.data as Record<string, unknown>)?.hasSessionExpired === true
    ).length;

    const networkErrorCount = errorLogs.filter(log => {
      const errorData = log.data as Record<string, unknown> | undefined;
      const error = errorData?.error as Record<string, unknown> | undefined;
      return error?.name === 'TypeError' && 
             typeof error?.message === 'string' && 
             error.message.includes('Failed to fetch');
    }).length;

    const validationErrorCount = errorLogs.filter(log => {
      const errorData = log.data as Record<string, unknown> | undefined;
      return typeof errorData?.context === 'string' && 
             errorData.context.includes('validation');
    }).length;

    if (sessionExpiredCount > 0) {
      analysis.commonPatterns.push(`Session Expired errors: ${sessionExpiredCount}`);
      analysis.recommendations.push('Check timestamp generation and system clock synchronization');
      analysis.recommendations.push('Verify merchant credentials and signature generation');
    }

    if (networkErrorCount > 0) {
      analysis.commonPatterns.push(`Network errors: ${networkErrorCount}`);
      analysis.recommendations.push('Check network connectivity and payment gateway availability');
      analysis.recommendations.push('Verify payment gateway URLs and endpoints');
    }

    if (validationErrorCount > 0) {
      analysis.commonPatterns.push(`Validation errors: ${validationErrorCount}`);
      analysis.recommendations.push('Review input validation and data sanitization');
    }

    setAnalysisResult(analysis);
  };

  const loadExampleError = (errorType: string) => {
    const example = paymentErrorExamples[errorType as keyof typeof paymentErrorExamples];
    if (example) {
      // Clear existing logs and load example
      PaymentLogger.clearLogs();
      
      if (Array.isArray(example)) {
        example.forEach(log => PaymentLogger.log(log));
      } else if (typeof example === 'object' && example !== null) {
        // Handle object with multiple log entries (request, response, error, etc.)
        Object.values(example).forEach(logEntry => {
          if (logEntry && typeof logEntry === 'object' && 'type' in logEntry && 'level' in logEntry && 'message' in logEntry) {
            PaymentLogger.log(logEntry as Omit<PaymentLogEntry, 'timestamp'>);
          }
        });
      }
      
      setSelectedErrorType(errorType);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Error Analysis</h3>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Load Example Error</label>
            <select
              value={selectedErrorType}
              onChange={(e) => loadExampleError(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select example error</option>
              <option value="sessionExpired">Session Expired</option>
              <option value="networkError">Network Error</option>
              <option value="validationError">Validation Error</option>
              <option value="signatureError">Signature Error</option>
              <option value="successFlow">Success Flow</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={analyzeErrors}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Analyze Current Errors
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Error Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Error Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Errors:</span>
                  <span className="text-sm font-medium">{analysisResult.totalErrors}</span>
                </div>
                {Object.entries(analysisResult.errorTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-sm text-gray-600">{type}:</span>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Patterns */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Common Patterns</h4>
              <div className="space-y-2">
                {analysisResult.commonPatterns.length > 0 ? (
                  analysisResult.commonPatterns.map((pattern, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      {pattern}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No patterns detected</div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {analysisResult.recommendations.length > 0 ? (
                  analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      {rec}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No recommendations</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Errors */}
          {analysisResult.recentErrors.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Recent Errors</h4>
              <div className="space-y-2">
                {analysisResult.recentErrors.map((log, index) => (
                  <div key={index} className="text-sm bg-red-50 p-3 rounded">
                    <div className="font-medium text-red-800">{log.message}</div>
                    <div className="text-red-600 text-xs mt-1">{log.timestamp}</div>
                    {(() => {
                      const errorData = log.data as Record<string, unknown> | undefined;
                      const error = errorData?.error as Record<string, unknown> | undefined;
                      const errorMessage = error?.message as string | undefined;
                      return errorMessage && (
                        <div className="text-red-600 text-xs mt-1">
                          {errorMessage}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Examples */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Error Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(paymentErrorExamples.commonErrors).map(([key, error]) => (
            <div key={key} className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-900">{error.error}</div>
              <div className="text-sm text-gray-600 mt-1">
                <strong>Cause:</strong> {error.cause}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <strong>Solution:</strong> {error.solution}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
