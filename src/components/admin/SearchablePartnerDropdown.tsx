"use client";

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Partner {
  id: number;
  name: string;
  service_type: string;
  status: string;
  city: string;
  mobile: string;
  wallet_balance?: number;
}

interface SearchablePartnerDropdownProps {
  partners: Partner[];
  selectedPartner: number | null;
  onPartnerSelect: (partnerId: number) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const SearchablePartnerDropdown: React.FC<SearchablePartnerDropdownProps> = ({
  partners,
  selectedPartner,
  onPartnerSelect,
  loading = false,
  disabled = false,
  placeholder = "Choose a partner...",
  label = "Select Partner:",
  className = ""
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter partners based on search term
  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset search when dropdown closes
  useEffect(() => {
    if (!showDropdown) {
      setSearchTerm('');
    }
  }, [showDropdown]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-partner-dropdown]')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPartnerData = partners.find(p => p.id === selectedPartner);
  const isDisabled = disabled || loading || partners.length === 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {loading && (
        <div className="text-sm text-gray-500">Loading partners...</div>
      )}
      
      {partners.length > 0 && (
        <div className="relative" data-partner-dropdown>
          <button
            type="button"
            onClick={() => !isDisabled && setShowDropdown(!showDropdown)}
            disabled={isDisabled}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <span className={isDisabled ? 'text-gray-400' : 'text-gray-900'}>
              {selectedPartnerData ? (
                <div>
                  <div className="font-medium">{selectedPartnerData.name}</div>
                  {selectedPartnerData.wallet_balance !== undefined && (
                    <div className="text-xs text-green-600">
                      Wallet: ₹{selectedPartnerData.wallet_balance}
                    </div>
                  )}
                </div>
              ) : (
                placeholder
              )}
            </span>
            <svg 
              className={`ml-2 h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''} ${isDisabled ? 'text-gray-400' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && !isDisabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
              {/* Search Input Inside Dropdown */}
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search partners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 pl-6 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <MagnifyingGlassIcon className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                </div>
              </div>
              
              {/* Partners List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => {
                        onPartnerSelect(partner.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-xs text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                        selectedPartner === partner.id ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-gray-500">
                        {partner.service_type} - {partner.city}
                        {partner.wallet_balance !== undefined && (
                          <span className="font-medium text-green-600 ml-2">
                            • Wallet: ₹{partner.wallet_balance}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    {searchTerm ? `No partners found matching "${searchTerm}"` : 'No partners available'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!loading && partners.length === 0 && (
        <div className="text-sm text-gray-500">No active partners available</div>
      )}
    </div>
  );
};
