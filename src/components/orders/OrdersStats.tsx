import { 
  CurrencyDollarIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";
import { OrderStats } from "@/types/orders";

interface OrdersStatsProps {
  stats: OrderStats | null;
}

export function OrdersStats({ stats }: OrdersStatsProps) {
  if (!stats) return null;

  const statCards = [
    {
      name: "Total Orders",
      value: stats.total_orders,
      icon: CalendarIcon,
      color: "bg-blue-500",
    },
    {
      name: "Completed Orders",
      value: stats.completed_orders,
      icon: CheckCircleIcon,
      color: "bg-green-500",
    },
    {
      name: "In Progress",
      value: stats.in_progress_orders,
      icon: ClockIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Total Revenue",
      value: `₹${stats.total_revenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
}
