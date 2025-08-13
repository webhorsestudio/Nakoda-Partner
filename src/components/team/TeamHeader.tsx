"use client";

interface TeamHeaderProps {
  onAddAdmin: () => void;
}

export default function TeamHeader({ onAddAdmin }: TeamHeaderProps) {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-bold text-gray-900">Nakoda Team</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage admin users and their access levels for the Nakoda platform
        </p>
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          type="button"
          onClick={onAddAdmin}
          className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          suppressHydrationWarning
        >
          Add Admin User
        </button>
      </div>
    </div>
  );
}
