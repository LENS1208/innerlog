# Deployment Guide

## Environment Configuration

### Critical: Database Connection

**CORRECT DATABASE (Use this):**
- Database ID: `xvqpsnrcmkvngxrinjyf`
- URL: `https://xvqpsnrcmkvngxrinjyf.supabase.co`

**OLD DATABASE (DO NOT USE):**
- Database ID: `zcflpkmxeupharqbaymc`
- URL: `https://zcflpkmxeupharqbaymc.supabase.co`
- Status: ⛔ DEPRECATED

### Required Environment Variables

```bash
VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAzNTEsImV4cCI6MjA3ODM2NjM1MX0.1Mp4Do6fX_7Q_WsKipbDkxHbeNCVGWB6fqiWVForBfc
```

## Deployment Platforms

### Vercel

1. Go to Project Settings → Environment Variables
2. Add the following variables:
   - `VITE_SUPABASE_URL` = `https://xvqpsnrcmkvngxrinjyf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (copy from .env.production)
3. Deploy

### Netlify

1. Go to Site Settings → Environment Variables
2. Add the same variables as above
3. Deploy

### Other Platforms

Copy the values from `.env.production` to your platform's environment variable settings.

## Validation

The application includes automatic environment validation. If connected to the wrong database:
- ❌ The app will throw an error at startup
- 🔴 Browser console will show: "CRITICAL ERROR: Connected to OLD database"
- ⛔ The application will not initialize

If you see this error, check your environment variables immediately.

## Testing Database Connection

Before deploying, run:

```bash
./check-db.sh
```

This script will verify you're connected to the correct database.

## Local Development

```bash
# Copy production config to local
cp .env.production .env

# Verify connection
./check-db.sh

# Start development server
npm run dev
```

## Build

```bash
npm run build
```

The build will fail if environment variables are incorrect.

## Support

If you encounter database connection issues:
1. Run `./check-db.sh` to diagnose
2. Check browser console for validation errors
3. Verify environment variables match `.env.production`
