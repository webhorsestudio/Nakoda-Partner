

interface OrdersHeaderProps {
  loading: boolean;
}

export function OrdersHeader({ loading }: OrdersHeaderProps) {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-bold text-gray-900">Platform Orders</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor and manage recent service orders from Bitrix24 (using stage filters)
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Only orders with valid business order numbers (like Nus87419) are displayed
        </p>
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
        <button
          type="button"
          className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          suppressHydrationWarning
        >
          View Reports
        </button>
      </div>
    </div>
  );
}
