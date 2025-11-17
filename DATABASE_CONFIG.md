# Database Configuration (CURRENT & CORRECT)

**Last Updated:** 2025-11-17
**Status:** ✅ OPERATIONAL

## Correct Database Credentials

```
Database ID: xvqpsnrcmkvngxrinjyf
URL: https://xvqpsnrcmkvngxrinjyf.supabase.co
```

### Environment Variables

All environment files MUST use these exact credentials:

```env
VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MDQyOTksImV4cCI6MjA0NzM4MDI5OX0.kgzf7yWMwzg9Y1IHpRmYAVD-CJWQQ_yxZTLxzUq_4Jw
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTgwNDI5OSwiZXhwIjoyMDQ3MzgwMjk5fQ.RnqgxH71a-j1NZqJuBEAw51Hhx6NlUl40ybFbnOXAig
```

### Files Configured

- ✅ `.env` - Development environment
- ✅ `.env.production` - Production environment
- ✅ `.env.example` - Template for new setups
- ✅ `src/lib/supabase.ts` - Uses `import.meta.env` (no hardcoding)

## Deprecated Database (DO NOT USE)

```
⛔ OLD Database ID: zcflpkmxeupharqbaymc
⛔ URL: https://zcflpkmxeupharqbaymc.supabase.co
⛔ STATUS: DEPRECATED - DO NOT USE
```

## Test User Account

```
Email: takuan_1000@yahoo.co.jp
Password: test2025
User ID: 4e4b6842-84ea-45a4-a8d0-e31a133bf054
```

This user has:
- 48 demo trades
- Proper auth.users record
- Proper auth.identities record
- Associated user_settings, daily_notes, trade_notes

## Problem History & Solution

### Issue
The application was connecting to an old database due to:
1. Hardcoded credentials in `src/lib/supabase.ts`
2. Inconsistent environment variables across files
3. Cached build artifacts containing old credentials

### Root Cause
Vite embeds environment variables at build time. Old credentials were:
- Hardcoded in source files
- Cached in browser
- Cached in Vite build artifacts

### Solution Applied
1. Removed all hardcoded database credentials
2. Updated all `.env` files to use correct credentials
3. Modified `src/lib/supabase.ts` to read from `import.meta.env`
4. Cleared all caches: `rm -rf dist node_modules/.vite .vite`
5. Performed clean rebuild
6. Recreated test user with proper Supabase auth

## Verification Steps

To verify correct database connection:

```bash
# Check environment files
grep "VITE_SUPABASE_URL" .env .env.production .env.example

# Check build output
grep -o "xvqpsnrcmkvngxrinjyf" dist/assets/*.js | head -1

# Should NOT find old database in actual connection code
grep "zcflpkmxeupharqbaymc" src/lib/supabase.ts
# (should only appear in env-validator.ts for validation)
```

## Prevention Guidelines

### 1. Never Hardcode Credentials
❌ **DON'T:**
```typescript
const supabaseUrl = 'https://xxx.supabase.co';
```

✅ **DO:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

### 2. Keep Environment Files Synchronized
All `.env*` files must use identical credentials for the same database.

### 3. Clear Cache After Credential Changes
```bash
rm -rf dist node_modules/.vite .vite
npm run build
```

### 4. Clear Browser Cache After Deployment
Users must perform hard refresh:
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

## Current Architecture

```
Application
    ↓
src/lib/supabase.ts (reads import.meta.env)
    ↓
.env files (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
    ↓
Supabase Database: xvqpsnrcmkvngxrinjyf
```

## Files Reference

- `src/lib/supabase.ts` - Supabase client initialization
- `src/lib/env-validator.ts` - Environment validation (contains old DB ID for comparison only)
- `.env` - Development credentials
- `.env.production` - Production credentials
- `.env.example` - Template for new developers

---

**IMPORTANT:** This configuration is the ONLY correct setup. Any deviation will cause connection issues.
