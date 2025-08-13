import { 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { SummaryStats } from '@/types/reports';

interface ReportsSummaryCardsProps {
  stats: SummaryStats;
  loading: boolean;
}

export function ReportsSummaryCards({ stats, loading }: ReportsSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const cards = [
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      change: '+12%',
      changeType: 'positive' as const,
      icon: ShoppingCartIcon,
      color: 'blue',
      description: 'All time orders'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: '+8.5%',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      color: 'green',
      description: 'All time revenue'
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(stats.averageOrderValue),
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: ChartBarIcon,
      color: 'purple',
      description: 'Per order average'
    },
    {
      title: 'This Month Orders',
      value: formatNumber(stats.ordersThisMonth),
      change: '+15%',
      changeType: 'positive' as const,
      icon: CalendarIcon,
      color: 'indigo',
      description: 'Current month'
    },
    {
      title: 'This Month Revenue',
      value: formatCurrency(stats.revenueThisMonth),
      change: '+18%',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon,
      color: 'emerald',
      description: 'Current month'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: CheckCircleIcon,
      color: 'teal',
      description: 'Orders completed'
    },
    {
      title: 'New Orders Today',
      value: formatNumber(stats.newOrdersToday),
      change: '+3',
      changeType: 'positive' as const,
      icon: ClockIcon,
      color: 'orange',
      description: 'Today\'s new orders'
    },
    {
      title: 'Pending Orders',
      value: formatNumber(stats.pendingOrders),
      change: '-2',
      changeType: 'negative' as const,
      icon: ExclamationTriangleIcon,
      color: 'red',
      description: 'Awaiting completion'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-4">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg border ${getColorClasses(card.color)}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <span className={`text-sm font-medium ${
              card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.change}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {card.title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </p>
            <p className="text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
