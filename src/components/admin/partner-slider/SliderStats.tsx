import React from 'react';
import { PhotoIcon, EyeIcon } from '@heroicons/react/24/outline';
import { PromotionalImageStats } from '@/types/promotionalImages';

interface SliderStatsProps {
  stats: PromotionalImageStats;
}

export function SliderStats({ stats }: SliderStatsProps) {
  const statCards = [
    {
      title: 'Total Images',
      value: stats.total_images,
      icon: PhotoIcon,
      color: 'text-gray-400'
    },
    {
      title: 'Active Images',
      value: stats.active_images,
      icon: EyeIcon,
      color: 'text-green-400'
    },
    {
      title: 'Total Views',
      value: stats.total_views.toLocaleString(),
      icon: EyeIcon,
      color: 'text-blue-400'
    },
    {
      title: 'Click Rate',
      value: `${stats.click_through_rate.toFixed(1)}%`,
      icon: EyeIcon,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
