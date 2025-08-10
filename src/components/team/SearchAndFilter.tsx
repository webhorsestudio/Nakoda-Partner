"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

export default function SearchAndFilter({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter
}: SearchAndFilterProps) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search admin users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          suppressHydrationWarning
        />
      </div>
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        suppressHydrationWarning
      >
        <option value="all">All Admin Roles</option>
        <option value="Super Admin">Super Admin</option>
        <option value="Admin">Admin</option>
        <option value="Support Admin">Support Admin</option>
        <option value="Analytics Admin">Analytics Admin</option>
        <option value="Technical Admin">Technical Admin</option>
      </select>
    </div>
  );
}
