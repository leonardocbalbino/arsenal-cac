# syntax=docker/dockerfile:1

# Build executado a partir da raiz do monorepo:
#   docker build -f web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://SEU_IP:8090/api -t arsenal-cac-web .
#
# NEXT_PUBLIC_API_URL é embutido no bundle em tempo de BUILD (Next.js só lê
# NEXT_PUBLIC_* em runtime dentro do próprio processo de build) — por isso é
# um build-arg, não uma env var do container.

FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY web/package.json web/package.json
COPY mobile/package.json mobile/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS compiled
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY web web
RUN pnpm --filter cac-web build

FROM compiled AS build
RUN pnpm prune --prod

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/web/node_modules ./web/node_modules
COPY --from=build /app/web/.next ./web/.next
COPY --from=build /app/web/public ./web/public
COPY --from=build /app/web/package.json ./web/package.json
COPY --from=build /app/web/next.config.ts ./web/next.config.ts

WORKDIR /app/web
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
