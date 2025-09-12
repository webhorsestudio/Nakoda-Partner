import React from 'react';

interface NewTaskHeaderProps {
  totalTasks: number;
}

export default function NewTaskHeader({ totalTasks }: NewTaskHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Available Tasks</h1>
          <p className="text-sm text-gray-600 mt-1">{totalTasks} tasks waiting for you</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {totalTasks}
        </div>
      </div>
    </div>
  );
}
