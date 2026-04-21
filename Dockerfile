# ─── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfiles
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for reproducible builds)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build the application ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* must be present at build time — Next.js inlines them into client bundle.
# Pass via --build-arg. Falls back to an empty value if omitted (auth-client keeps its default).
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Generate Prisma client
RUN pnpm exec prisma generate

# Build Next.js application (standalone output)
RUN pnpm build

# Install Prisma CLI with all deps into a self-contained directory for the runner
RUN mkdir -p /prisma-cli && cd /prisma-cli && \
    npm init -y > /dev/null 2>&1 && \
    npm install prisma@$(node -e "console.log(require('/app/node_modules/prisma/package.json').version)") > /dev/null 2>&1

# ─── Stage 3: Production runtime ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma: schema + migrations + self-contained CLI for `prisma migrate deploy`
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /prisma-cli ./prisma-cli

# Entrypoint: runs migrations then starts the server
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create uploads directory writable by nextjs user (mounted as Docker volume)
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
