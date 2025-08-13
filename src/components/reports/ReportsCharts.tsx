import { ChartData } from '@/types/reports';

interface ReportsChartsProps {
  data: ChartData;
  loading: boolean;
}

export function ReportsCharts({ data, loading }: ReportsChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Chart Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Data Visualization & Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          Interactive charts showing order trends, revenue patterns, and performance metrics
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status - Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {data.ordersByStatus.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <div className="mt-4 space-y-2">
                {data.ordersByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.status}</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend - Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(data.revenueTrend.reduce((sum, item) => sum + item.revenue, 0))}
              </div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <div className="mt-4 space-y-2">
                {data.revenueTrend.slice(-5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-medium">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Month - Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Month</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {data.ordersByMonth.reduce((sum, item) => sum + item.orders, 0)}
              </div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <div className="mt-4 space-y-2">
                {data.ordersByMonth.slice(-6).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-medium">{item.orders} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders by City - Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by City</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {data.ordersByCity.reduce((sum, item) => sum + item.orders, 0)}
              </div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <div className="mt-4 space-y-2">
                {data.ordersByCity.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.city}</span>
                    <span className="font-medium">{item.orders} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800 text-sm">
          💡 <strong>Chart Enhancement:</strong> These are placeholder charts. 
          For production, integrate with Chart.js, Recharts, or similar libraries for interactive visualizations.
        </p>
      </div>
    </div>
  );
}
