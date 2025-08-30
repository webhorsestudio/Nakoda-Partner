"use client";

import React, { useState, useRef } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CSVPartnerData {
  name: string;
  service_type: string;
  mobile: string;
  email: string;
  location: string;
  city: string;
  state: string;
  status: "pending" | "active" | "inactive";
  verification_status: "Pending" | "Verified" | "Rejected";
  rating: number;
  total_orders: number;
  total_revenue: number;
  commission_percentage: number;
  address: string;
  pin_code: string;
  notes: string;
  joined_date: string;
  last_active: string | null;
  documents_verified: boolean;
}

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: CSVPartnerData[], mode: 'create' | 'update') => Promise<void>;
}

export default function CSVUploadModal({ isOpen, onClose, onUpload }: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVPartnerData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'create' | 'update'>('create');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions to normalize status values
  const normalizeStatus = (status: string): "pending" | "active" | "inactive" => {
    const normalized = status.toLowerCase().trim();
    if (normalized === 'active' || normalized === 'pending' || normalized === 'inactive') {
      return normalized as "pending" | "active" | "inactive";
    }
    return 'pending'; // default fallback
  };

  const normalizeVerificationStatus = (status: string): "Pending" | "Verified" | "Rejected" => {
    const normalized = status.trim();
    if (normalized === 'Pending' || normalized === 'Verified' || normalized === 'Rejected') {
      return normalized as "Pending" | "Verified" | "Rejected";
    }
    return 'Pending'; // default fallback
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        
        const previewData: CSVPartnerData[] = [];
        
        // Parse first 5 rows for preview
        for (let i = 1; i < Math.min(6, lines.length); i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
                         const row: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
                         previewData.push({
               name: row.name || row.partner_name || '',
               service_type: row.service_type || row.service || '',
               mobile: row.mobile || row.phone || '',
               email: row.email || '',
               location: row.location || '',
               city: row.city || '',
               state: row.state || '',
               status: normalizeStatus(row.status || 'pending'),
               verification_status: normalizeVerificationStatus(row.verification_status || 'Pending'),
               rating: parseFloat(row.rating) || 0,
               total_orders: parseInt(row.total_orders) || 0,
               total_revenue: parseFloat(row.total_revenue) || 0,
               commission_percentage: parseFloat(row.commission_percentage) || 0,
               address: row.address || '',
               pin_code: row.pin_code || '',
               notes: row.notes || '',
               joined_date: row.joined_date || new Date().toISOString(),
               last_active: row.last_active || null,
               documents_verified: row.documents_verified === 'true' || false
             });
          }
        }
        
        setPreview(previewData);
      } catch {
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
          
          const partnersData: CSVPartnerData[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim());
                          const row: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              if (index < values.length) {
                row[header] = values[index] || '';
              }
            });
              
                             const partner = {
                 name: row.name || row.partner_name || '',
                 service_type: row.service_type || row.service || 'Other',
                 mobile: row.mobile || row.phone || '',
                 email: row.email || '',
                 location: row.location || '',
                 city: row.city || '',
                 state: row.state || '',
                 status: normalizeStatus(row.status || 'pending'),
                 verification_status: normalizeVerificationStatus(row.verification_status || 'Pending'),
                 rating: parseFloat(row.rating) || 0,
                 total_orders: parseInt(row.total_orders) || 0,
                 total_revenue: parseFloat(row.total_revenue) || 0,
                 commission_percentage: parseFloat(row.commission_percentage) || 0,
                 address: row.address || '',
                 pin_code: row.pin_code || '',
                 notes: row.notes || '',
                 joined_date: row.joined_date || new Date().toISOString(),
                 last_active: row.last_active || null,
                 documents_verified: row.documents_verified === 'true' || false
               };
              
              if (partner.name && partner.mobile) {
                partnersData.push(partner);
              }
            }
          }
          
          if (partnersData.length === 0) {
            throw new Error('No valid partner data found in CSV');
          }
          
          console.log('CSV Data to upload:', partnersData);
          await onUpload(partnersData, uploadMode);
          setSuccess(`Successfully ${uploadMode === 'create' ? 'created' : 'updated'} ${partnersData.length} partners`);
          
          setTimeout(() => {
            handleClose();
          }, 2000);
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error processing CSV data');
        }
      };
      reader.readAsText(file);
      
    } catch {
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const template = `name,service_type,mobile,email,location,city,state,status,verification_status,rating,total_orders,total_revenue,commission_percentage,address,pin_code,notes
"CoolTech Solutions","AC Service","+91 98765 43210","cooltech@example.com","Mumbai","Mumbai","Maharashtra","active","Verified",4.5,25,5000.00,15.00,"123 Tech Street","400001","Professional AC service provider"
"CleanPro Services","Cleaning","+91 98765 43211","cleanpro@example.com","Pune","Pune","Maharashtra","pending","Pending",4.2,18,3600.00,12.00,"456 Clean Avenue","411001","Reliable cleaning services"
"Test Partner","Plumbing","+91 98765 43212","test@example.com","Delhi","Delhi","Delhi","inactive","Rejected",3.0,0,0.00,10.00,"Test Address","110001","Test partner"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partners_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Upload Partners CSV</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">Upload CSV File</span>
                  <span className="mt-1 block text-xs text-gray-500">CSV, max 10MB</span>
                </label>
                <input
                  id="csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  Choose File
                </Button>
              </div>
            </div>
          </Card>

          <div className="text-center space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Mode</h4>
              <div className="flex justify-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="create"
                    checked={uploadMode === 'create'}
                    onChange={(e) => setUploadMode(e.target.value as 'create' | 'update')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Create New Partners</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="update"
                    checked={uploadMode === 'update'}
                    onChange={(e) => setUploadMode(e.target.value as 'create' | 'update')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Update Existing Partners</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {uploadMode === 'create' 
                  ? 'Create new partners (will fail if mobile/email already exists)'
                  : 'Update existing partners based on mobile number or email'
                }
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Download CSV Template
            </Button>
            <p className="text-xs text-gray-500">Use this template to ensure proper CSV format</p>
          </div>

          {file && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">File selected: {file.name}</span>
              </div>
              <p className="mt-1 text-sm text-blue-700">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Preview (First 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.service_type}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.mobile}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.email}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                <div className="text-sm text-green-700">{success}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Upload Partners'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
