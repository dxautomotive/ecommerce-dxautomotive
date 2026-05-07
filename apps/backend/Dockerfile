# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile pro Medusa v2 (DX Automotive backend).
# Build: gera `.medusa/server/` (admin estático + servidor API).
# Runtime: roda só o servidor compilado com deps de prod.

# ─── Stage 1: deps + build ─────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

# `sharp` precisa do `vips` runtime — Bookworm já tem libvips42.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cópia em 2 passos pra cachear melhor o `npm ci`
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `medusa build` gera tanto admin (Vite) quanto bundle do server
RUN npx medusa build

# ─── Stage 2: runtime ──────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Apenas o output do build + deps de prod do server bundle
COPY --from=builder /app/.medusa/server ./
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=9000
EXPOSE 9000

# Healthcheck simples (Medusa expõe `/health`)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:9000/health || exit 1

CMD ["npm", "run", "start"]
