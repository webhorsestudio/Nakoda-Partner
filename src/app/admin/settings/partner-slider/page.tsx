"use client";

import React, { useState } from "react";
import { usePromotionalImages } from "@/hooks/usePromotionalImages";
import {
  SliderHeader,
  SliderStats,
  SliderImageList,
  LoadingState,
  ErrorState,
  EditImageModal
} from "@/components/admin/partner-slider";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/contexts/ToastContext";
import { PromotionalImage } from "@/types/promotionalImages";

export default function PartnerSliderPage() {
  const {
    images,
    stats,
    loading,
    error,
    fetchImages,
    createImage,
    toggleActive,
    deleteImage,
    editImage,
    reorderImages
  } = usePromotionalImages();

  const { addToast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<PromotionalImage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState<PromotionalImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = () => {
    setEditingImage(null);
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleEdit = (id: number) => {
    const image = images.find(img => img.id === id);
    if (image) {
      setEditingImage(image);
      setIsCreating(false);
      setEditModalOpen(true);
    }
  };

  const handleSave = async (id: number | null, updateData: Partial<PromotionalImage>): Promise<boolean> => {
    let success = false;
    
    if (isCreating) {
      // Create new image
      const createData = {
        title: updateData.title || '',
        subtitle: updateData.subtitle || '',
        button_text: updateData.button_text || 'Learn More',
        brand_name: updateData.brand_name || 'Nakoda Partner',
        image_url: updateData.image_url || '',
        image_alt: updateData.image_alt || updateData.title || '',
        gradient_from: updateData.gradient_from || 'blue-600',
        gradient_to: updateData.gradient_to || 'indigo-600',
        display_order: updateData.display_order || 0,
        auto_rotate_duration: updateData.auto_rotate_duration || 5000,
        action_type: updateData.action_type || 'button',
        action_url: updateData.action_url || '',
        action_target: updateData.action_target || '_self',
        target_audience: updateData.target_audience || 'all',
        is_active: updateData.is_active || false,
        expires_at: updateData.expires_at || undefined
      };
      success = await createImage(createData);
    } else {
      // Edit existing image
      success = await editImage(id!, updateData);
    }
    
    if (success) {
      addToast({
        type: 'success',
        title: isCreating ? 'Image Created' : 'Image Updated',
        message: isCreating 
          ? `"${updateData.title || 'New Image'}" has been created successfully.`
          : `"${updateData.title || 'Image'}" has been updated successfully.`
      });
      setEditModalOpen(false);
      setEditingImage(null);
      setIsCreating(false);
    } else {
      addToast({
        type: 'error',
        title: isCreating ? 'Create Failed' : 'Update Failed',
        message: `Failed to ${isCreating ? 'create' : 'update'} the promotional image. Please try again.`
      });
    }
    return success;
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setEditingImage(null);
    setIsCreating(false);
  };

  const handleDeleteClick = (id: number) => {
    const image = images.find(img => img.id === id);
    if (image) {
      setDeletingImage(image);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingImage) return;

    setIsDeleting(true);
    try {
      const success = await deleteImage(deletingImage.id);
      if (success) {
        addToast({
          type: 'success',
          title: 'Image Deleted',
          message: `"${deletingImage.title}" has been deleted successfully.`
        });
        setDeleteModalOpen(false);
        setDeletingImage(null);
      } else {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete the promotional image. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'An unexpected error occurred while deleting the image.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeletingImage(null);
    setIsDeleting(false);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await toggleActive(id, currentStatus);
      const image = images.find(img => img.id === id);
      if (image) {
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `"${image.title}" has been ${currentStatus ? 'deactivated' : 'activated'}.`
        });
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update the image status. Please try again.'
      });
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      await reorderImages(id, direction);
      const image = images.find(img => img.id === id);
      if (image) {
        addToast({
          type: 'success',
          title: 'Order Updated',
          message: `"${image.title}" moved ${direction}.`
        });
      }
    } catch (error) {
      console.error('Error reordering image:', error);
      addToast({
        type: 'error',
        title: 'Reorder Failed',
        message: 'Failed to reorder the image. Please try again.'
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchImages} />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <SliderHeader onAddNew={handleAddNew} />
      
      <SliderStats stats={stats} />
      
      <SliderImageList
        images={images}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteClick}
        onReorder={handleReorder}
        onEdit={handleEdit}
        onAddNew={handleAddNew}
      />

      <EditImageModal
        isOpen={editModalOpen}
        onClose={handleClose}
        image={editingImage}
        onSave={handleSave}
        isCreating={isCreating}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotional Image"
        message={`Are you sure you want to delete "${deletingImage?.title}"? This action cannot be undone and will permanently remove the image from the slider.`}
        confirmText="Delete Image"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}
