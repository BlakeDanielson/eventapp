# Google Maps API Setup

## Important Security Notice ⚠️

**Your Google Maps API key MUST be public** (`NEXT_PUBLIC_`) because it's used for client-side maps and autocomplete. However, this means it's visible to anyone who views your website. **Proper restrictions are CRITICAL** to prevent abuse and unexpected charges.

## Step 1: Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for interactive maps)
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for converting addresses to coordinates)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## Step 2: Configure API Key Restrictions (CRITICAL FOR SECURITY)

### Application Restrictions:
1. Click on your API key in the Credentials page
2. Under "Application restrictions":
   - Select **"HTTP referrers (web sites)"**
   - Add these patterns:
     ```
     http://localhost:3000/*          (for development)
     http://localhost:3001/*          (for development alternative port)
     https://yourdomain.com/*         (your production domain)
     https://*.yourdomain.com/*       (subdomains if needed)
     https://*.render.com/*           (if using Render for deployment)
     ```

### API Restrictions:
3. Under "API restrictions":
   - Select **"Restrict key"**
   - Choose ONLY these APIs:
     - ✅ Maps JavaScript API
     - ✅ Places API 
     - ✅ Geocoding API
   - ❌ Do NOT enable other APIs unless needed

### Additional Security Measures:
4. Set up **Quotas & Limits**:
   - Go to "APIs & Services" → "Quotas"
   - Set daily request limits for each API (e.g., 1000 requests/day for small apps)
   - Set up billing alerts in Google Cloud Console

5. **Monitor Usage**:
   - Enable detailed monitoring in Google Cloud Console
   - Set up alerts for unusual usage patterns
   - Review API usage weekly

## Step 3: Add to Environment Variables

Add this to your `.env` file:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Why `NEXT_PUBLIC_`?**
- Client-side Google Maps requires browser access to the API key
- This makes it visible in the browser, but restrictions prevent abuse
- Never use this key for server-side operations

## Step 4: Test the Integration

1. Run `npm run dev`
2. Go to `/create-event` - you should see autocomplete working in the address field
3. Visit an event page - you should see the Google Map instead of Mapbox
4. Check browser dev tools to verify API key restrictions are working

## Features Enabled

✅ **Interactive Maps** - Replace Mapbox with Google Maps  
✅ **Address Autocomplete** - Smart address suggestions in forms  
✅ **Geocoding** - Convert addresses to coordinates for mapping
✅ **Places Details** - Get detailed address components (city, state, zip, etc.)

## Security Best Practices

### ✅ Do:
- Always restrict your API key by domain/referrer
- Monitor API usage regularly
- Set up billing alerts
- Use quotas to limit daily usage
- Only enable APIs you actually use
- Rotate API keys periodically (every 90 days)

### ❌ Don't:
- Use an unrestricted API key
- Enable unnecessary Google APIs
- Ignore usage monitoring
- Use the same key for server-side operations
- Share your API key in public repositories

## Troubleshooting

- **"Geocoding failed: ZERO_RESULTS"** - Your API key might not have Geocoding API enabled
- **Map not loading** - Check that Maps JavaScript API is enabled
- **Autocomplete not working** - Verify Places API is enabled
- **Console errors about API key** - Make sure the key is in your .env file and restart dev server
- **"RefererNotAllowedMapError"** - Your domain is not in the HTTP referrers list
- **"ApiNotActivatedMapError"** - Enable the required APIs in Google Cloud Console

## API Usage & Costs

- Google Maps offers **$200/month free credits**
- **Maps JavaScript API**: ~$7 per 1,000 loads
- **Places API**: ~$17 per 1,000 requests  
- **Geocoding API**: ~$5 per 1,000 requests
- Typical usage for small events app should stay within free tier
- **Monitor usage** in Google Cloud Console regularly

## Emergency Response

If you suspect API key abuse:
1. **Immediately disable** the API key in Google Cloud Console
2. Check billing dashboard for unexpected charges
3. Create a new API key with proper restrictions
4. Update your environment variables
5. Deploy the updated configuration 