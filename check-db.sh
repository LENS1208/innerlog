#!/bin/bash
# Database connection checker
# Last updated: 2025-11-17

CURRENT_URL=$(grep VITE_SUPABASE_URL .env | cut -d'=' -f2)
CORRECT_URL="https://xvqpsnrcmkvngxrinjyf.supabase.co"
OLD_URL="https://zcflpkmxeupharqbaymc.supabase.co"

echo "=========================================="
echo "Database Connection Checker"
echo "=========================================="
echo ""

if [ -z "$CURRENT_URL" ]; then
    echo "❌ ERROR: .env file not found or VITE_SUPABASE_URL not set"
    echo ""
    echo "Creating .env from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo "   Please run this script again to verify."
    else
        echo "❌ ERROR: .env.example not found"
        echo "   Please create .env manually with correct credentials."
        echo "   See DATABASE_CONFIG.md for details."
    fi
    exit 1
fi

echo "Current database URL:"
echo "   $CURRENT_URL"
echo ""

if [ "$CURRENT_URL" = "$OLD_URL" ]; then
    echo "❌ ERROR: Connected to OLD database!"
    echo "   Status: DEPRECATED - DO NOT USE"
    echo "   Should be: $CORRECT_URL"
    echo ""
    echo "Fixing automatically..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fixed! Copied correct configuration from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Clear cache and rebuild:"
        echo "   rm -rf dist node_modules/.vite .vite"
        echo "   npm run build"
    else
        echo "❌ Cannot auto-fix: .env.example not found"
        echo "   Please update .env manually."
        echo "   See DATABASE_CONFIG.md for correct credentials."
    fi
    exit 1
elif [ "$CURRENT_URL" = "$CORRECT_URL" ]; then
    echo "✅ OK: Connected to correct database"
    echo "   Status: OPERATIONAL"
    echo "   Database ID: xvqpsnrcmkvngxrinjyf"
    echo ""
    echo "✅ Configuration is correct!"
    exit 0
else
    echo "⚠️  WARNING: Unknown database URL"
    echo "   Expected: $CORRECT_URL"
    echo "   Found: $CURRENT_URL"
    echo ""
    echo "Please verify your configuration in DATABASE_CONFIG.md"
    exit 2
fi
