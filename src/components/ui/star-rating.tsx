import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  maxStars = 5,
  size = 'md',
  disabled = false,
  className = ''
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starValue: number) => {
    if (!disabled) {
      onChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (!disabled) {
      setHoveredStar(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredStar(null);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoveredStar || value);
        // const isHalfFilled = starValue === Math.ceil((hoveredStar || value)) && (hoveredStar || value) % 1 !== 0;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={disabled}
            className={cn(
              "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm",
              !disabled && "hover:scale-110 transform transition-transform duration-150"
            )}
            aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 fill-gray-300",
                !disabled && "hover:text-yellow-500 hover:fill-yellow-500"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// Helper component for displaying read-only star rating
interface StarRatingDisplayProps {
  value: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRatingDisplay({
  value,
  maxStars = 5,
  size = 'md',
  showValue = false,
  className = ''
}: StarRatingDisplayProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;

        return (
          <Star
            key={starValue}
            className={cn(
              sizeClasses[size],
              isFilled
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-gray-300"
            )}
          />
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
