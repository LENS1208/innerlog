#!/bin/bash
# Database connection checker

CURRENT_URL=$(grep VITE_SUPABASE_URL .env | cut -d'=' -f2)
CORRECT_URL="https://xvqpsnrcmkvngxrinjyf.supabase.co"
OLD_URL="https://zcflpkmxeupharqbaymc.supabase.co"

if [ "$CURRENT_URL" = "$OLD_URL" ]; then
    echo "❌ ERROR: Connected to OLD database!"
    echo "   Current: $CURRENT_URL"
    echo "   Should be: $CORRECT_URL"
    echo ""
    echo "Fixing automatically..."
    cp .env.example .env
    echo "✅ Fixed! Now using correct database."
    exit 1
elif [ "$CURRENT_URL" = "$CORRECT_URL" ]; then
    echo "✅ OK: Connected to correct database"
    echo "   $CURRENT_URL"
    exit 0
else
    echo "⚠️  WARNING: Unknown database"
    echo "   Current: $CURRENT_URL"
    exit 2
fi
