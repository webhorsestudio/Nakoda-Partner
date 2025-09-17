import { useState, useEffect, useCallback } from 'react';
import { PromotionalImage, PromotionalImageStats } from '@/types/promotionalImages';

interface UsePromotionalImagesReturn {
  images: PromotionalImage[];
  stats: PromotionalImageStats;
  loading: boolean;
  error: string | null;
  fetchImages: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createImage: (imageData: Omit<PromotionalImage, 'id' | 'created_at' | 'updated_at' | 'click_count' | 'view_count'>) => Promise<boolean>;
  toggleActive: (id: number, currentStatus: boolean) => Promise<void>;
  deleteImage: (id: number) => Promise<boolean>;
  editImage: (id: number, updateData: Partial<PromotionalImage>) => Promise<boolean>;
  reorderImages: (id: number, direction: 'up' | 'down') => Promise<void>;
}

export function usePromotionalImages(): UsePromotionalImagesReturn {
  const [images, setImages] = useState<PromotionalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PromotionalImageStats>({
    total_images: 0,
    active_images: 0,
    inactive_images: 0,
    total_views: 0,
    total_clicks: 0,
    click_through_rate: 0,
    top_performing_image: null
  });

  // Fetch promotional images
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/promotional-images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data.images || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load promotional images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/promotional-images/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({
        total_images: 0,
        active_images: 0,
        inactive_images: 0,
        total_views: 0,
        total_clicks: 0,
        click_through_rate: 0,
        top_performing_image: null
      });
    }
  }, []);

  // Toggle image active status
  const toggleActive = useCallback(async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/promotional-images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, is_active: !currentStatus } : img
        ));
        await fetchStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error toggling image status:', err);
    }
  }, [fetchStats]);

  // Delete image
  const deleteImage = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/promotional-images/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
        await fetchStats(); // Refresh stats
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, [fetchStats]);

  // Create image
  const createImage = useCallback(async (imageData: Omit<PromotionalImage, 'id' | 'created_at' | 'updated_at' | 'click_count' | 'view_count'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/promotional-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageData)
      });

      if (response.ok) {
        const { image } = await response.json();
        setImages(prev => [image, ...prev]);
        await fetchStats(); // Refresh stats
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating image:', err);
      return false;
    }
  }, [fetchStats]);

  // Edit image
  const editImage = useCallback(async (id: number, updateData: Partial<PromotionalImage>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/promotional-images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const { image } = await response.json();
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, ...image } : img
        ));
        await fetchStats(); // Refresh stats
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error editing image:', err);
      return false;
    }
  }, [fetchStats]);

  // Reorder images
  const reorderImages = useCallback(async (id: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    // Update display_order
    const updates = newImages.map((img, index) => ({
      id: img.id,
      display_order: index + 1
    }));

    try {
      await Promise.all(updates.map(update => 
        fetch(`/api/admin/promotional-images/${update.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: update.display_order })
        })
      ));

      setImages(newImages);
    } catch (err) {
      console.error('Error reordering images:', err);
    }
  }, [images]);

  // Initial data fetch
  useEffect(() => {
    fetchImages();
    fetchStats();
  }, [fetchImages, fetchStats]);

  return {
    images,
    stats,
    loading,
    error,
    fetchImages,
    fetchStats,
    createImage,
    toggleActive,
    deleteImage,
    editImage,
    reorderImages
  };
}
