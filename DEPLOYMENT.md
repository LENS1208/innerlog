# Deployment Guide

**最終更新: 2025-11-17**

## Environment Configuration

### Critical: Database Connection

**✅ CORRECT DATABASE (Use this):**
```
Database ID: xvqpsnrcmkvngxrinjyf
URL: https://xvqpsnrcmkvngxrinjyf.supabase.co
```

**⛔ OLD DATABASE (DO NOT USE):**
```
Database ID: zcflpkmxeupharqbaymc
URL: https://zcflpkmxeupharqbaymc.supabase.co
Status: DEPRECATED
```

### Required Environment Variables

Copy these exact values from `DATABASE_CONFIG.md`:

```bash
VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MDQyOTksImV4cCI6MjA0NzM4MDI5OX0.kgzf7yWMwzg9Y1IHpRmYAVD-CJWQQ_yxZTLxzUq_4Jw
```

## Pre-Deployment Checklist

- [ ] Verify `.env` file contains correct database credentials
- [ ] Run `./check-db.sh` to validate database connection
- [ ] Clear Vite cache: `rm -rf dist node_modules/.vite .vite`
- [ ] Run `npm run build` successfully
- [ ] Test login with: `takuan_1000@yahoo.co.jp` / `test2025`

## Deployment Platforms

### Vercel

1. **Set Environment Variables:**
   - Go to: Project Settings → Environment Variables
   - Add/Update:
     - `VITE_SUPABASE_URL` = `https://xvqpsnrcmkvngxrinjyf.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = (copy from DATABASE_CONFIG.md)

2. **Deploy with Cache Clear:**
   - Go to: Deployments
   - Click on latest deployment → ⋯ (three dots)
   - Select: **Redeploy** → Check **Clear cache** → **Redeploy**

3. **Verify:**
   - Open deployed app
   - Clear browser cache (F12 → Application → Clear storage)
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   - Test login

### Netlify

1. **Set Environment Variables:**
   - Go to: Site settings → Environment variables
   - Add/Update the same variables as Vercel

2. **Deploy with Cache Clear:**
   - Go to: Deploys
   - Click: **Trigger deploy** → **Clear cache and deploy**

3. **Verify:**
   - Same verification steps as Vercel

### Other Platforms

1. Copy values from `DATABASE_CONFIG.md`
2. Set environment variables in your platform's settings
3. **Important:** Clear cache during deployment
4. Verify deployment with browser cache cleared

## Post-Deployment Verification

### Automatic Validation

The app includes automatic database validation:
- ✅ Connects to correct database → App starts normally
- ❌ Connects to wrong database → Error displayed in console
- ⛔ Missing environment variables → Build fails

### Manual Verification

1. **Check Browser Console:**
   ```
   ✅ Should see: "Supabase client initialized successfully"
   ✅ Should see: "Using database: https://xvqpsnrcmkvngxrinjyf.supabase.co"
   ```

2. **Test Login:**
   ```
   Email: takuan_1000@yahoo.co.jp
   Password: test2025
   ```

3. **Verify Data:**
   - Check if trades are visible
   - Verify user settings load correctly

## Troubleshooting

### Error: "Connected to OLD database"

**Cause:** Environment variables pointing to deprecated database

**Solution:**
1. Update environment variables in deployment platform
2. Clear deployment cache
3. Redeploy
4. Clear browser cache and hard refresh

### Error: "Missing environment variables"

**Cause:** Environment variables not set in deployment platform

**Solution:**
1. Go to platform's environment variable settings
2. Copy correct values from `DATABASE_CONFIG.md`
3. Save and redeploy

### App loads but data is missing

**Cause:** Browser cache contains old connection

**Solution:**
1. Open DevTools (F12)
2. Application tab → Clear storage
3. Click "Clear site data"
4. Close and reopen browser
5. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

## Local Development

### Initial Setup

```bash
# Verify environment configuration
cat DATABASE_CONFIG.md

# Copy correct configuration
cp .env.example .env

# Verify database connection
./check-db.sh

# Install dependencies
npm install

# Build
npm run build
```

### After Pulling Changes

```bash
# Check database configuration
./check-db.sh

# If incorrect, fix it
cp .env.example .env

# Clear cache and rebuild
rm -rf dist node_modules/.vite .vite
npm run build
```

## Cache Management

### Why Cache Matters

Vite embeds environment variables at **build time**. Old cached builds contain old credentials.

### Clear Cache Locations

1. **Vite Build Cache:**
   ```bash
   rm -rf dist node_modules/.vite .vite
   ```

2. **Browser Cache:**
   - DevTools (F12) → Application → Clear storage
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

3. **Deployment Platform Cache:**
   - Vercel: Clear cache during redeploy
   - Netlify: Use "Clear cache and deploy"

### When to Clear Cache

- After changing `.env` files
- After updating environment variables
- When getting "old database" errors
- After pulling code changes that affect configuration

## Security Notes

1. **Never commit `.env` files to git** (already in `.gitignore`)
2. **Use platform environment variables for production**
3. **Rotate keys if exposed** (contact Supabase support)
4. **Keep `VITE_SUPABASE_SERVICE_ROLE_KEY` secret** (only for server-side use)

## Support

### If deployment fails:

1. Check `EMERGENCY_DB_FIX.md`
2. Run `./check-db.sh` locally
3. Verify `DATABASE_CONFIG.md` has correct credentials
4. Check deployment logs for specific errors

### Contact Information

For database access issues, reference:
- `DATABASE_CONFIG.md` - Complete configuration guide
- `EMERGENCY_DB_FIX.md` - Troubleshooting guide

---

**Important:** Always verify database connection before and after deployment. Use `./check-db.sh` to ensure correct configuration.
