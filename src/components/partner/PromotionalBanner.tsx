import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PromotionalBannerProps {
  onButtonClick: () => void;
}

interface BannerData {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  brandName: string;
  gradient: string;
}

const BANNER_DATA: BannerData[] = [
  {
    id: 1,
    title: "60 mins express delivery",
    subtitle: "Fast, reliable Express delivery",
    buttonText: "Order now",
    brandName: "hyperpure by zomato",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    id: 2,
    title: "Professional Handyman Services",
    subtitle: "Expert repairs & maintenance",
    buttonText: "Book now",
    brandName: "Nakoda Partner",
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    id: 3,
    title: "24/7 Emergency Repairs",
    subtitle: "Urgent fixes anytime, anywhere",
    buttonText: "Call now",
    brandName: "Nakoda Partner",
    gradient: "from-red-500 to-pink-500"
  }
];

export default function PromotionalBanner({ onButtonClick }: PromotionalBannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Pause auto-rotation on hover
  const [isPaused, setIsPaused] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  const currentBannerData = BANNER_DATA[currentBanner];

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Main Banner */}
          <div className={`relative overflow-hidden bg-gradient-to-r ${currentBannerData.gradient} p-4 h-24`}>
            {/* Content */}
            <div className="flex items-center justify-between h-full">
              {/* Left side - Text */}
              <div className="flex-1 text-white pr-4">
                <h2 className="text-base font-semibold mb-1 leading-tight">
                  {currentBannerData.title}
                </h2>
                <p className="text-sm opacity-90 mb-2">
                  {currentBannerData.subtitle}
                </p>
                <Button
                  onClick={onButtonClick}
                  className="bg-white text-slate-800 hover:bg-slate-100 text-xs focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  size="sm"
                >
                  {currentBannerData.buttonText}
                </Button>
              </div>

              {/* Right side - Brand */}
              <div className="text-right">
                <p className="text-xs text-white opacity-90 font-medium">
                  {currentBannerData.brandName}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-rotation status indicator */}
      {isPaused && (
        <div className="text-center mt-2">
          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm">
            Auto-rotation paused
          </span>
        </div>
      )}
    </div>
  );
}
