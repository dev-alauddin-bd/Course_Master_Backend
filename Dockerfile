# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
# Use npm instead of pnpm
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY prisma ./prisma/
COPY prisma.config.ts ./
# Prisma v7 build-time generate
RUN DATABASE_URL="postgresql://placeholder:5432" npx prisma generate
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* prisma.config.ts ./ 
COPY prisma ./prisma/
RUN npm install --omit=dev --legacy-peer-deps
# Re-link Prisma Client for production
RUN DATABASE_URL="postgresql://placeholder:5432" npx prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Try dist/server.js first
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
