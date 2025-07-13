# Base image
FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Install dependencies (separated for better cache utilization)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .
RUN bun next telemetry disable
RUN bun run build

# Runtime stage
FROM oven/bun:1.2.12 AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/components.json ./components.json
COPY --from=builder /app/.eslintrc.json ./.eslintrc.json

# Set proper permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port for Railway
EXPOSE 3000

# Set environment variables for Railway
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start production server
CMD ["bun", "start", "-H", "0.0.0.0", "-p", "3000"]
