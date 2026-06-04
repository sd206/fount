FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared first, then API
RUN yarn workspace @fount/shared build
RUN yarn workspace @fount/api build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and app dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Install shared package into node_modules so require('@fount/shared/constants') resolves
COPY --from=builder /app/packages/shared/dist ./node_modules/@fount/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@fount/shared/package.json

EXPOSE 8080
CMD ["node", "apps/api/dist/apps/api/src/index.js"]
