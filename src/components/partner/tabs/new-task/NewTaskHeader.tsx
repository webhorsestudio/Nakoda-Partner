import React from 'react';

interface NewTaskHeaderProps {
  totalTasks: number;
}

export default function NewTaskHeader({ totalTasks }: NewTaskHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Available Tasks: {totalTasks}</h1>
      </div>
    </div>
  );
}
