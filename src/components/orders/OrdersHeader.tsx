"use client";

export function OrdersHeader() {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-bold text-gray-900">Bitrix24 Orders</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor and manage service orders synced from Bitrix24 platform
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Only orders with valid business order numbers (like Nus87419) are displayed
        </p>
      </div>
    </div>
  );
}
