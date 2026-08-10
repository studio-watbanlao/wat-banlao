# Stage 1: Build the Next.js app
FROM node:20.9.0-alpine AS builder

WORKDIR /app

# คัดลอกและติดตั้ง dependencies
COPY package.json yarn.lock* package-lock.json* ./

# ใช้ npm เป็นหลัก แต่รองรับ yarn ด้วย
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# คัดลอก source ทั้งหมด
COPY . .

# ✅ สั่ง build แบบ standalone (จะ copy assets อัตโนมัติด้วย script)
RUN npm run build

# Debug: ดูว่า assets ถูก copy หรือไม่
RUN echo "=== Assets Debug Info ===" && \
    echo "Public structure:" && \
    find .next/standalone/public -type d | sort && \
    echo -e "\nKey files:" && \
    find .next/standalone/public -name "*.ico" -o -name "*.png" -o -name "*.svg" -o -name "*.jpg" | head -10

# Stage 2: Run the Next.js app
FROM node:20.9.0-alpine

# ติดตั้ง security updates และเพิ่ม non-root user
RUN apk update && apk upgrade && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# ✅ คัดลอก output แบบ standalone จาก stage แรก
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# ✅ คัดลอก public directory ที่เตรียมไว้
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/public ./public

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ✅ ใช้ standalone server ที่ Next.js สร้างให้
CMD ["node", "server.js"]
