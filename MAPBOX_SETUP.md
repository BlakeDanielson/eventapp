# Mapbox Setup Guide

## Why Mapbox?

✅ **Better Security** - API tokens feel more secure than exposed Google API keys  
✅ **Simpler Setup** - Less complex configuration and restrictions  
✅ **Better Performance** - Faster loading and smoother interactions  
✅ **Beautiful Maps** - Modern, customizable map styles  
✅ **Better Pricing** - More generous free tier and transparent pricing  

## Quick Setup (5 minutes)

### Step 1: Get Your Mapbox Access Token

1. Go to [mapbox.com](https://www.mapbox.com/) and create a free account
2. Navigate to [Account → Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your **Default Public Token** (starts with `pk.`)

### Step 2: Configure Your App

1. Add your token to your `.env` file:
   ```bash
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
   ```

2. That's it! No complex API restrictions needed.

### Step 3: Verify Setup

1. Start your development server: `npm run dev`
2. Create an event with an address
3. Visit the event page - you should see the beautiful Mapbox map
4. Test address autocomplete in the event creation form

## Features Included

✅ **Interactive Maps** - Dark, light, and satellite map styles  
✅ **Address Autocomplete** - Fast, accurate address search  
✅ **Geocoding** - Convert addresses to coordinates automatically  
✅ **Custom Markers** - Beautiful animated markers for event locations  
✅ **Popups** - Rich event information overlays  
✅ **Mobile Friendly** - Responsive design for all devices  

## Optional: API Token Restrictions

While Mapbox tokens are more secure by default, you can optionally restrict them:

1. Go to [Account → Access Tokens](https://account.mapbox.com/access-tokens/)
2. Click on your token
3. Add URL restrictions (e.g., `http://localhost:*`, `https://yourapp.com/*`)

## Free Tier Limits

- **50,000** map loads per month
- **50,000** geocoding requests per month
- **Unlimited** static map requests

This is typically more than enough for most event apps!

## Troubleshooting

**Maps not loading?**
- Check that your `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- Ensure the token starts with `pk.`
- Restart your development server after adding the token

**Address search not working?**
- Same token is used for maps and search
- Check browser console for any errors
- Verify you're within the free tier limits

## Migration Complete! 🎉

Your app now uses Mapbox for:
- 🗺️ Event location maps
- 🔍 Address autocomplete
- 📍 Geocoding services

No more complex Google Maps API key management! 