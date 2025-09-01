import React from 'react';
import { ClockIcon, CheckCircleIcon } from 'lucide-react';
import { OngoingTaskHeaderProps } from './types';

export default function OngoingTaskHeader({ totalTasks, activeTasks, completedToday }: OngoingTaskHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Ongoing Tasks</h1>
        <div className="text-sm text-slate-600">
          Total: {totalTasks} tasks
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activeTasks}</div>
              <div className="text-sm text-slate-600">Active Tasks</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{completedToday}</div>
              <div className="text-sm text-slate-600">Completed Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
