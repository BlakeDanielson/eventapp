import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Weather service unavailable' },
        { status: 500 }
      );
    }

    // Fetch current weather data from OpenWeatherMap
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 404) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        );
      }
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Return processed weather data
    return NextResponse.json({
      name: weatherData.name,
      main: {
        temp: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
      },
      weather: [
        {
          main: weatherData.weather[0].main,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
        }
      ],
      wind: {
        speed: weatherData.wind.speed,
      },
      visibility: weatherData.visibility,
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 