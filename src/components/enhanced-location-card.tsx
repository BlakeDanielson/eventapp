'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Navigation, Share2, ExternalLink, Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: [
    {
      main: string;
      description: string;
      icon: string;
    }
  ];
  wind: {
    speed: number;
  };
  visibility: number;
  name: string;
}

interface EnhancedLocationCardProps {
  location: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  organizerName?: string;
}

const getWeatherIcon = (iconCode: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    '01d': <Sun className="h-8 w-8 text-yellow-500" />,
    '01n': <Sun className="h-8 w-8 text-yellow-400" />,
    '02d': <Cloud className="h-8 w-8 text-gray-400" />,
    '02n': <Cloud className="h-8 w-8 text-gray-500" />,
    '03d': <Cloud className="h-8 w-8 text-gray-500" />,
    '03n': <Cloud className="h-8 w-8 text-gray-600" />,
    '04d': <Cloud className="h-8 w-8 text-gray-600" />,
    '04n': <Cloud className="h-8 w-8 text-gray-700" />,
    '09d': <CloudRain className="h-8 w-8 text-blue-500" />,
    '09n': <CloudRain className="h-8 w-8 text-blue-600" />,
    '10d': <CloudRain className="h-8 w-8 text-blue-500" />,
    '10n': <CloudRain className="h-8 w-8 text-blue-600" />,
    '11d': <CloudRain className="h-8 w-8 text-purple-500" />,
    '11n': <CloudRain className="h-8 w-8 text-purple-600" />,
    '13d': <Cloud className="h-8 w-8 text-blue-200" />,
    '13n': <Cloud className="h-8 w-8 text-blue-300" />,
    '50d': <Cloud className="h-8 w-8 text-gray-400" />,
    '50n': <Cloud className="h-8 w-8 text-gray-500" />,
  };
  return iconMap[iconCode] || <Sun className="h-8 w-8 text-yellow-500" />;
};

const getWeatherBackground = (iconCode: string) => {
  if (iconCode.includes('01')) return 'from-yellow-400/20 to-orange-400/20';
  if (iconCode.includes('02') || iconCode.includes('03')) return 'from-blue-400/20 to-gray-400/20';
  if (iconCode.includes('04')) return 'from-gray-400/20 to-gray-600/20';
  if (iconCode.includes('09') || iconCode.includes('10')) return 'from-blue-500/20 to-blue-700/20';
  if (iconCode.includes('11')) return 'from-purple-500/20 to-purple-700/20';
  if (iconCode.includes('13')) return 'from-blue-200/20 to-white/20';
  return 'from-blue-400/20 to-blue-600/20';
};

export function EnhancedLocationCard({ 
  location, 
  eventTitle, 
  eventDate, 
  eventTime, 
  organizerName 
}: EnhancedLocationCardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Extract city name from location for weather API
        const cityName = location.split(',')[0].trim();
        
        const response = await fetch(
          `/api/weather?city=${encodeURIComponent(cityName)}`
        );
        
        if (!response.ok) {
          throw new Error('Weather data unavailable');
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather');
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const handleDirections = () => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: eventTitle,
      text: `Join me at ${eventTitle} on ${eventDate} at ${location}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      // You could add a toast notification here
    }
  };

  const weatherIcon = weatherData?.weather[0]?.icon;
  const backgroundClass = weatherIcon ? getWeatherBackground(weatherIcon) : 'from-blue-400/20 to-blue-600/20';

  return (
    <Card className="group relative overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${backgroundClass} transition-all duration-500 group-hover:opacity-80`} />
      
      {/* Main Content */}
      <CardContent className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Event Location</h3>
              <p className="text-gray-600">Get directions and weather info</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleDirections}
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </Button>
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Location Info */}
        <div className="mb-6">
          <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
            <MapPin className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-lg leading-relaxed">{location}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏰</span>
                  <span>{eventTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Weather Forecast</h4>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading weather...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-sm">⚠️ {error}</p>
            </div>
          )}

          {weatherData && !loading && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6">
              {/* Main Weather Display */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getWeatherIcon(weatherData.weather[0].icon)}
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(weatherData.main.temp)}°C
                    </p>
                    <p className="text-gray-600 capitalize">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Feels like</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {Math.round(weatherData.main.feels_like)}°C
                  </p>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                  <Wind className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Wind</p>
                    <p className="font-semibold text-gray-900">
                      {Math.round(weatherData.wind.speed * 3.6)} km/h
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Humidity</p>
                    <p className="font-semibold text-gray-900">
                      {weatherData.main.humidity}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Pressure</p>
                    <p className="font-semibold text-gray-900">
                      {weatherData.main.pressure} hPa
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Visibility</p>
                    <p className="font-semibold text-gray-900">
                      {Math.round(weatherData.visibility / 1000)} km
                    </p>
                  </div>
                </div>
              </div>

              {/* Weather Recommendations */}
              <div className="mt-4 p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  {getWeatherRecommendation(weatherData)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* External Link */}
        <div className="mt-6 pt-4 border-t border-gray-200/50">
          <Button
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank')}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900 hover:bg-white/60 backdrop-blur-sm transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getWeatherRecommendation(weather: WeatherData): string {
  const temp = weather.main.temp;
  const condition = weather.weather[0].main.toLowerCase();
  const humidity = weather.main.humidity;
  
  if (condition.includes('rain')) {
    return "☔ Rain expected - bring an umbrella and consider waterproof clothing.";
  } else if (condition.includes('snow')) {
    return "❄️ Snow expected - dress warmly and allow extra travel time.";
  } else if (temp > 30) {
    return "☀️ Hot weather - stay hydrated and consider lightweight, breathable clothing.";
  } else if (temp < 5) {
    return "🧥 Cold weather - dress in layers and bring warm accessories.";
  } else if (humidity > 80) {
    return "💧 High humidity - light, breathable fabrics recommended.";
  } else if (condition.includes('clear')) {
    return "☀️ Perfect weather for the event - enjoy the clear skies!";
  } else {
    return "🌤️ Pleasant conditions expected - great weather for the event!";
  }
} 