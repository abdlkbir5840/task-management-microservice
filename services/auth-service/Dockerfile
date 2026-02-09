# Base
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build
FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/prisma.config.ts ./

# Prisma Client
RUN npx prisma generate --config ./prisma.config.ts

EXPOSE 3001

CMD ["node", "dist/src/main.js"]