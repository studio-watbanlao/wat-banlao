# watbanlao-web

watbanlao-web

## Supabase content flow

Content now follows this path:

`React Query / frontend -> /api/content/* -> Next.js API -> Supabase site_content`

1. Run `supabase/migrations/20260810000000_create_site_content.sql` in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and add the project URL and service role key.
3. Import the current Google Sheet content once:

   ```bash
   set -a
   source .env.local
   set +a
   yarn db:import
   ```

4. Start the app with `yarn dev`.

The service role key is server-only. Frontend code must use `/api/content/*` and must never access
Supabase directly.

ขั้นที่ 1 Build standalone

npm run build

cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

node .next/standalone/server.js

1> Copy file to server เข้าที่อยู่ไฟล์
scp C:\webwat\standalone\standalone.zip root@157.85.102.61:/var/www/react-app/

scp ~/Desktop/standalone.zip root@139.180.142.208:/var/www/watbanlao/

2 remote server
ssh root@139.180.142.208

3 cd /var/www/watbanlao/

4 แสดงรายการใน folder ใช้คำสั่ง ls

5 unzip standalone.zip เลือก A

6 pm2 restart watbanlao
