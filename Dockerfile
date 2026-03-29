# ── Build stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ── Production stage ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built output and migrations
COPY --from=builder /app/dist ./dist
COPY migrations/ ./migrations/

# Non-root user (UID 1001)
RUN addgroup -g 1001 -S nodejs && adduser -S apiuser -u 1001
USER apiuser

EXPOSE 8080

CMD ["node", "dist/index.js"]
