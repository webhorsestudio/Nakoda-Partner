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

  // Clean search logic - no debug code
  const filteredPartners = React.useMemo(() => {
    // If no search term, return all partners
    if (!searchTerm || searchTerm.trim() === '') {
      return partners;
    }

    const searchQuery = searchTerm.trim().toLowerCase();

    const results = partners.filter((partner) => {
      // Get all searchable fields with fallbacks
      const partnerName = String(partner.name || '').toLowerCase();
      const serviceType = String(partner.service_type || '').toLowerCase();
      const city = String(partner.city || '').toLowerCase();
      const mobile = String(partner.mobile || '');
      
      // Check each field for matches
      const nameMatch = partnerName.includes(searchQuery);
      const serviceMatch = serviceType.includes(searchQuery);
      const cityMatch = city.includes(searchQuery);
      const mobileMatch = mobile.includes(searchTerm);
      
      // Only do mobile clean match if search term contains digits
      const mobileCleanMatch = /\d/.test(searchTerm) ? 
        mobile.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) : false;
      
      return nameMatch || serviceMatch || cityMatch || mobileMatch || mobileCleanMatch;
    });

    return results;
  }, [partners, searchTerm]);


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
      const isInsideDropdown = target.closest('[data-partner-dropdown]');
      if (!isInsideDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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
            onClick={() => {
              console.log('🔍 Dropdown Button Clicked:', { isDisabled, showDropdown });
              if (!isDisabled) {
                setShowDropdown(!showDropdown);
              }
            }}
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
              <div className="p-2 border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, service, city, or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 pl-6 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <MagnifyingGlassIcon className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                </div>
              </div>
              
              {/* Search Results Counter */}
              {searchTerm && (
                <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100">
                  {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
                </div>
              )}

              {/* Partners List */}
              <div className="max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                        <div className="flex items-center justify-between">
                          <span>{partner.service_type} - {partner.city}</span>
                          <span className="text-xs text-gray-400">{partner.mobile}</span>
                        </div>
                        {partner.wallet_balance !== undefined && (
                          <div className="font-medium text-green-600 text-xs mt-1">
                            Wallet: ₹{partner.wallet_balance}
                          </div>
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
