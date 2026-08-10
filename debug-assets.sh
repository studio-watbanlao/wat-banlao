#!/bin/bash

# สคริปต์สำหรับ debug Docker assets

echo "🔍 Checking Docker container assets..."

# Build และรัน container ในโหมด debug
docker build -t webkrub-debug .

# รัน container และตรวจสอบ assets
docker run --rm webkrub-debug sh -c "
echo '1. Public directory structure:';
find ./public -type f 2>/dev/null | head -20 || echo 'No public directory found';
echo '';
echo '2. Favicon check:';
ls -la ./public/favicon/ 2>/dev/null || echo 'No favicon directory';
echo '';
echo '3. Fonts check:';
ls -la ./public/fonts/ 2>/dev/null || echo 'No fonts directory';
echo '';
echo '4. Logo check:';
ls -la ./public/logo/ 2>/dev/null || echo 'No logo directory';
echo '';
echo '5. Static assets check:';
ls -la ./public/_next/static/ 2>/dev/null || echo 'No static directory';
echo '';
echo '6. src/assets check:';
ls -la ./public/src/assets/ 2>/dev/null || echo 'No src/assets in public';
"

echo "✅ Asset check completed!"
