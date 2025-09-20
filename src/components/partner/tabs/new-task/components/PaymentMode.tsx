import React from 'react';

interface PaymentModeProps {
  mode?: string | null;
  className?: string;
}

export default function PaymentMode({ mode, className = '' }: PaymentModeProps) {
  if (!mode) {
    return null;
  }

  // Normalize mode text for consistent display
  const normalizedMode = mode.toLowerCase().trim();
  
  // Get appropriate icon and styling based on mode
  const getModeDisplay = (mode: string) => {
    switch (normalizedMode) {
      case 'cod':
      case 'cash on delivery':
      case 'cash':
        return {
          icon: '💵',
          text: 'Cash on Delivery',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'online':
      case 'card':
      case 'credit card':
      case 'debit card':
        return {
          icon: '💳',
          text: 'Online Payment',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'upi':
      case 'phonepe':
      case 'gpay':
      case 'paytm':
      case 'bharatpe':
        return {
          icon: '📱',
          text: 'UPI Payment',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      case 'wallet':
      case 'digital wallet':
        return {
          icon: '🏦',
          text: 'Wallet Payment',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'net banking':
      case 'nb':
        return {
          icon: '🏛️',
          text: 'Net Banking',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-200'
        };
      default:
        return {
          icon: '💳',
          text: mode,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const modeDisplay = getModeDisplay(mode);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${modeDisplay.bgColor} ${modeDisplay.textColor} ${modeDisplay.borderColor}`}>
        <span className="text-base">{modeDisplay.icon}</span>
        <span>{modeDisplay.text}</span>
      </div>
    </div>
  );
}
