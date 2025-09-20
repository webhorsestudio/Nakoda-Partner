import React, { useState, useEffect } from 'react';
import { PaymentLogger, PaymentLogEntry } from '@/utils/paymentLogger';

interface PaymentLogViewerProps {
  className?: string;
}

export default function PaymentLogViewer({ className = '' }: PaymentLogViewerProps) {
  const [logs, setLogs] = useState<PaymentLogEntry[]>([]);
  const [filter, setFilter] = useState<{
    type?: string;
    level?: string;
    requestId?: string;
  }>({});
  const [selectedLog, setSelectedLog] = useState<PaymentLogEntry | null>(null);

  useEffect(() => {
    // Load logs initially
    setLogs(PaymentLogger.getLogs(filter));
    
    // Set up interval to refresh logs
    const interval = setInterval(() => {
      setLogs(PaymentLogger.getLogs(filter));
    }, 1000);

    return () => clearInterval(interval);
  }, [filter]);

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearLogs = () => {
    PaymentLogger.clearLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    const exported = PaymentLogger.exportLogs();
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50';
      case 'WARN': return 'text-yellow-600 bg-yellow-50';
      case 'DEBUG': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REQUEST': return 'text-green-600 bg-green-50';
      case 'RESPONSE': return 'text-blue-600 bg-blue-50';
      case 'ERROR': return 'text-red-600 bg-red-50';
      case 'SUCCESS': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Logs</h3>
          <div className="flex space-x-2">
            <button
              onClick={exportLogs}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export Logs
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="REQUEST">Request</option>
              <option value="RESPONSE">Response</option>
              <option value="ERROR">Error</option>
              <option value="SUCCESS">Success</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={filter.level || ''}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="ERROR">Error</option>
              <option value="WARN">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
            <input
              type="text"
              value={filter.requestId || ''}
              onChange={(e) => handleFilterChange('requestId', e.target.value)}
              placeholder="Filter by request ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({})}
              className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No logs found. Try adjusting your filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                      {log.requestId && (
                        <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded">
                          {log.requestId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{log.message}</p>
                    <p className="text-xs text-gray-500">{log.timestamp}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.data && typeof log.data === 'object' ? 'View Details' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
                    <p><strong>Type:</strong> {selectedLog.type}</p>
                    <p><strong>Level:</strong> {selectedLog.level}</p>
                    <p><strong>Message:</strong> {selectedLog.message}</p>
                    {selectedLog.requestId && <p><strong>Request ID:</strong> {selectedLog.requestId}</p>}
                  </div>
                </div>
                {selectedLog.data && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data</h4>
                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
