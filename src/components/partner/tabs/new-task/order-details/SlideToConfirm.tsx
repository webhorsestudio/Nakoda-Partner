import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';

interface SlideToConfirmProps {
  onConfirm: () => void;
  disabled?: boolean;
  text?: string;
  confirmText?: string;
  className?: string;
}

export default function SlideToConfirm({
  onConfirm,
  disabled = false,
  text = "Slide to confirm",
  confirmText = "Confirm",
  className = ""
}: SlideToConfirmProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const maxSlideDistance = 200; // Maximum distance the slider can move
  const threshold = 0.8; // 80% of the way to trigger confirmation

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isConfirmed) return;
    
    e.preventDefault();
    setIsDragging(true);
    setIsSliding(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled || isConfirmed) return;

    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clampedX = Math.max(0, Math.min(x, maxSlideDistance));
      setSliderPosition(clampedX);

      // Check if slider has moved far enough to trigger confirmation
      if (clampedX >= maxSlideDistance * threshold) {
        handleConfirm();
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If not confirmed, reset slider position
    if (sliderPosition < maxSlideDistance * threshold) {
      setSliderPosition(0);
      setIsSliding(false);
    }
  };

  const handleConfirm = () => {
    if (disabled || isConfirmed) return;
    
    setIsConfirmed(true);
    setSliderPosition(maxSlideDistance);
    setIsSliding(false);
    setIsDragging(false);
    
    // Call the confirm callback after a short delay
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  const resetSlider = () => {
    setIsConfirmed(false);
    setSliderPosition(0);
    setIsSliding(false);
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, sliderPosition]);

  // Reset slider when disabled state changes
  useEffect(() => {
    if (disabled) {
      resetSlider();
    }
  }, [disabled]);

  const progress = sliderPosition / maxSlideDistance;
  const isNearConfirm = progress >= threshold;

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={trackRef}
        className={`
          relative w-full h-14 rounded-full overflow-hidden
          transition-all duration-300 ease-out
          ${disabled 
            ? 'bg-gray-200 cursor-not-allowed' 
            : isConfirmed 
              ? 'bg-green-500' 
              : isNearConfirm 
                ? 'bg-green-400' 
                : 'bg-gray-300 hover:bg-gray-400'
          }
          shadow-inner
        `}
      >
        {/* Slider Handle */}
        <div
          ref={sliderRef}
          className={`
            absolute top-1.5 left-1.5 w-11 h-11 rounded-full
            flex items-center justify-center
            transition-all duration-200 ease-out
            cursor-pointer select-none
            ${disabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isConfirmed 
                ? 'bg-white shadow-xl' 
                : isNearConfirm 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white shadow-md hover:shadow-lg'
            }
            ${isDragging ? 'scale-110' : 'scale-100'}
            border-2 border-gray-200
          `}
          style={{
            transform: `translateX(${sliderPosition}px)`,
            zIndex: 10
          }}
          onMouseDown={handleMouseDown}
        >
          <ChevronRightIcon 
            className={`
              w-5 h-5 transition-colors duration-150
              ${disabled 
                ? 'text-gray-500' 
                : isConfirmed 
                  ? 'text-green-500' 
                  : isNearConfirm 
                    ? 'text-green-500' 
                    : 'text-gray-600'
              }
            `} 
          />
        </div>

        {/* Text Content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span 
            className={`
              text-base font-semibold transition-all duration-300
              ${disabled 
                ? 'text-gray-500' 
                : isConfirmed 
                  ? 'text-white' 
                  : isNearConfirm 
                    ? 'text-white' 
                    : 'text-gray-700'
              }
            `}
            style={{
              opacity: isSliding ? Math.max(0.2, 1 - progress * 1.2) : 1,
              transform: isSliding ? `translateX(${sliderPosition * 0.2}px)` : 'translateX(0)'
            }}
          >
            {isConfirmed ? confirmText : text}
          </span>
        </div>

        {/* Progress Background */}
        {isSliding && (
          <div 
            className="absolute top-0 left-0 h-full bg-green-400 transition-all duration-150"
            style={{
              width: `${progress * 100}%`,
              opacity: 0.3
            }}
          />
        )}
      </div>
    </div>
  );
}
