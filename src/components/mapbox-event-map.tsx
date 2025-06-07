'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxEventMapProps {
  location: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  organizerName?: string;
  className?: string;
}

export function MapboxEventMap({ 
  location, 
  eventTitle, 
  eventDate, 
  eventTime, 
  organizerName,
  className = '' 
}: MapboxEventMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('dark');

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setError(!process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Mapbox API key not configured' : 'Map container not found');
      setLoading(false);
      return;
    }

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const initializeMap = async () => {
      try {
        // Initialize map
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: getMapStyle(mapStyle),
          center: [-74.5, 40], // Default center (will be updated after geocoding)
          zoom: 15,
          pitch: 0,
          bearing: 0
        });

        map.current = mapInstance;

        // Geocode the location using Mapbox Geocoding API
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&limit=1`
        );

        if (!geocodeResponse.ok) {
          throw new Error('Failed to geocode location');
        }

        const geocodeData = await geocodeResponse.json();

        if (!geocodeData.features || geocodeData.features.length === 0) {
          throw new Error('Location not found');
        }

        const [lng, lat] = geocodeData.features[0].center;
        const placeName = geocodeData.features[0].place_name;

        // Update map center
        mapInstance.setCenter([lng, lat]);

        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = `
          <div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
          </div>
        `;

        // Add marker
        const markerInstance = new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .addTo(mapInstance);

        marker.current = markerInstance;

        // Create popup content
        const popupContent = `
          <div class="max-w-sm bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700 text-white">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <h3 class="font-bold text-lg mb-1">${eventTitle}</h3>
              <span class="inline-block bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Event Location</span>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex items-center gap-2 text-sm text-gray-300">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>${placeName}</span>
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
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeName)}', '_blank')" 
                        class="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Get Directions
                </button>
                <button onclick="navigator.share ? navigator.share({title: '${eventTitle}', text: 'Check out this event location', url: window.location.href}) : navigator.clipboard.writeText(window.location.href)"
                        class="flex-1 bg-gray-700 text-gray-200 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        `;

        // Add popup to marker
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup'
        }).setHTML(popupContent);

        markerInstance.setPopup(popup);

        // Show popup by default
        popup.addTo(mapInstance);
        markerInstance.getPopup()?.addTo(mapInstance);

        setLoading(false);

      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize map');
        setLoading(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [location, eventTitle, eventDate, eventTime, organizerName, mapStyle]);

  const getMapStyle = (style: string) => {
    switch (style) {
      case 'light':
        return 'mapbox://styles/mapbox/light-v11';
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'dark':
      default:
        return 'mapbox://styles/mapbox/dark-v11';
    }
  };

  const handleStyleChange = (newStyle: 'light' | 'dark' | 'satellite') => {
    setMapStyle(newStyle);
    if (map.current) {
      map.current.setStyle(getMapStyle(newStyle));
    }
  };

  if (loading) {
    return (
      <div className={`relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 ${className}`} style={{ height: '400px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 ${className}`} style={{ height: '400px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto px-6">
            <MapPin className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-medium mb-2">Map Unavailable</h3>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <p className="text-white/40 text-xs">{location}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 ${className}`} style={{ height: '400px' }}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex">
          <Button
            variant={mapStyle === 'dark' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleStyleChange('dark')}
            className="rounded-none border-0 text-xs"
          >
            Dark
          </Button>
          <Button
            variant={mapStyle === 'light' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleStyleChange('light')}
            className="rounded-none border-0 border-l border-gray-700 text-xs"
          >
            Light
          </Button>
          <Button
            variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleStyleChange('satellite')}
            className="rounded-none border-0 border-l border-gray-700 text-xs"
          >
            Satellite
          </Button>
        </div>
      </div>

      {/* Location badge */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-medium">{eventTitle}</span>
        </div>
      </div>
    </div>
  );
} 