import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface OrdersSearchAndFilterProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function OrdersSearchAndFilter({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: OrdersSearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search orders by order number, customer name, mobile, city, package..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          suppressHydrationWarning
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        suppressHydrationWarning
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="in_progress">In Progress</option>
        <option value="new">New</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
