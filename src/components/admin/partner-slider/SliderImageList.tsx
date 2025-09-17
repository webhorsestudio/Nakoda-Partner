import React from 'react';
import { PromotionalImage } from '@/types/promotionalImages';
import { SliderImageItem } from './SliderImageItem';
import { EmptyState } from './EmptyState';

interface SliderImageListProps {
  images: PromotionalImage[];
  onToggleActive: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
  onEdit?: (id: number) => void;
  onAddNew?: () => void;
}

export function SliderImageList({
  images,
  onToggleActive,
  onDelete,
  onReorder,
  onEdit,
  onAddNew
}: SliderImageListProps) {
  return (
    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Promotional Images
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage and organize your promotional slider images
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {images.length === 0 ? (
          <EmptyState onAddNew={onAddNew} />
        ) : (
          images.map((image, index) => (
            <SliderImageItem
              key={image.id}
              image={image}
              index={index}
              totalImages={images.length}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
              onReorder={onReorder}
              onEdit={onEdit}
            />
          ))
        )}
      </ul>
    </div>
  );
}
