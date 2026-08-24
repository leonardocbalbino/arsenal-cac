# syntax=docker/dockerfile:1

# Build executado a partir da raiz do monorepo:
#   docker build -f backend/Dockerfile -t arsenal-cac-api .

FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9 --activate

# --- deps: instala node_modules do workspace (cacheável por manifestos apenas) ---
# `pnpm install` valida o lockfile contra todos os workspaces declarados em
# pnpm-workspace.yaml, então os manifestos do monorepo inteiro precisam estar
# presentes mesmo que só o backend seja buildado nesta imagem.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY web/package.json web/package.json
COPY mobile/package.json mobile/package.json
RUN pnpm install --frozen-lockfile

# --- compiled: gera o Prisma Client e builda o backend (ainda com todas as
# devDependencies — útil para depurar o build ou rodar migrations, ex:
# `docker build --target compiled`) ---
FROM deps AS compiled
COPY backend backend
RUN pnpm --filter cac-backend exec prisma generate
RUN pnpm --filter cac-backend build

# --- build: mesmo estado, só com devDependencies removidas ---
FROM compiled AS build
# `pnpm prune` age sobre o lockfile do monorepo inteiro (não aceita --filter),
# então também remove devDependencies do mobile/web — aceitável aqui, pois as
# dependencies de produção deles continuam no node_modules hoisted.
RUN pnpm prune --prod

# --- runtime: imagem final, só com o necessário para rodar ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/package.json ./backend/package.json

WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
