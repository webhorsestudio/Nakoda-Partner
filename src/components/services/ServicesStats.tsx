import { WrenchScrewdriverIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Service } from "@/types/services";

interface ServicesStatsProps {
  services: Service[];
}

export default function ServicesStats({ services }: ServicesStatsProps) {
  const totalServices = services.length;
  const activeServices = services.filter(s => s.is_active).length;
  const totalProviders = 0; // Will be calculated from partner_services table later
  const totalOrders = 0; // Will be calculated from orders table later

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Services</dt>
                <dd className="text-lg font-medium text-gray-900">{totalServices}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Services</dt>
                <dd className="text-lg font-medium text-gray-900">{activeServices}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Providers</dt>
                <dd className="text-lg font-medium text-gray-900">{totalProviders}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="text-lg font-medium text-gray-900">{totalOrders.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
