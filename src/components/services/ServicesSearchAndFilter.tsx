import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface ServicesSearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function ServicesSearchAndFilter({
  searchTerm,
  onSearchChange,
  onClearFilters
}: ServicesSearchAndFilterProps) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
        />
      </div>

      <button
        onClick={onClearFilters}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Clear Filters
      </button>
    </div>
  );
}
