import React, { useState, useEffect, useCallback } from 'react';

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
    title: "Earn More with Every Job",
    subtitle: "Complete tasks and boost your income",
    buttonText: "View Jobs",
    brandName: "Nakoda Partner",
    gradient: "from-blue-600 to-indigo-600"
  },
  {
    id: 2,
    title: "Flexible Working Hours",
    subtitle: "Work when it suits you best",
    buttonText: "Get Started",
    brandName: "Nakoda Partner",
    gradient: "from-green-600 to-emerald-600"
  },
  {
    id: 3,
    title: "Professional Support",
    subtitle: "24/7 assistance for all partners",
    buttonText: "Learn More",
    brandName: "Nakoda Partner",
    gradient: "from-purple-600 to-violet-600"
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
      className="relative mb-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
        {/* Main Banner */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${currentBannerData.gradient} p-4 h-28`}>
          {/* Content */}
          <div className="flex items-center justify-between h-full">
            {/* Left side - Text */}
            <div className="flex-1 text-white pr-3">
              <h2 className="text-lg font-bold mb-1 leading-tight">
                {currentBannerData.title}
              </h2>
              <p className="text-sm opacity-90 mb-3">
                {currentBannerData.subtitle}
              </p>
              <button
                onClick={onButtonClick}
                className="bg-white text-gray-800 hover:bg-gray-100 text-sm font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-colors"
              >
                {currentBannerData.buttonText}
              </button>
            </div>

            {/* Right side - Brand */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-white opacity-90 font-medium">
                {currentBannerData.brandName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center space-x-2 mt-3">
        {BANNER_DATA.map((_, index) => (
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
    </div>
  );
}
