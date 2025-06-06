'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Share2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Set Mapbox access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
}

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [is3D, setIs3D] = useState(false);

  // Geocode location to coordinates
  useEffect(() => {
    const geocodeLocation = async () => {
      if (!location || !mapboxgl.accessToken) return;
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&limit=1`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setCoordinates([lng, lat]);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    geocodeLocation();
  }, [location]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !coordinates || map.current) return;

    const mapStyles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11'
    };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: coordinates,
      zoom: 15,
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -17.6 : 0,
      antialias: true,
      projection: 'mercator' as const
    });

    // Custom event marker HTML
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-event-marker';
    markerElement.innerHTML = `
      <div class="marker-pulse"></div>
      <div class="marker-pin">
        <div class="marker-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="white" stroke-width="2" fill="currentColor"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      </div>
    `;

    // Add custom marker styles
    if (!document.getElementById('custom-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-marker-styles';
      style.textContent = `
        .custom-event-marker {
          position: relative;
          cursor: pointer;
        }
        
        .marker-pin {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          border: 3px solid white;
          position: relative;
          z-index: 2;
          animation: markerBounce 2s infinite;
        }
        
        .marker-icon {
          transform: rotate(45deg);
          color: white;
        }
        
        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        @keyframes markerBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: rotate(-45deg) translateY(0);
          }
          40% {
            transform: rotate(-45deg) translateY(-10px);
          }
          60% {
            transform: rotate(-45deg) translateY(-5px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Create popup content
    const popupContent = `
      <div class="event-popup">
        <div class="popup-header">
          <h3 class="popup-title">${eventTitle}</h3>
          <div class="popup-badges">
            <span class="popup-badge">Event Location</span>
          </div>
        </div>
        <div class="popup-content">
          <div class="popup-info">
            <div class="info-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${location}</span>
            </div>
            ${eventDate ? `
              <div class="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>${eventDate}${eventTime ? ` at ${eventTime}` : ''}</span>
              </div>
            ` : ''}
            ${organizerName ? `
              <div class="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Organized by ${organizerName}</span>
              </div>
            ` : ''}
          </div>
          <div class="popup-actions">
            <button class="popup-button primary" onclick="window.open('https://maps.google.com/search/?api=1&query=${encodeURIComponent(location)}', '_blank')">
              Get Directions
            </button>
            <button class="popup-button secondary" onclick="navigator.share ? navigator.share({title: '${eventTitle}', text: 'Join me at ${eventTitle}', url: window.location.href}) : navigator.clipboard.writeText(window.location.href)">
              Share Event
            </button>
          </div>
        </div>
      </div>
    `;

    // Add popup styles
    if (!document.getElementById('popup-styles')) {
      const popupStyle = document.createElement('style');
      popupStyle.id = 'popup-styles';
      popupStyle.textContent = `
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          max-width: 320px;
        }
        
        .event-popup {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .popup-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
        }
        
        .popup-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .popup-badges {
          display: flex;
          gap: 6px;
        }
        
        .popup-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .popup-content {
          padding: 16px;
          background: white;
          border-radius: 0 0 12px 12px;
        }
        
        .popup-info {
          margin-bottom: 16px;
        }
        
        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #374151;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
        .info-row svg {
          color: #667eea;
          flex-shrink: 0;
        }
        
        .popup-actions {
          display: flex;
          gap: 8px;
        }
        
        .popup-button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .popup-button.primary {
          background: #667eea;
          color: white;
        }
        
        .popup-button.primary:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }
        
        .popup-button.secondary {
          background: #f3f4f6;
          color: #374151;
        }
        
        .popup-button.secondary:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(popupStyle);
    }

    // Create marker with popup
    const popup = new mapboxgl.Popup({
      offset: [0, -40],
      closeButton: false,
      className: 'custom-event-popup'
    }).setHTML(popupContent);

    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'bottom'
    })
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map.current);

    // Show popup initially
    marker.togglePopup();

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add map style loaded event
    map.current.on('load', () => {
      setLoading(false);
      
      if (is3D) {
        // Add 3D buildings
        map.current?.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#e0e7ff',
              50, '#c7d2fe',
              100, '#a5b4fc',
              200, '#8b5cf6'
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.8
          }
        });

        // Add sky layer for atmosphere
        map.current?.addLayer({
          'id': 'sky',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, mapStyle, is3D, eventTitle, eventDate, eventTime, organizerName, location]);

  // Handle style changes
  const handleStyleChange = (newStyle: 'streets' | 'satellite' | 'dark') => {
    if (map.current && newStyle !== mapStyle) {
      const mapStyles = {
        streets: 'mapbox://styles/mapbox/streets-v12',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
        dark: 'mapbox://styles/mapbox/dark-v11'
      };
      
      map.current.setStyle(mapStyles[newStyle]);
      setMapStyle(newStyle);
    }
  };

  // Toggle 3D view
  const toggle3D = () => {
    if (map.current) {
      const newIs3D = !is3D;
      setIs3D(newIs3D);
      
      map.current.easeTo({
        pitch: newIs3D ? 60 : 0,
        bearing: newIs3D ? -17.6 : 0,
        duration: 2000
      });
    }
  };

  if (!mapboxgl.accessToken) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Map Configuration Needed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please add your Mapbox API key to display the interactive map.
          </p>
          <div className="text-sm bg-muted p-3 rounded">
            <strong>Location:</strong> {location}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin">
              <Globe className="h-5 w-5" />
            </div>
            <span>Loading interactive map...</span>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Card className="p-2">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mapStyle === 'streets' ? 'default' : 'ghost'}
              onClick={() => handleStyleChange('streets')}
              className="text-xs h-7"
            >
              Streets
            </Button>
            <Button
              size="sm"
              variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
              onClick={() => handleStyleChange('satellite')}
              className="text-xs h-7"
            >
              Satellite
            </Button>
            <Button
              size="sm"
              variant={mapStyle === 'dark' ? 'default' : 'ghost'}
              onClick={() => handleStyleChange('dark')}
              className="text-xs h-7"
            >
              Dark
            </Button>
          </div>
        </Card>
        
        <Card className="p-2">
          <Button
            size="sm"
            variant={is3D ? 'default' : 'ghost'}
            onClick={toggle3D}
            className="text-xs h-7"
          >
            {is3D ? '2D' : '3D'}
          </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          onClick={() => window.open(`https://maps.google.com/search/?api=1&query=${encodeURIComponent(location)}`, '_blank')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Navigation className="h-4 w-4 mr-1" />
          Directions
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: eventTitle,
                text: `Join me at ${eventTitle}`,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[400px]"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
} 