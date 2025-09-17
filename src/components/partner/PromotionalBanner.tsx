import React, { useState, useEffect, useCallback } from 'react';
import { PromotionalImage } from '@/types/promotionalImages';

interface PromotionalBannerProps {
  onButtonClick: () => void;
}

export default function PromotionalBanner({ onButtonClick }: PromotionalBannerProps) {
  const [banners, setBanners] = useState<PromotionalImage[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch promotional images from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem('auth-token');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/partners/promotional-images', {
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch promotional images');
        }
        const data = await response.json();
        setBanners(data.images || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching promotional images:', err);
        setError('Failed to load promotional images');
        // Fallback to static data
        setBanners([
          {
            id: 1,
            title: "Earn More with Every Job",
            subtitle: "Complete tasks and boost your income",
            button_text: "View Jobs",
            brand_name: "Nakoda Partner",
            gradient_from: "blue-600",
            gradient_to: "indigo-600",
            image_url: "",
            image_alt: "",
            is_active: true,
            display_order: 1,
            auto_rotate_duration: 5000,
            action_type: "button" as const,
            action_url: "",
            action_target: "_self" as const,
            target_audience: "all" as const,
            click_count: 0,
            view_count: 0,
            created_at: "",
            updated_at: ""
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, banners[currentBanner]?.auto_rotate_duration || 5000);

    return () => clearInterval(interval);
  }, [banners, currentBanner]);

  // Pause auto-rotation on hover
  const [isPaused, setIsPaused] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Track click analytics
  const handleButtonClick = useCallback(async (imageId: number) => {
    try {
      // Get authentication token
      const token = localStorage.getItem('auth-token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/partners/promotional-images', {
        method: 'POST',
        headers,
        body: JSON.stringify({ image_id: imageId }),
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
    onButtonClick();
  }, [onButtonClick]);

  // Show loading state
  if (loading) {
    return (
      <div className="relative mb-4">
        <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 p-4 h-28 animate-pulse">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 text-white pr-3">
                <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded mb-3 w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state or no banners
  if (error || banners.length === 0) {
    return null; // Hide banner if no data
  }

  const currentBannerData = banners[currentBanner];

  return (
    <div 
      className="relative mb-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
        {/* Main Banner */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${currentBannerData.gradient_from} ${currentBannerData.gradient_to} p-4 h-28`}>
          {/* Background Image if available */}
          {currentBannerData.image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
              style={{ backgroundImage: `url(${currentBannerData.image_url})` }}
            />
          )}
          
          {/* Content */}
          <div className="relative flex items-center justify-between h-full">
            {/* Left side - Text */}
            <div className="flex-1 text-white pr-3">
              <h2 className="text-lg font-bold mb-1 leading-tight">
                {currentBannerData.title}
              </h2>
              <p className="text-sm opacity-90 mb-3">
                {currentBannerData.subtitle}
              </p>
              {currentBannerData.action_type === 'button' && (
                <button
                  onClick={() => handleButtonClick(currentBannerData.id)}
                  className="bg-white text-gray-800 hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-colors"
                >
                  {currentBannerData.button_text}
                </button>
              )}
              {currentBannerData.action_type === 'link' && currentBannerData.action_url && (
                <a
                  href={currentBannerData.action_url}
                  target={currentBannerData.action_target}
                  className="inline-block bg-white text-gray-800 hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-colors"
                >
                  {currentBannerData.button_text}
                </a>
              )}
            </div>

            {/* Right side - Brand */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-white opacity-90 font-medium">
                {currentBannerData.brand_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentBanner 
                  ? 'bg-gray-400' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
