import { useState, useCallback } from 'react';

interface BulkUpdateResult {
  success: boolean;
  message: string;
  updated: number;
  created: number;
  duplicatesRemoved: number;
  errors: string[];
}

interface UseBulkUpdatePartnersReturn {
  loading: boolean;
  error: string | null;
  result: BulkUpdateResult | null;
  bulkUpdatePartners: (file: File) => Promise<BulkUpdateResult>;
  clearResult: () => void;
}

export function useBulkUpdatePartners(): UseBulkUpdatePartnersReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkUpdateResult | null>(null);

  const bulkUpdatePartners = useCallback(async (file: File): Promise<BulkUpdateResult> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get auth token - try localStorage first, then cookies
      let token = null;
      if (typeof window !== 'undefined') {
        // Try localStorage first
        token = localStorage.getItem('auth-token');
        
        // Try cookies as fallback
        if (!token) {
          const cookies = document.cookie.split(';');
          const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
          if (tokenCookie) {
            token = tokenCookie.split('=')[1];
          }
        }
      }
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Make API call
      const response = await fetch('/api/admin/partners/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update partners');
      }

      setResult(data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    bulkUpdatePartners,
    clearResult,
  };
}
