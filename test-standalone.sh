#!/bin/bash

echo "🔧 Testing standalone build locally..."

# Clean และ build
echo "1. Cleaning previous build..."
rm -rf .next

echo "2. Building standalone..."
npm run build

echo "3. Checking standalone output..."
if [ -d ".next/standalone" ]; then
    echo "✅ Standalone build created"
    
    echo "4. Checking public assets..."
    if [ -d ".next/standalone/public" ]; then
        echo "✅ Public directory exists"
        echo "Assets found:"
        find .next/standalone/public -name "*.ico" -o -name "*.png" -o -name "*.svg" | head -10
    else
        echo "❌ Public directory missing"
    fi
    
    echo "5. Checking static files..."
    if [ -d ".next/standalone/public/_next/static" ]; then
        echo "✅ Static files exist"
        ls -la .next/standalone/public/_next/static/
    else
        echo "❌ Static files missing"
    fi
    
else
    echo "❌ Standalone build failed"
fi

echo "🏁 Test complete!"
