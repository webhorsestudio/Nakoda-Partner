import { useState } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ReportData, ReportDataItem } from '@/types/reports';

interface ReportsDataTableProps {
  data: ReportData;
  loading: boolean;
}

type SortField = 'orderNumber' | 'customerName' | 'city' | 'partner' | 'status' | 'amount' | 'orderDate';
type SortDirection = 'asc' | 'desc';

export function ReportsDataTable({ data, loading }: ReportsDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('orderDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortData = (items: ReportDataItem[]): ReportDataItem[] => {
    return [...items].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      // Handle date sorting
      if (sortField === 'orderDate') {
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
      }

      // Handle amount sorting
      if (sortField === 'amount') {
        aValue = Number(a[sortField]) || 0;
        bValue = Number(b[sortField]) || 0;
      }

      // Handle string sorting
      if (typeof a[sortField] === 'string') {
        aValue = (a[sortField] as string).toLowerCase();
        bValue = (b[sortField] as string).toLowerCase();
      } else {
        aValue = a[sortField] as string | number;
        bValue = b[sortField] as string | number;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = sortData(data.items);
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = sortedData.slice(startIndex, endIndex);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-1"
    >
      <span>{children}</span>
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )
      ) : (
        <div className="h-4 w-4" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Report Data</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500">Loading report data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Detailed Report Data</h3>
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, data.totalCount)} of {data.totalCount} orders
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Orders:</span>
            <span className="ml-2 font-medium text-gray-900">{data.totalCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Revenue:</span>
            <span className="ml-2 font-medium text-gray-900">{formatCurrency(data.totalRevenue)}</span>
          </div>
          <div>
            <span className="text-gray-600">Average Order Value:</span>
            <span className="ml-2 font-medium text-gray-900">{formatCurrency(data.averageOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="orderNumber">Order Number</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="customerName">Customer</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="city">City</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="partner">Partner</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="status">Status</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="amount">Amount</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <SortableHeader field="orderDate">Order Date</SortableHeader>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">
                    {item.orderNumber || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.customerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.city}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.partner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(item.orderDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
