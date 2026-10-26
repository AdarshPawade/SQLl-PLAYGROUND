# ==============================================================================
# Production Multi-Stage Dockerfile for SQL Practice Playground
# ==============================================================================

# STAGE 1: Build the Vite Frontend SPA
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: Lightweight Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DISABLE_FILE_LOGS=true

COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code, required shared schemas/data, and built static UI
COPY server ./server
COPY src/database ./src/database
COPY src/data ./src/data
COPY --from=builder /app/dist ./dist

# Non-root secure user execution
USER node

EXPOSE 5000

# Container Healthcheck using native Node.js 20 fetch
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server/index.js"]
