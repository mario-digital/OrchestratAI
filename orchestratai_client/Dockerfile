# Multi-stage build for production
# Stage 1: Dependencies
FROM oven/bun:1-alpine AS deps

WORKDIR /app

# Copy package files (note: build context must be set to project root)
# For Bun workspace, we need root package.json + workspace package.json + packages/
COPY package.json bun.lock ./
COPY orchestratai_client/package.json ./orchestratai_client/
COPY packages/ ./packages/

# Install dependencies for the workspace
# Note: Using --no-save to avoid lockfile changes during build
RUN bun install --no-save

# Stage 2: Builder
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy workspace structure and dependencies from deps stage
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/orchestratai_client/node_modules ./orchestratai_client/node_modules
COPY orchestratai_client/ ./orchestratai_client/

# Build Next.js app (requires standalone output in next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/orchestratai_client
RUN bun run build

# Stage 3: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from workspace build
COPY --from=builder --chown=nextjs:nodejs /app/orchestratai_client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/orchestratai_client/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/orchestratai_client/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check (with error handling)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
