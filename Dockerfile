# Production container for HearOURVOICES (Next.js standalone output).
# Build:  docker build -t hearourvoices .
# Run:    docker run -p 3000:3000 --env-file .env hearourvoices
FROM node:20-alpine AS base
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# DATABASE_URL is only needed at runtime; a placeholder satisfies build-time client init.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV SESSION_SECRET="build-time-placeholder"
ENV IP_HASH_PEPPER="build-time-placeholder"
RUN npm run build

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma engine + CLI for `migrate deploy` at container start.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# Apply migrations, then start the server.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
