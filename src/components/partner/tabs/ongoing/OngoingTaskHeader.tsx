import React from 'react';
import { OngoingTaskHeaderProps } from './types';

export default function OngoingTaskHeader({ totalTasks }: OngoingTaskHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Ongoing Tasks</h1>
          <p className="text-sm text-gray-600 mt-1">{totalTasks} tasks in progress</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {totalTasks}
        </div>
      </div>
    </div>
  );
}
