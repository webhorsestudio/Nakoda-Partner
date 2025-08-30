import { PlusIcon } from "@heroicons/react/24/outline";

interface ServicesHeaderProps {
  onAddService: () => void;
}

export default function ServicesHeader({ onAddService }: ServicesHeaderProps) {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-bold text-gray-900">Services Details</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage and monitor all service offerings on the platform
        </p>
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
        <button
          type="button"
          onClick={onAddService}
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>
    </div>
  );
}
