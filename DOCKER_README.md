# Docker Setup for WebKrub

## Production Build

### ใช้ Docker Compose (แนะนำ)
```bash
# Build และรัน production
npm run docker:prod

# หยุด container
npm run docker:stop
```

### ใช้ Docker โดยตรง
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## Development Build

### ใช้ Docker Compose สำหรับ Development
```bash
# Build และรัน development mode
npm run docker:dev
```

## Manual Docker Commands

### Production
```bash
# Build
docker build -t webkrub .

# Run
docker run -p 8082:3000 webkrub
```

### Development
```bash
# Build development image
docker build -f Dockerfile.dev -t webkrub-dev .

# Run with volume mounting
docker run -p 8082:3000 -v $(pwd):/app -v /app/node_modules webkrub-dev
```

## การใช้งาน

- **Production**: เข้าใช้งานที่ http://localhost:8082
- **Development**: เข้าใช้งานที่ http://localhost:8082 (มี hot reload)

## การทำความสะอาด

```bash
# ลบ containers, images, และ volumes ที่ไม่ใช้
npm run docker:clean

# หรือใช้คำสั่ง docker โดยตรง
docker system prune -af
docker volume prune -f
```

## Environment Variables

สร้างไฟล์ `.env.production` สำหรับ production environment:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:8082
# เพิ่ม environment variables อื่นๆ ที่จำเป็น
```

## Security Features

- ใช้ non-root user สำหรับรัน application
- ติดตั้ง security updates ใน Alpine Linux
- ใช้ multi-stage build เพื่อลดขนาด image
- รองรับ health check

## ไฟล์ที่เกี่ยวข้อง

- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build
- `docker-compose.yml` - Production compose
- `docker-compose.dev.yml` - Development compose
- `.dockerignore` - ไฟล์ที่ไม่ต้อง copy เข้า container
