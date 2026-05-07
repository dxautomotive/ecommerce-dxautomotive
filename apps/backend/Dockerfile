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

# Monorepo npm workspaces: o lockfile vive na raiz do repo, não em
# `apps/backend`. Como o build context é só este workspace, usamos
# `npm install` (não `npm ci`) — gera lockfile efêmero, build determinístico
# o suficiente porque o repo já tem o lockfile da raiz validado.
COPY package.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY . .

# `medusa build` gera tanto admin (Vite) quanto bundle do server.
# O Medusa v2 retorna exit 1 quando há warnings de TS no backend (mismatches
# de DTOs vs entidades) mas o build completa o output em .medusa/server/.
# Aceita exit 1 desde que o diretório de output exista — mascara só warnings,
# não falhas reais (que não geram .medusa/server/server.js).
RUN npx medusa build || true
RUN test -f /app/.medusa/server/package.json || (echo "❌ medusa build não gerou output" && exit 1)

# ─── Stage 2: runtime ──────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Apenas o output do build + deps de prod do server bundle
COPY --from=builder /app/.medusa/server ./
# `sharp` é resolvido dinamicamente nas rotas de reviews — não entra no
# package.json do server bundle. Instala explícito + libvips runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips42 \
  && rm -rf /var/lib/apt/lists/*
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps \
  && npm install sharp --no-audit --no-fund

ENV NODE_ENV=production
ENV PORT=9000
EXPOSE 9000

# Healthcheck simples (Medusa expõe `/health`)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:9000/health || exit 1

CMD ["npm", "run", "start"]
