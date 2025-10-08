import React, { useState, useRef } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useBulkUpdatePartners } from '@/hooks/useBulkUpdatePartners';
import { toast } from 'react-hot-toast';

interface BulkUpdatePartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUpdatePartnersModal({ isOpen, onClose, onSuccess }: BulkUpdatePartnersModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { loading, error, result, bulkUpdatePartners, clearResult } = useBulkUpdatePartners();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    clearResult();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      await bulkUpdatePartners(selectedFile);
      toast.success('Partners updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update partners');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    clearResult();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Update Partners from Excel</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Excel File Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• File format: .xlsx or .xls</li>
              <li>• Required columns: vendor_id, vendor_compnay, phone_no, city, services, vendor_status</li>
              <li>• System will match partners by vendor_id (unique identifier)</li>
              <li>• If partner exists: Updates all data with vendor_id</li>
              <li>• If partner doesn&apos;t exist: Creates new partner with all data</li>
              <li>• vendor_status should be &quot;active&quot; or &quot;inactive&quot;</li>
              <li>• All 882 partners from Excel will be processed</li>
            </ul>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Drop your Excel file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports .xlsx and .xls files up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`mb-6 p-4 border rounded-lg ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex">
                <CheckCircleIcon className={`h-5 w-5 mr-2 ${
                  result.success ? 'text-green-400' : 'text-yellow-400'
                }`} />
                <div>
                  <h4 className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {result.message}
                  </h4>
                  <div className="text-sm mt-2 space-y-1">
                    <p className={result.success ? 'text-green-700' : 'text-yellow-700'}>
                      • Updated: {result.updated} partners
                    </p>
                    <p className={result.success ? 'text-green-700' : 'text-yellow-700'}>
                      • Created: {result.created} partners
                    </p>
                    <p className={result.success ? 'text-green-700' : 'text-yellow-700'}>
                      • Duplicates removed: {result.duplicatesRemoved} partners
                    </p>
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-red-700 font-medium">Errors:</p>
                        <ul className="text-red-600 text-xs space-y-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Update Partners'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
