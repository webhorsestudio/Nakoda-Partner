"use client";

import { ShieldCheckIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline";

interface TeamStatsProps {
  totalAdmins: number;
  activeAdmins: number;
  superAdmins: number;
  accessLevels: number;
}

export default function TeamStats({
  totalAdmins,
  activeAdmins,
  superAdmins,
  accessLevels
}: TeamStatsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Admins</dt>
                <dd className="text-lg font-medium text-gray-900">{totalAdmins}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Admins</dt>
                <dd className="text-lg font-medium text-gray-900">{activeAdmins}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Super Admins</dt>
                <dd className="text-lg font-medium text-gray-900">{superAdmins}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Access Levels</dt>
                <dd className="text-lg font-medium text-gray-900">{accessLevels}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
