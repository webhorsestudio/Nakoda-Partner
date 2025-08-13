import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon, 
  TableCellsIcon,
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ReportsHeaderProps {
  loading: boolean;
  exportStatus?: 'idle' | 'exporting';
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
}

export function ReportsHeader({ loading, exportStatus = 'idle', onExport }: ReportsHeaderProps) {
  const router = useRouter();

  const handleBackToOrders = () => {
    router.push('/admin/orders');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackToOrders}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to Orders"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Order Reports & Analytics</h1>
              <p className="text-sm text-gray-500">
                Comprehensive insights into your order performance and business metrics
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Export Options */}
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onExport('csv')}
                disabled={exportStatus === 'exporting'}
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onExport('pdf')}
              disabled={exportStatus === 'exporting'}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onExport('excel')}
              disabled={exportStatus === 'exporting'}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Excel
            </button>
            
            {/* Export Status Indicator */}
            {exportStatus === 'exporting' && (
              <div className="flex items-center px-3 py-2 text-sm text-blue-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                Exporting...
              </div>
            )}
            
            {/* Page Loading Indicator */}
            {loading && (
              <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
