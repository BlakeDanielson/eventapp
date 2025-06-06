'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { getGoogleMapsLoader } from '@/lib/google-maps-loader';

interface GoogleMapsAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (place: {
    address: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}



export function GoogleMapsAutocomplete({
  value = '',
  onChange,
  onPlaceSelect,
  placeholder = 'Enter an address',
  className = '',
  disabled = false
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || !inputRef.current) {
        return;
      }

      try {
        // Use singleton loader
        await getGoogleMapsLoader();

        // Create autocomplete instance
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          fields: [
            'formatted_address',
            'address_components',
            'geometry',
            'name',
            'place_id'
          ]
        });

        // Add place selection listener
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (!place || !place.geometry) {
            return;
          }

          const address = place.formatted_address || '';
          setInputValue(address);
          onChange?.(address);

          // Parse address components
          const addressComponents = place.address_components || [];
          const parsedAddress = {
            address,
            streetAddress: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            coordinates: {
              lat: place.geometry.location?.lat() || 0,
              lng: place.geometry.location?.lng() || 0
            }
          };

          // Extract address components
          addressComponents.forEach((component) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              parsedAddress.streetAddress = component.long_name + ' ';
            } else if (types.includes('route')) {
              parsedAddress.streetAddress += component.long_name;
            } else if (types.includes('locality')) {
              parsedAddress.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              parsedAddress.state = component.short_name;
            } else if (types.includes('country')) {
              parsedAddress.country = component.long_name;
            } else if (types.includes('postal_code')) {
              parsedAddress.zipCode = component.long_name;
            }
          });

          onPlaceSelect?.(parsedAddress);
        });

        setIsLoaded(true);

      } catch (error) {
        console.error('Error loading Google Maps Places API:', error);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onPlaceSelect]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
        <div className="text-xs text-zinc-500 mt-1">
          Google Maps API key required for autocomplete
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          disabled={disabled}
        />
      </div>
      {!isLoaded && (
        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
          <div className="animate-spin h-3 w-3 border border-zinc-600 border-t-white rounded-full"></div>
          Loading autocomplete...
        </div>
      )}
    </div>
  );
} 