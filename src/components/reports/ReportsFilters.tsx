import { useState } from 'react';
import { 
  CalendarIcon, 
  FunnelIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { ReportFilters } from '@/types/reports';

interface ReportsFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
}

export function ReportsFilters({ filters, onFiltersChange }: ReportsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (range: ReportFilters['dateRange']) => {
    onFiltersChange({ dateRange: range });
    
    // Set default dates based on range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'custom':
        return; // Don't set dates for custom
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    onFiltersChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: 'last30days',
      startDate: '',
      endDate: '',
      status: 'all',
      city: 'all',
      partner: 'all',
      minAmount: '',
      maxAmount: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.city !== 'all' || 
                          filters.partner !== 'all' || 
                          filters.minAmount || 
                          filters.maxAmount;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear All
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>

        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as ReportFilters['dateRange'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="lastYear">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value as ReportFilters['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFiltersChange({ city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onFiltersChange({ startDate: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onFiltersChange({ endDate: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </>
              )}

              {/* Partner Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner
                </label>
                <select
                  value={filters.partner}
                  onChange={(e) => onFiltersChange({ partner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Partners</option>
                  <option value="VK Cleaning Services">VK Cleaning Services</option>
                  <option value="Kavya Enterprises">Kavya Enterprises</option>
                  <option value="Professional Cleaners">Professional Cleaners</option>
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => onFiltersChange({ minAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={filters.maxAmount}
                  onChange={(e) => onFiltersChange({ maxAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
