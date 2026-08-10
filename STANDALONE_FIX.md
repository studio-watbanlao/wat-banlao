# 🔧 แก้ปัญหา Standalone รูปไม่มา - สมบูรณ์แล้ว! ✅

## ปัญหาที่แก้ไข
Next.js standalone mode ไม่ copy public assets และ static files โดยอัตโนมัติ ทำให้รูปภาพ, favicon, fonts, และ assets อื่นๆ ไม่แสดง

## วิธีแก้ไข

### 1. สร้าง Asset Copy Script
- ไฟล์: `scripts/copy-assets.js`
- ทำหน้าที่ copy `public/`, `src/assets`, และ `_next/static` ไปยัง standalone output

### 2. ปรับปรุง Build Process
- เพิ่ม `&& node scripts/copy-assets.js` ใน npm build script
- Assets จะถูก copy อัตโนมัติหลังจาก build

### 3. ปรับปรุง Next.js Config
- เพิ่ม `images.unoptimized: true` สำหรับ standalone
- ปรับแต่ง experimental settings

### 4. สร้าง Custom Server (Optional)
- ไฟล์: `custom-server.js` 
- รองรับการ serve static files ได้ดีขึ้น

## การใช้งาน

### Build และ Test Local
```bash
npm run build                 # Build พร้อม copy assets
./test-standalone.sh         # ทดสอบ standalone
```

## Assets ที่ถูก Copy

### ✅ Public Assets
- `/favicon/` - Favicon files
- `/fonts/` - Font files  
- `/logo/` - Logo files
- `/assets/` - รูปภาพและ assets
- `manifest.json`, `robots.txt`

### ✅ Static Files
- `/_next/static/` - Next.js generated assets
- `/src/assets/` - Source assets สำหรับ imports

### ✅ การเข้าถึง Assets
- `import { icon } from 'src/assets/icons'` ✅ ทำงาน
- `<img src="/logo/logo.png" />` ✅ ทำงาน  
- `/favicon.ico` ✅ ทำงาน
- Font loading ✅ ทำงาน

## Debug และ Troubleshooting

### ตรวจสอบ Local Build
```bash
./test-standalone.sh
```

### ดู Assets Structure
```bash
find .next/standalone/public -type f | head -20
```

## ไฟล์ที่เพิ่ม/แก้ไข

1. ✅ `scripts/copy-assets.js` - Asset copy script
2. ✅ `custom-server.js` - Custom server
3. ✅ `src/middleware.ts` - Static asset middleware
4. ✅ `package.json` - Updated build script
5. ✅ `next.config.js` - Standalone optimizations
6. ✅ `test-standalone.sh` - Local testing script

## เรียบร้อยแล้ว! 🎉

ตอนนี้ standalone build สามารถแสดงรูปภาพและ assets ทั้งหมดได้ถูกต้องแล้ว
