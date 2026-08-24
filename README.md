# CAC App

App para colecionadores, atiradores e caçadores (CAC) gerenciarem arsenal, documentos, filiações a clubes, vencimentos, habitualidade e munição.

Monorepo (pnpm workspaces):

- `backend/` — API em NestJS + Prisma + PostgreSQL
- `mobile/` — App em React Native com Expo SDK 54 (Expo Router)

## Funcionalidades implementadas

- **Auth**: registro/login com JWT
- **Arsenal**: cadastro de armas (marca, modelo, calibre, nº série, categoria, CRAF) + histórico de manutenção
- **Documentos**: CR, CRAF, Guia de Tráfego, Atestado de Sanidade, Exame Psicológico, Comprovante de Residência, Título de Filiação — com upload de arquivo (PDF/foto)
- **Clubes e Filiação**: cadastro de clubes e filiação do usuário (CBTE, nº de sócio, validade)
- **Carteiras**: tela "modo apresentação" com dados do CR, filiação e CRAF de cada arma
- **Vencimentos**: lista/filtro de documentos por proximidade de vencimento + notificações locais agendadas (30/15/7 dias antes) + job diário no backend (ponto de extensão para push/e-mail)
- **Habitualidade**: registro de sessões de treino (data, clube, armas usadas, munição gasta, comprovante), cálculo automático de status "em dia" por categoria CAC, gráfico de sessões por mês, exportação de comprovante em PDF
- **Munição**: registro de compra/uso por calibre com saldo calculado
- **Segurança**: bloqueio do app por biometria (Face ID/digital), token JWT em SecureStore
- **Relatórios**: exportação de dossiê completo (arsenal + documentos + filiações) e comprovante de habitualidade em PDF

> ⚠️ As regras de habitualidade em `backend/src/sessoes-treino/habitualidade.config.ts` são valores padrão conservadores. Ajuste conforme a portaria do Exército/COLOG vigente e a categoria exata do seu CR.

## Pré-requisitos

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Docker Desktop (para o PostgreSQL)
- App **Expo Go** no celular (ou emulador Android/iOS configurado)

## Subindo o backend

```bash
cd backend
cp .env.example .env
pnpm install                      # já rodado neste setup
docker compose -f ../docker-compose.yml up -d db
npx prisma migrate dev            # cria as tabelas (já rodado neste setup)
pnpm start:dev                    # http://localhost:3000/api
```

Endpoints ficam sob `http://localhost:3000/api`. Arquivos enviados (documentos, comprovantes) ficam em `backend/uploads/`, servidos em `/uploads/...`.

### Scripts úteis do backend

- `pnpm prisma:studio` — abre o Prisma Studio para inspecionar o banco
- `pnpm prisma:migrate` — cria uma nova migration após alterar `prisma/schema.prisma`

## Rodando o app mobile

```bash
cd mobile
cp .env.example .env
```

Edite `mobile/.env` com a URL da API acessível pelo seu celular/emulador:

- **Emulador Android**: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api`
- **Simulador iOS**: `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
- **Celular físico (Expo Go)**: use o IP da sua máquina na rede local, ex. `EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api`

```bash
pnpm install     # já rodado neste setup
pnpm start
```

Escaneie o QR code com o Expo Go (Android) ou a câmera (iOS), ou pressione `a`/`i` no terminal para abrir num emulador.

## Estrutura do mobile

```
mobile/
  app/                 # rotas (Expo Router)
    (auth)/             # login, registro
    (app)/               # tabs: início, arsenal, documentos, habitualidade, mais
  src/
    api/                # client axios + funções por domínio
    store/              # zustand (auth token, bloqueio biométrico)
    components/         # UI reutilizável (Card, Button, Field, LockGate...)
    notifications/       # agendamento de notificações locais de vencimento
```

## Deploy de validação (Docker, mesmo servidor do cartao-colaborativa)

Stack isolado em `docker-compose.prod.yml`, pensado para subir no mesmo VPS
do cartao-colaborativa só para validar com clientes — sem depender do
DNS/nginx que já existe lá (acesso direto por IP + porta dedicada,
`PUBLIC_PORT`, padrão 8090). Nada aqui expõe portas que colidam com o que já
está no ar (Postgres do cartao-colaborativa em 5432, API em 3000/3001, web
em 8080).

```bash
cp .env.docker.example .env   # preencher POSTGRES_PASSWORD, JWT_SECRET,
                               # DATABASE_URL e NEXT_PUBLIC_API_URL (IP do servidor)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm migrate
docker compose -f docker-compose.prod.yml up -d
```

Depois disso o app fica em `http://SEU_IP:8090`. Quando o cliente validar e
vocês tiverem domínio pra este projeto, dá pra trocar o serviço `nginx` daqui
por um vhost real no nginx do host (ver `colaborativa-monorepo/deploy/` no
repo do cartao-colaborativa como referência).

## O que falta para produção (próximos passos)

- Push notifications reais via servidor (hoje: notificações locais agendadas no app + log no backend) — plugar FCM/Expo Push Notifications com registro de device token
- Criptografia do banco local / hardening adicional de segurança conforme LGPD
- Seletor de data nativo (`@react-native-community/datetimepicker`) no lugar dos campos de texto AAAA-MM-DD
- Testes automatizados (unitários no backend, E2E no mobile)
- Build de produção (EAS Build) e publicação nas lojas
- Backup em nuvem opcional (hoje os dados residem só no Postgres que você hospeda)
