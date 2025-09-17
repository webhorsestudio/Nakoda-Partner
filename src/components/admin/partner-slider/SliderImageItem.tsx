import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { PromotionalImage } from '@/types/promotionalImages';

interface SliderImageItemProps {
  image: PromotionalImage;
  index: number;
  totalImages: number;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
  onEdit?: (id: number) => void;
}

export function SliderImageItem({
  image,
  index,
  totalImages,
  onToggleActive,
  onDelete,
  onReorder,
  onEdit
}: SliderImageItemProps) {
  return (
    <li className="px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Order Controls */}
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => onReorder(image.id, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-500 text-center">
              {image.display_order}
            </span>
            <button
              onClick={() => onReorder(image.id, 'down')}
              disabled={index === totalImages - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Image Preview */}
          <div className={`w-16 h-12 rounded-lg bg-gradient-to-r ${image.gradient_from} ${image.gradient_to} flex items-center justify-center`}>
            {image.image_url ? (
              <img
                src={image.image_url}
                alt={image.image_alt || image.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {image.display_order}
              </span>
            )}
          </div>

          {/* Image Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {image.title}
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                image.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {image.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {image.subtitle}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-400">
                Views: {image.view_count || 0}
              </span>
              <span className="text-xs text-gray-400">
                Clicks: {image.click_count || 0}
              </span>
              <span className="text-xs text-gray-400">
                Target: {image.target_audience}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleActive(image.id, image.is_active)}
            className={`p-2 rounded-md ${
              image.is_active 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={image.is_active ? 'Deactivate' : 'Activate'}
          >
            {image.is_active ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onEdit?.(image.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(image.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
