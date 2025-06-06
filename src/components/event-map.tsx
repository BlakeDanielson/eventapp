'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Share2, Layers, Mountain } from 'lucide-react';
import { getGoogleMapsLoader } from '@/lib/google-maps-loader';
import { Button } from '@/components/ui/button';

interface EventMapProps {
  location: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  organizerName?: string;
  className?: string;
}

export function EventMap({ 
  location, 
  eventTitle, 
  eventDate, 
  eventTime, 
  organizerName,
  className = '' 
}: EventMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Modern container ref callback pattern (avoids timing issues)
  const mapContainerCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      mapContainer.current = node;
    }
  }, []);

  // Modern Google Maps initialization with proper error handling
  const initializeMap = useCallback(async () => {
    if (!location || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError(!location ? 'No location provided' : 'Google Maps API key not configured');
      setLoading(false);
      return;
    }

    try {
      // Wait for container to be ready with retry mechanism
      let retries = 0;
      while (!mapContainer.current && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!mapContainer.current) {
        throw new Error('Map container not found after retries');
      }

      // Use shared Google Maps loader to avoid conflicts
      await getGoogleMapsLoader();
      
      // Modern geocoding with proper error handling
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await geocoder.geocode({ address: location });
      
      if (geocodeResult.results.length === 0) {
        throw new Error('Location not found');
      }

      const coordinates = geocodeResult.results[0].geometry.location;

             // Modern map creation with readable dark theme
       const mapInstance = new google.maps.Map(mapContainer.current, {
         center: coordinates,
         zoom: 15,
         mapTypeId: mapType,
         gestureHandling: 'cooperative',
         zoomControl: true,
         streetViewControl: false,
         fullscreenControl: false,
         mapTypeControl: false,
         clickableIcons: false,
         styles: [
           // Base map background
           {
             featureType: 'all',
             elementType: 'geometry',
             stylers: [{ color: '#2d3748' }]
           },
           // Roads - lighter for visibility
           {
             featureType: 'road',
             elementType: 'geometry',
             stylers: [{ color: '#4a5568' }]
           },
           {
             featureType: 'road.highway',
             elementType: 'geometry',
             stylers: [{ color: '#553c9a' }]
           },
           {
             featureType: 'road.arterial',
             elementType: 'geometry',
             stylers: [{ color: '#4a5568' }]
           },
           // Text labels - white for contrast
           {
             featureType: 'all',
             elementType: 'labels.text.fill',
             stylers: [{ color: '#ffffff' }]
           },
           {
             featureType: 'all',
             elementType: 'labels.text.stroke',
             stylers: [{ color: '#000000' }, { weight: 2 }]
           },
           // Water - dark blue
           {
             featureType: 'water',
             elementType: 'geometry',
             stylers: [{ color: '#1a365d' }]
           },
           {
             featureType: 'water',
             elementType: 'labels.text.fill',
             stylers: [{ color: '#93c5fd' }]
           },
           // Buildings - subtle gray
           {
             featureType: 'landscape.man_made',
             elementType: 'geometry',
             stylers: [{ color: '#374151' }]
           },
           // Parks and green areas
           {
             featureType: 'landscape.natural',
             elementType: 'geometry',
             stylers: [{ color: '#065f46' }]
           },
           {
             featureType: 'poi.park',
             elementType: 'geometry',
             stylers: [{ color: '#065f46' }]
           },
           // Hide clutter but keep important POIs
           {
             featureType: 'poi.business',
             elementType: 'labels',
             stylers: [{ visibility: 'off' }]
           },
           {
             featureType: 'poi.medical',
             elementType: 'labels.icon',
             stylers: [{ visibility: 'off' }]
           },
           // Transit lines
           {
             featureType: 'transit.line',
             elementType: 'geometry',
             stylers: [{ color: '#553c9a' }, { weight: 1 }]
           }
         ]
       });

      map.current = mapInstance;

      // Modern marker creation
      const markerInstance = new google.maps.Marker({
        position: coordinates,
        map: mapInstance,
        title: eventTitle,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });

      marker.current = markerInstance;

      // Create info window content using modern DOM creation
      const infoContent = document.createElement('div');
      infoContent.className = 'max-w-sm bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700';
      infoContent.innerHTML = `
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 relative">
          <button onclick="arguments[0].stopPropagation(); window.closeInfoWindow && window.closeInfoWindow();" 
                  class="absolute top-3 right-3 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <h3 class="font-bold text-lg mb-1 pr-8">${eventTitle}</h3>
          <span class="inline-block bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Event Location</span>
        </div>
        <div class="p-4 space-y-3">
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>${location}</span>
          </div>
          ${eventDate ? `
            <div class="flex items-center gap-2 text-sm text-gray-300">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>${eventDate}${eventTime ? ` at ${eventTime}` : ''}</span>
            </div>
          ` : ''}
          ${organizerName ? `
            <div class="flex items-center gap-2 text-sm text-gray-300">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Organized by ${organizerName}</span>
            </div>
          ` : ''}
          <div class="flex gap-2 pt-2">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}', '_blank', 'noopener,noreferrer')" 
                    class="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              Get Directions
            </button>
            <button onclick="navigator.share ? navigator.share({title: '${eventTitle}', text: 'Check out this event location', url: window.location.href}) : navigator.clipboard.writeText(window.location.href)"
                    class="flex-1 bg-gray-700 text-gray-200 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
              Share
            </button>
          </div>
        </div>
      `;

      // Set up close functionality
      (window as any).closeInfoWindow = () => {
        if (infoWindow.current) {
          infoWindow.current.close();
        }
      };

      // Modern InfoWindow with proper positioning and no default styling
      const infoWindowInstance = new google.maps.InfoWindow({
        content: infoContent,
        maxWidth: 350,
        pixelOffset: new google.maps.Size(0, -10),
        disableAutoPan: false
      });

      infoWindow.current = infoWindowInstance;
      infoWindowInstance.open(mapInstance, markerInstance);

      // Remove default InfoWindow styling to eliminate white outer section
      google.maps.event.addListener(infoWindowInstance, 'domready', () => {
        const iwOuter = document.querySelector('.gm-style-iw');
        const iwBackground = document.querySelector('.gm-style-iw-d');
        const iwCloseBtn = document.querySelector('.gm-style-iw-chr');
        const iwContainer = document.querySelector('.gm-style-iw-c');
        const iwTail = document.querySelector('.gm-style-iw-tc');
        
        if (iwOuter) {
          (iwOuter as HTMLElement).style.padding = '0px';
          (iwOuter as HTMLElement).style.background = 'transparent';
          (iwOuter as HTMLElement).style.border = 'none';
          (iwOuter as HTMLElement).style.borderRadius = '8px';
          (iwOuter as HTMLElement).style.boxShadow = 'none';
          (iwOuter as HTMLElement).style.overflow = 'visible';
        }
        
        if (iwBackground) {
          (iwBackground as HTMLElement).style.background = 'transparent';
          (iwBackground as HTMLElement).style.border = 'none';
          (iwBackground as HTMLElement).style.borderRadius = '8px';
          (iwBackground as HTMLElement).style.boxShadow = 'none';
          (iwBackground as HTMLElement).style.overflow = 'visible';
        }
        
        if (iwContainer) {
          (iwContainer as HTMLElement).style.background = 'transparent';
          (iwContainer as HTMLElement).style.border = 'none';
          (iwContainer as HTMLElement).style.borderRadius = '8px';
          (iwContainer as HTMLElement).style.boxShadow = 'none';
          (iwContainer as HTMLElement).style.padding = '0px';
          (iwContainer as HTMLElement).style.overflow = 'visible';
        }
        
        // Hide the tail/pointer and make it transparent
        if (iwTail) {
          (iwTail as HTMLElement).style.background = 'transparent';
          (iwTail as HTMLElement).style.border = 'none';
          (iwTail as HTMLElement).style.boxShadow = 'none';
        }
        
        // Hide default close button since we have our own
        if (iwCloseBtn) {
          (iwCloseBtn as HTMLElement).style.display = 'none';
        }
        
        // Target any remaining white elements that might be showing
        const allGmStyleElements = document.querySelectorAll('[class*="gm-style-iw"]');
        allGmStyleElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          if (htmlElement.style.background === 'white' || htmlElement.style.backgroundColor === 'white') {
            htmlElement.style.background = 'transparent';
            htmlElement.style.backgroundColor = 'transparent';
          }
          if (htmlElement.style.border && htmlElement.style.border.includes('white')) {
            htmlElement.style.border = 'none';
          }
        });
      });

      setLoading(false);

    } catch (error) {
      console.error('Modern map initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load map');
      setLoading(false);
    }
  }, [location, eventTitle, eventDate, eventTime, organizerName, mapType]);

  // Effect with proper cleanup using modern patterns
  useEffect(() => {
    initializeMap();

    return () => {
      // Modern cleanup approach
      if (marker.current) {
        marker.current.setMap(null);
      }
      if (infoWindow.current) {
        infoWindow.current.close();
      }
      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current);
      }
    };
  }, [initializeMap]);

  const handleMapTypeChange = useCallback((type: 'roadmap' | 'satellite' | 'terrain') => {
    setMapType(type);
    if (map.current) {
      map.current.setMapTypeId(type);
    }
  }, []);

  const handleDirections = useCallback(() => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [location]);

  const handleShare = useCallback(async () => {
    if (!location) return;
    
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Check out this location: ${location}`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Modern clipboard API fallback
      try {
        await navigator.clipboard.writeText(url);
      } catch (error) {
        console.warn('Could not copy to clipboard');
      }
    }
  }, [location, eventTitle]);

  if (error) {
    return (
      <div className={`bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center ${className}`}>
        <MapPin className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
        <h3 className="text-lg font-semibold text-white mb-2">Map Unavailable</h3>
        <p className="text-zinc-400 mb-4">{error}</p>
        <p className="text-sm text-zinc-500">{location}</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden ${className}`}>
      {/* Modern Map Controls with proper z-index */}
      <div className="absolute top-4 left-4 z-[100] flex gap-2">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-1 flex gap-1">
          <Button
            variant={mapType === 'roadmap' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleMapTypeChange('roadmap')}
            className="h-8 px-3 text-xs"
          >
            <Navigation className="w-3 h-3 mr-1" />
            Streets
          </Button>
          <Button
            variant={mapType === 'satellite' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleMapTypeChange('satellite')}
            className="h-8 px-3 text-xs"
          >
            <Layers className="w-3 h-3 mr-1" />
            Satellite
          </Button>
          <Button
            variant={mapType === 'terrain' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleMapTypeChange('terrain')}
            className="h-8 px-3 text-xs"
          >
            <Mountain className="w-3 h-3 mr-1" />
            Terrain
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDirections}
          className="bg-black/70 backdrop-blur-sm hover:bg-black/80"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Directions
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShare}
          className="bg-black/70 backdrop-blur-sm hover:bg-black/80"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Modern Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-[50]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Container with modern ref callback pattern */}
      <div 
        ref={mapContainerCallback}
        className="w-full h-[600px]"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
} 