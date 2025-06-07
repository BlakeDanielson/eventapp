'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapboxSearchSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  text: string;
  context?: Array<{ id: string; text: string }>;
}

interface MapboxSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: MapboxSearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MapboxSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = "Search for an address...",
  className = "",
  disabled = false
}: MapboxSearchInputProps) {
  const [suggestions, setSuggestions] = useState<MapboxSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (!query.trim() || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
        'autocomplete=true&' +
        'limit=5&' +
        'types=address,poi'
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const features = data.features || [];
      
      setSuggestions(features);
      setShowDropdown(features.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: MapboxSearchSuggestion) => {
    onChange(suggestion.place_name);
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const formatSuggestionText = (suggestion: MapboxSearchSuggestion) => {
    // Extract address components for better display
    const mainText = suggestion.text;
    const context = suggestion.context || [];
    
    // Find locality (city) and region (state/province)
    const locality = context.find(c => c.id.includes('place'))?.text;
    const region = context.find(c => c.id.includes('region'))?.text;
    
    let secondaryText = '';
    if (locality && region) {
      secondaryText = `${locality}, ${region}`;
    } else if (locality) {
      secondaryText = locality;
    } else if (region) {
      secondaryText = region;
    }

    return { mainText, secondaryText };
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 
            bg-gray-900 border border-gray-700 rounded-lg 
            text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isLoading ? 'pr-16' : value ? 'pr-10' : 'pr-4'}
          `}
        />

        {isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          </div>
        )}

        {value && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-700"
          >
            <X className="h-3 w-3 text-gray-400" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
        >
          {suggestions.map((suggestion, index) => {
            const { mainText, secondaryText } = formatSuggestionText(suggestion);
            const isSelected = index === selectedIndex;
            
            return (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors
                  border-b border-gray-700 last:border-b-0
                  ${isSelected ? 'bg-gray-800' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {mainText}
                    </div>
                    {secondaryText && (
                      <div className="text-gray-400 text-xs truncate">
                        {secondaryText}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && suggestions.length === 0 && value.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-4 py-3 text-gray-400 text-sm">
            No addresses found for &quot;{value}&quot;
          </div>
        </div>
      )}
    </div>
  );
} 