# Handoff: CAC App — redesign mobile (dark “cofre discreto”)

## Visão geral
Redesign das telas principais do CAC App (gestão de acervo para Colecionador, Atirador e Caçador): dashboard, habitualidade, arsenal, detalhe da arma, vencimentos, munição, documentos e carteiras em modo apresentação. O objetivo do redesign é: (1) o usuário nunca perder um prazo, (2) provar habitualidade e apresentar carteiras em segundos numa fiscalização, (3) manter munição e registros auditáveis.

## Sobre os arquivos de design
Os arquivos deste pacote são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar estes designs no ambiente já existente do projeto**: `mobile/` em Expo 54 + Expo Router + TypeScript (React Native), consumindo o backend NestJS/Prisma já implementado. Nada de WebView, nada de portar HTML/CSS: traduzir para componentes React Native com `StyleSheet`, `FlatList`/`SectionList`, `expo-router` e as libs já presentes no repo.

Arquivos:
- `CAC App.dc.html` — protótipo navegável (shell do app: device frame, abas, sheet de registro, toasts) + galeria com as 8 telas lado a lado.
- `CAC Screens.dc.html` — todas as telas (o conteúdo real de cada tela, selecionado pela prop `screen`).
- `ios-frame.jsx` — apenas a moldura de iPhone usada na apresentação. **Não implementar.**

Abrir `CAC App.dc.html` no navegador para navegar o protótipo.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, raios e textos são finais e devem ser reproduzidos fielmente. Onde há listras diagonais com rótulo em monospace (`FOTO DA ARMA`, `QR`), são **placeholders**: substituir por foto real da arma (upload já existente no backend de documentos) e por QR/código gerado.

## Design tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0D0F0E` | fundo do app |
| `surface` | `#131614` | cards, linhas de lista |
| `surfaceRaised` | `#1B201D` | botões secundários, inputs, avatar |
| `surfaceGradient` | `linear-gradient(180deg,#171B19,#131614)` | card de destaque (habitualidade no dashboard) |
| `sheet` | `#151917` | bottom sheet |
| `border` | `rgba(255,255,255,0.09)` | bordas de card |
| `borderSoft` | `rgba(255,255,255,0.08)` | bordas de lista/input |
| `divider` | `rgba(255,255,255,0.07)` | separadores de linha |
| `text` | `#ECEFEC` | texto principal |
| `textMuted` | `rgba(236,239,236,0.45)` | metadados |
| `textFaint` | `rgba(236,239,236,0.35)` | placeholder / rodapé |
| `tabInactive` | `rgba(236,239,236,0.38)` | ícone/label de aba inativa |
| `accent` | `#1F5C4A` | preenchimentos (botões primários, barras, chips ativos) |
| `accentHover` | `#26705A` | pressed/hover do primário |
| `accentText` | `#4E9C82` | texto/ícone/borda de acento sobre fundo escuro |
| `onAccent` | `#EAF3EF` | texto sobre `accent` |
| `accentWash` | `rgba(31,92,74,0.14)` + borda `rgba(78,156,130,0.26)` | avisos informativos |
| `warn` | `#C9A227` (barra `#B08300`) | prazo ≤ 90 dias, estoque baixo, em manutenção |
| `danger` | `#D97F62` (barra `#C4694E`) | prazo ≤ 30 dias |
| `chartTrack` | `#2A3230` | barras fora do período selecionado |
| `chartBg` | `#222825` | trilha das barras de munição |
| `walletBg` | `#F4F2EC` | modo apresentação (tela clara) |
| `walletCard` | `#FFFFFF`, borda `rgba(20,23,15,0.12)`, sombra `0 18px 40px rgba(20,23,15,0.12)` | carteira |
| `walletText` | `#14170F` | texto no modo apresentação |
| `toastBg` / `toastText` | `#EDF2EF` / `#0D0F0E` | toast |

Cores semânticas de prazo: `> 90 dias` = neutro (`rgba(255,255,255,0.14)` na barra lateral), `≤ 90` = `warn`, `≤ 30` = `danger`.

### Tipografia
- **Texto**: IBM Plex Sans (400/500/600). No RN: `expo-font` + `@expo-google-fonts/ibm-plex-sans`.
- **Números, datas, códigos, rótulos-etiqueta**: IBM Plex Mono (400/500/600), sempre em CAIXA ALTA com `letter-spacing` de `.06em`–`.16em`.
- Escala usada: 44/600 (número gigante), 27–26/600 (título de tela, `letter-spacing:-.025em`), 22/600 (nome do usuário), 19/600 (título do sheet), 17/600 (linha de destaque), 16/600 (título de card), 15/500, 14/500 (título de linha), 13.5/400, 12.5/400, 12/400, 11/400 mono, 10.5/400 mono (rótulos), 9.5/600 mono (badges), 9.5/500 (label de aba).
- Mínimo de toque: alvos com altura ≥ 44 (linhas de lista têm `padding` vertical 12–14 + conteúdo).

### Espaçamento, raio, sombra
- Espaçamentos: 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 16, 18, 20 (padding horizontal de tela = **20**).
- Gap entre blocos de seção: **18**; entre cards de lista: **9–10**; interno de card: **11–16**.
- Raios: 4 (barra de gráfico), 5 (badge), 7 (botão pequeno), 8 (segmento ativo), 11 (input/segmented), 12 (linha de vencimento, botão), 13 (linha de documento, toast), 14 (card de munição, dashed), 16 (card de arma), 18 (card de destaque), 22 no topo do sheet, 99 (pílula/ponto).
- Sombras: só no toast (`0 12px 30px rgba(0,0,0,0.45)`) e no cartão da carteira.
- Área segura: conteúdo começa a 64 do topo (abaixo da status bar) e a tab bar tem `padding-bottom` 26 (home indicator).

## Navegação
Tab bar de 5 itens (`expo-router` tabs), ícones desenhados com formas simples (retângulo, círculo, cápsula, retângulo vertical) — substituir por ícones reais do set já usado no repo, mantendo 17×17 e stroke 1.6:
1. **Início** (`home`) 2. **Habitualidade** (`hab`) 3. **Arsenal** (`arsenal`) 4. **Munição** (`muni`) 5. **Docs** (`docs`)

Telas empilhadas (sem tab bar): **Detalhe da arma** (`weapon`, push a partir do Arsenal, header “‹ Arsenal”), **Carteiras** (`wallet`, apresentação em tela cheia, fundo claro, fechar com ✕ ou “Concluir”), **Vencimentos** (`venc`, push a partir do Início — mantém a tab bar, header “‹ Início”).
Modal: **Registrar sessão de treino** (bottom sheet sobre qualquer tela).

## Telas

### 1. Dashboard (`home`)
Propósito: leitura de 3 segundos do estado de conformidade.
Layout: coluna, gap 18, padding 20 (topo 64).
1. **Cabeçalho**: nome `22/600` + linha mono `CR 128.446-1 · ATIRADOR · 3º NÍVEL` (`11`, `letter-spacing .06em`, `textMuted`); à direita avatar 42×42, raio 12, `surfaceRaised`, iniciais mono 13.
2. **Card de habitualidade** (`surfaceGradient`, borda `border`, raio 18, padding 18): rótulo mono `HABITUALIDADE` + pílula “Em dia” (`accentText`, ponto 6px); número `4` em 44/600 com `/ 4 sessões no semestre` em 14 `textMuted`; 4 barras de progresso (`flex:1`, altura 6, raio 99, `accent` quando cumprida, `#222825` quando não); nota 12 `textMuted` “Semestre encerra em 30 set 2026 · comprovante gerado automaticamente”.
3. **Ações rápidas**: grid 3 colunas, gap 10, altura mín. 88, raio 14. Primeira em `accent`/`onAccent` (“Registrar treino”, abre o sheet); as outras em `surfaceRaised` com borda (“Carteiras” → modo apresentação; “Documentos” → aba Docs).
4. **Vencimentos**: cabeçalho de seção mono + link “Ver todos” (`accentText`, 12). Três linhas `surface`, raio 12, **borda esquerda 2px** na cor semântica, título 14/500, meta mono 11, e à direita a contagem em mono 11/600 na cor semântica (`9 dias` danger, `52 dias` warn, `7 meses` neutro).
5. **Munição**: cabeçalho + link; grid 3 colunas com calibre mono 10.5, saldo 19/600, limite 10.5 `textFaint`.

### 2. Habitualidade (`hab`)
1. Título 26/600 + FAB 38×38 `accent` com “+” (abre sheet).
2. **Segmented control**: container `surface` raio 11 padding 4; opção ativa `accent`/`onAccent` raio 8, inativa transparente `rgba(236,239,236,.6)`. Estados: `Semestre atual` (4 sessões · 160 disparos) e `Últimos 12 meses` (11 sessões · 690 disparos).
3. **Card de gráfico**: rótulo mono `SESSÕES REGISTRADAS`, linha `{n} sessões · {disparos} disparos` (15/500), badge mono `EM DIA` (`accentText`); gráfico de 12 barras, altura da área 104, gap 6, cada barra `flex:1` raio 4, meses fora do período em `chartTrack`, dentro em `accent`, mês corrente em `rgba(31,92,74,0.5)`; label do mês mono 9 CAIXA ALTA.
4. **Card dashed** (borda `1px dashed rgba(78,156,130,0.45)`): “Comprovante de habitualidade” + “PDF do semestre · pronto para fiscalização”, CTA mono `GERAR` → `GET /relatorios/habitualidade` e compartilhar/salvar o PDF.
5. **Lista de sessões**: coluna de data (dia 17/600 + mês mono 9.5), clube 14/500, meta mono 11 (`calibre · N disparos · hora`), badge `PDF` (accent, com borda) ou `SEM PDF` (neutro).

### 3. Arsenal (`arsenal`)
Título 26/600 + contagem mono `4 ARMAS`. Campo de busca (`surface`, raio 11, padding 11/13, ícone circular 11px, placeholder “Buscar por modelo, calibre ou SIGMA”). Cards de arma raio 16 padding 15: modelo 16/600, linha mono `TIPO · CALIBRE · SIGMA 0000-0000`, badge de status (`GUIA OK` accent / `GT 9 DIAS` danger + borda esquerda 2px danger / `EM MANUT.` warn), rodapé mono 10.5 com `GT ATÉ …` e `MANUT. mm/aaaa`. O primeiro card mostra a foto (placeholder listrado, altura 64, raio 10); os demais são compactos. Toque → detalhe.

### 4. Detalhe da arma (`weapon`)
Voltar “‹ Arsenal” (`accentText` 13.5/500). Título 27/600 + linha mono de identificação. Foto placeholder altura 150, raio 14. **Grid de especificações** 2 colunas, células `surface` separadas por 1px de `rgba(255,255,255,.08)` dentro de um container raio 14 com `overflow:hidden`: CAPACIDADE, CANO, AQUISIÇÃO, GUIA DE TRÁFEGO (valor em `accentText`). **Histórico de manutenção**: linhas com data mono à esquerda (largura 64) e descrição 13.5. Rodapé com dois botões (`Dossiê PDF` secundário → `GET /relatorios/dossie`; `Usar em treino` primário → abre o sheet já com a arma selecionada).

### 5. Vencimentos (`venc`)
Voltar “‹ Início” + título 26/600. **Card de aviso** `accentWash`: “Avisos locais em 30, 15 e 7 dias antes de cada prazo” + switch 38×22 ligado (`accent`, knob 18 `onAccent`) → controla o agendamento de `expo-notifications`. Depois três grupos com cabeçalho mono colorido: **Neste mês** (danger), **Próximos 90 dias** (warn), **Depois** (neutro). Itens iguais aos do dashboard; o item crítico é expandido e traz o CTA mono `INICIAR RENOVAÇÃO` (`accent`, raio 7, padding 8/11).

### 6. Munição (`muni`)
Título + FAB `accent` “+” (registrar compra). Três cards de calibre (`surface`, raio 14, padding 15): calibre mono 12, saldo `480 / 1.000` (15/600 + `/ limite` 11.5 `textMuted`), barra de progresso altura 5 raio 99 sobre `chartBg` (cor `accent`, ou `warn` quando abaixo de ~30% do limite), rodapé mono 10.5 (`ÚLT. COMPRA … · CONSUMO MÉDIO …/MÊS`, ou `ESTOQUE BAIXO · N SESSÕES RESTANTES` em `warn`). **Movimentações**: linhas com sinal `+`/`−` (largura 22, `accentText` para compra, `textMuted` para uso), título 14/500, meta mono 10.5 (data · NF · valor, ou data · clube) e badge `NF` quando há nota fiscal anexada.

### 7. Documentos (`docs`)
Título + botão “+” secundário (upload). **Chips de filtro** (pílulas mono 10.5): ativo `accent`/`onAccent` (`TODOS · 11`), inativos com borda. Linhas de documento (`surface`, raio 13, padding 13/14): miniatura 32×40 listrada com borda, título 14/500, meta mono 10.5 (`PDF · 1,8 MB · val. 12 MAR 2027`; em `danger` quando vencendo), chevron `›` `rgba(236,239,236,.3)`.

### 8. Carteiras — modo apresentação (`wallet`)
Tela cheia clara (`walletBg`), pensada para entregar o telefone ao fiscal. Topo: rótulo mono `MODO APRESENTAÇÃO · BRILHO MÁX.` e ✕ 30×30 (`rgba(20,23,15,.08)`). Centro: cartão branco raio 16 padding 20 com cabeçalho (tipo mono 9.5 + título 17/600) e quadrado 52×52 de QR à direita, separador, campos NOME / Nº + VALIDADE (valores em mono 14) / EMISSOR, rodapé mono 9.5 `CÓPIA DIGITAL · CONFERIR ORIGINAL · SINC. …`. Abaixo, 3 pontos (7px) para trocar entre CR, Filiação ao clube e Registro de atirador (ativo `#14170F`, inativo `rgba(20,23,15,.22)`). Rodapé: “Salvar na Wallet” (secundário) e “Concluir” (`#14170F`/`#F4F2EC`).
Comportamento obrigatório: ao abrir, subir o brilho da tela ao máximo e restaurar ao sair (`expo-brightness`); manter a tela acordada (`expo-keep-awake`); dados vindos do cache local para funcionar **offline**.

### Bottom sheet — Registrar sessão de treino
Overlay `rgba(5,6,6,0.62)`; folha `sheet`, raio 22 no topo, padding 14/20/30, alça 38×4. Título 19/600. Campos (rótulo mono 10 CAIXA ALTA + campo `surfaceRaised` raio 11 padding 12/13): **Clube** (select com ▾), linha com **Data** e **Disparos** (stepper − +), e **Arma utilizada** como chips mono (ativo `accent`). Aviso `accentWash`: “Baixa automática de 50 un. de 9×19 no estoque”. Botão primário “Salvar sessão” (raio 13, padding 15, 15/600). Ao salvar: fecha, navega para Habitualidade e mostra toast “Sessão registrada · habitualidade em dia”.
Na implementação, trocar os campos de texto de data por `@react-native-community/datetimepicker` (Fase 3 do plano).

### Toast
Ancorado a 20 das laterais e 106 do fundo (acima da tab bar), `toastBg`, raio 13, padding 13/15, ponto `accent` 8px + texto 13/500. Duração 2,6 s. Mensagens usadas: “Sessão registrada · habitualidade em dia”, “PDF gerado e salvo em Documentos”, “Selecione um arquivo para anexar”.

## Interações e comportamento
- Toques com `activeOpacity`/`pressed` levando o fundo para `accentHover` (primários) ou `#222926` (secundários) — no protótipo são estados `:hover`.
- Navegação: abas trocam de tela sem animação; `weapon`, `venc` e `wallet` entram como push (slide horizontal padrão do `expo-router`); o sheet entra de baixo com fade do overlay; toque no overlay fecha.
- Segmented control de habitualidade troca os números e o realce das barras do gráfico.
- Pontos da carteira trocam o cartão exibido (swipe horizontal também deve funcionar na implementação).
- Estados que faltam desenhar e devem seguir o mesmo vocabulário (Fase 3): loading (skeletons em `surface` com shimmer discreto), erro com botão “Tentar de novo”, vazio (“Nenhuma arma cadastrada” + CTA primário), e bloqueio biométrico na abertura.

## Estado
- `screen` (aba/rota atual), `prev` (tela de origem, para voltar do modo carteira), `sheet` (bool), `periodo` (`semestre` | `ano`), `walletIdx` (0–2), `toast` (string | null, auto-limpa em 2,6 s).
- Dados por tela (via backend NestJS já existente): perfil + CR; status de habitualidade por categoria; lista de sessões; armas + guias + manutenção; vencimentos agregados; saldos e movimentações de munição; documentos; carteiras/filiações.
- Cache local para leitura offline das carteiras e do comprovante de habitualidade.

## Conteúdo
Todos os textos dos protótipos são de exemplo, exceto rótulos de interface (que devem ser mantidos literalmente em pt-BR): Início, Habitualidade, Arsenal, Munição, Docs, Documentos, Vencimentos, Carteiras, Registrar treino, Registrar sessão de treino, Salvar sessão, Ver todos, Gerar, Iniciar renovação, Dossiê PDF, Usar em treino, Modo apresentação · brilho máx., Concluir, Salvar na Wallet.

## Assets
Nenhum asset binário. Placeholders listrados (`repeating-linear-gradient(115deg, …)`) marcam onde entram: foto da arma (card e detalhe), miniatura de documento, QR da carteira. Ícones da tab bar são formas geométricas provisórias — usar o set de ícones do repo. Fontes: IBM Plex Sans e IBM Plex Mono (Google Fonts / `@expo-google-fonts`).

## Arquivos deste pacote
- `CAC App.dc.html` — shell interativo + galeria das 8 telas.
- `CAC Screens.dc.html` — conteúdo de todas as telas (prop `screen`).
- `ios-frame.jsx` — moldura de apresentação, não implementar.
- `support.js` — runtime dos protótipos, não implementar.
