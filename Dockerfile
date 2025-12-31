# STAGE 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy dependensi
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy seluruh source code (termasuk schema.sql)
COPY . .

# Jalankan script build (menghasilkan folder dist)
RUN bun run build

# STAGE 2: Runtime
FROM oven/bun:1-slim AS release
WORKDIR /app

# Copy hasil build dan node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/schema.sql ./schema.sql

# Expose port sesuai .env kamu
EXPOSE 4000

CMD ["bun", "run", "start"]