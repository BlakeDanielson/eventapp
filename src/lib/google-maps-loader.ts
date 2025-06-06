import { Loader } from '@googlemaps/js-api-loader';

// Singleton pattern for Google Maps loader
let mapsLoaderPromise: Promise<typeof google> | null = null;
let isGoogleMapsLoaded = false;

export const getGoogleMapsLoader = async (): Promise<typeof google> => {
  // If already loaded, return immediately
  if (isGoogleMapsLoaded && window.google?.maps) {
    return window.google;
  }

  // If loading is in progress, return the existing promise
  if (mapsLoaderPromise) {
    return mapsLoaderPromise;
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  // Create new loader instance with all required libraries
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geometry'], // Include all libraries needed by both components
    region: 'US',
    language: 'en'
  });

  // Store the promise to prevent multiple loads
  mapsLoaderPromise = loader.load().then((google) => {
    isGoogleMapsLoaded = true;
    return google;
  });

  return mapsLoaderPromise;
};

export const isGoogleMapsReady = (): boolean => {
  return isGoogleMapsLoaded && !!window.google?.maps;
}; 