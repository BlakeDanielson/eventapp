# Google Maps API Setup

## Step 1: Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** 
   - **Geocoding API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## Step 2: Configure API Key Restrictions (Recommended)

1. Click on your API key in the Credentials page
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `http://localhost:3000/*` (for development)
   - Add your production domain when ready
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Places API, Geocoding API

## Step 3: Add to Environment Variables

Add this to your `.env` file:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 4: Test the Integration

1. Run `npm run dev`
2. Go to `/create-event` - you should see autocomplete working in the address field
3. Visit an event page - you should see the Google Map instead of Mapbox

## Features Enabled

✅ **Interactive Maps** - Replace Mapbox with Google Maps
✅ **Address Autocomplete** - Smart address suggestions in forms  
✅ **Geocoding** - Convert addresses to coordinates for mapping
✅ **Places Details** - Get detailed address components (city, state, zip, etc.)

## Troubleshooting

- **"Geocoding failed: ZERO_RESULTS"** - Your API key might not have Geocoding API enabled
- **Map not loading** - Check that Maps JavaScript API is enabled
- **Autocomplete not working** - Verify Places API is enabled
- **Console errors about API key** - Make sure the key is in your .env file and restart dev server

## API Usage & Costs

- Google Maps offers $200/month free credits
- Typical usage for small events app should stay within free tier
- Monitor usage in Google Cloud Console 