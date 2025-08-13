export interface ReportFilters {
  dateRange: 'last7days' | 'last30days' | 'last90days' | 'lastYear' | 'custom';
  startDate: string;
  endDate: string;
  status: 'all' | 'new' | 'in_progress' | 'completed' | 'cancelled';
  city: 'all' | string;
  partner: 'all' | string;
  minAmount: string;
  maxAmount: string;
}

export interface SummaryStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  completionRate: number;
  newOrdersToday: number;
  pendingOrders: number;
}

export interface ChartData {
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  ordersByMonth: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  ordersByCity: Array<{
    city: string;
    orders: number;
    revenue: number;
  }>;
  ordersByPartner: Array<{
    partner: string;
    orders: number;
    revenue: number;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface ReportDataItem {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  partner: string;
  status: string;
  amount: number;
  orderDate: string;
  completionDate?: string;
  timeToComplete?: number;
}

export interface ReportData {
  items: ReportDataItem[];
  totalCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}
