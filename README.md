# DX Automotive

E-commerce headless da marca **DX Automotive** (Grupo Dr. Farol Toledo) —
loja online para acessórios e eletrônicos automotivos do mercado brasileiro:
multimídia, molduras, câmera de ré e sensor de estacionamento.

## Stack

- **Backend:** [Medusa v2](https://medusajs.com/) (Node.js + TypeScript + MikroORM)
- **Storefront:** [Next.js 15](https://nextjs.org/) (App Router + Tailwind + Turbopack)
- **Banco:** PostgreSQL 16
- **Cache / event bus:** Redis 7
- **Imagens:** Cloudflare R2 (em prod)
- **E-mail transacional:** Resend (em prod)
- **Pagamentos:** MercadoPago (Pix + Boleto + Cartão até 12x)

## Estrutura do repositório (monorepo Turbo)

```
dx-automotive/
├── apps/
│   ├── backend/            # Medusa v2 (API + Admin embutido)
│   └── storefront/         # Next.js 15
├── docker-compose.yml      # Postgres + Redis (DEV LOCAL)
├── package.json            # raiz do monorepo (workspaces)
├── turbo.json
└── .env                    # envs do docker-compose
```

## Arquitetura de deploy

```
                       ┌─ dxautomotive.com.br + www ──→ Vercel (storefront)
Cloudflare DNS ────────┼─ api.dxautomotive.com.br   ──→ Hetzner CX43 (Medusa)
                       ├─ admin.dxautomotive.com.br ──→ Hetzner CX43 (Medusa /app)
                       └─ media.dxautomotive.com.br ──→ Cloudflare R2
```

Detalhes em [Decisões/ADR-001 - Arquitetura de Deploy](https://obsidian.md/) (Obsidian privado).

## Desenvolvimento local

### Pré-requisitos
- Node.js 20+ (ou superior)
- Docker Desktop / Docker Compose v2
- Git

### Setup
```bash
git clone https://github.com/dxautomotive/ecommerce-dxautomotive.git dx-automotive
cd dx-automotive

# Copia variáveis do compose e ajusta se quiser
cp .env.example .env

# Sobe Postgres + Redis em containers
docker compose up -d

# Instala dependências do monorepo
npm install

# Configura envs específicos dos apps
cp apps/backend/.env.template apps/backend/.env
# Edita apps/backend/.env com DATABASE_URL apontando para localhost:5434
# Edita apps/storefront/.env.local com NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001

# Roda migrations + seed inicial do Medusa
npm run backend:seed

# Sobe os dois apps em paralelo (porta 9001 backend, 8001 storefront)
npm run dev
```

### Portas
Como pode haver outros projetos no mesmo host, usamos portas não-padrão:

| Serviço | Porta | URL local |
|---|---|---|
| PostgreSQL | 5434 | `localhost:5434` |
| Redis | 6381 | `localhost:6381` |
| Medusa backend / admin | 9001 | http://localhost:9001/app |
| Next.js storefront | 8001 | http://localhost:8001/br |

### Scripts úteis
```bash
npm run dev            # roda backend + storefront em paralelo (turbo)
npm run backend:dev    # só o backend
npm run storefront:dev # só o storefront
npm run infra:up       # docker compose up -d
npm run infra:down     # docker compose down
```

## Documentação

A documentação viva (PRD, ADRs, Logbook de sessões, Estado da configuração
do admin) é mantida fora deste repositório no Obsidian privado em
`D:\Plataformas - DEV\Obsidian\Matriz\DX Automotive\`. Se você for um dev
trabalhando no projeto, peça acesso à documentação ao Cristiano.

Resumo dos ADRs principais (registrados no Obsidian):
- **ADR-001** — Arquitetura de deploy (Cloudflare + Vercel + Hetzner)
- **ADR-002** — Estratégia "lift visual" para o storefront (código fresco)
- **ADR-003** — Limites de reprodução do tema de referência (zero copy verbatim)
- **ADR-004** — Mono-repo único no GitHub (este repositório)

## Licença

Este repositório contém código original do projeto DX Automotive somado
ao starter do Medusa.js v2 (`MIT License — Copyright (c) 2022 Medusa`).
Veja [LICENSE](./LICENSE) para os termos do starter.

O código novo da DX Automotive é privado e reservado ao Grupo Dr. Farol Toledo.

---

*Versão deste README: 0.1 — atualizado conforme o projeto evolui (ver Logbook do Obsidian).*
