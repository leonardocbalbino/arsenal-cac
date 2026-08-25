# Deploy — arsenal-cac

Mesma VPS que já roda o cartao-colaborativa, em pasta e portas próprias.
O build completo (backend + web) roda no GitHub Actions; a VPS só recebe os
artefatos prontos via `rsync` por SSH e ativa a release nova com um symlink
atômico + `pm2 reload`. A VPS nunca clona o repositório git.

Diferença do padrão usado pelo cartao-colaborativa: lá o "web" é uma SPA
estática (Vite) servida direto pelo nginx. Aqui o web é **Next.js** — roda
como processo Node (`next start`) via PM2, igual à API, e o nginx só faz
proxy reverso pros dois.

## Portas usadas (não colidem com o cartao-colaborativa, que usa 3000/3001)

| Ambiente | API (PM2)          | Web (PM2)           |
|----------|--------------------:|----------------------:|
| prod     | 3100 (127.0.0.1)     | 3110 (127.0.0.1)      |
| staging  | 3101 (127.0.0.1)     | 3111 (127.0.0.1)      |

## Domínios

- Prod: `arsenal.cartaocolaborativa.com.br`
- Staging: `dev.arsenal.cartaocolaborativa.com.br`

Aponte os dois (registro A/AAAA) pro IP da VPS antes de rodar o `certbot`.

## Estrutura na VPS

```
/var/www/projetos/repo/arsenal-cac/
  prod/
    ecosystem.prod.config.js   ← copiado manualmente (deploy/ecosystem.prod.config.js)
    secrets.env                ← criado manualmente, nunca vai pro git
    shared/uploads/            ← fotos/anexos, sobrevive a cada deploy
    releases/<timestamp>/
      api/   (dist + node_modules + prisma + package.json)
      web/   (.next + node_modules + public + package.json + next.config.ts)
    current -> releases/<timestamp>   (symlink atômico, trocado a cada deploy)
  staging/
    ecosystem.staging.config.js
    secrets.staging.env
    shared/uploads/
    releases/<timestamp>/...
    current -> releases/<timestamp>
```

## Setup inicial (uma vez só, por ambiente)

1. **Diretórios:**
   ```bash
   ssh usuario@vps
   sudo mkdir -p /var/www/projetos/repo/arsenal-cac/{prod,staging}/shared/uploads
   sudo chown -R $USER:$USER /var/www/projetos/repo/arsenal-cac
   ```

2. **Banco de dados** (novo banco Postgres, separado do cartao-colaborativa):
   ```sql
   CREATE USER arsenal_cac WITH PASSWORD 'escolha-uma-senha-forte';
   CREATE DATABASE arsenal_cac_prod OWNER arsenal_cac;
   CREATE DATABASE arsenal_cac_staging OWNER arsenal_cac;
   ```

3. **Ecosystem files** — copie deste repo pra VPS (uma vez; não são
   versionados na VPS nem re-sincronizados a cada deploy):
   ```bash
   scp deploy/ecosystem.prod.config.js usuario@vps:/var/www/projetos/repo/arsenal-cac/prod/
   scp deploy/ecosystem.staging.config.js usuario@vps:/var/www/projetos/repo/arsenal-cac/staging/
   ```

4. **Secrets** — criar na VPS (nunca no git), um por ambiente:
   ```bash
   # /var/www/projetos/repo/arsenal-cac/prod/secrets.env
   DATABASE_URL="postgresql://arsenal_cac:SENHA@localhost:5432/arsenal_cac_prod?schema=public"
   JWT_SECRET="gere-um-valor-aleatorio-longo"
   JWT_EXPIRES_IN="7d"
   ```
   Idem em `/var/www/projetos/repo/arsenal-cac/staging/secrets.env`, apontando pro banco `_staging`.
   Não inclua `PORT` aqui — quem define é o ecosystem file.

5. **Nginx:**
   ```bash
   scp deploy/nginx-prod.conf usuario@vps:/tmp/
   scp deploy/nginx-staging.conf usuario@vps:/tmp/
   ssh usuario@vps
   sudo mv /tmp/nginx-prod.conf /etc/nginx/sites-available/arsenal-cac-prod
   sudo mv /tmp/nginx-staging.conf /etc/nginx/sites-available/arsenal-cac-staging
   sudo ln -s /etc/nginx/sites-available/arsenal-cac-prod /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/arsenal-cac-staging /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d arsenal.cartaocolaborativa.com.br -d dev.arsenal.cartaocolaborativa.com.br
   ```

6. Primeiro deploy: dê push na `main` (prod) ou coloque a label `staging`
   num PR. `pm2 startOrReload` cria os processos na primeira vez que rodar.

## Secrets do GitHub (Settings → Secrets and variables → Actions)

Segredos são por repositório — mesmo reaproveitando a mesma VPS/chave SSH do
cartao-colaborativa, precisam ser cadastrados de novo aqui em `arsenal-cac`:

| Secret               | Observação                                              |
|-----------------------|----------------------------------------------------------|
| `VPS_HOST`             | mesmo valor do cartao-colaborativa, se for a mesma VPS   |
| `VPS_USER`             | idem                                                      |
| `VPS_SSH_KEY`          | idem (chave privada)                                      |
| `VPS_SSH_PORT`         | opcional, default 22                                       |
| `DATABASE_URL_PROD`    | `postgresql://arsenal_cac:SENHA@localhost:5432/arsenal_cac_prod?schema=public` |
| `DATABASE_URL_STAGING` | idem, banco `arsenal_cac_staging`                           |

Configure os **Environments** `production` e `staging` (Settings →
Environments) se quiser regras de proteção (aprovação manual, etc.) — os
workflows já referenciam esses nomes.

## Comandos úteis

```bash
pm2 list                                  # ver os 4 processos (api/web × prod/staging)
pm2 logs arsenal-cac-api-prod
pm2 logs arsenal-cac-web-prod
```
