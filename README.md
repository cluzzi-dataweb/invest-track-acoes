# Invest Track Web App

Aplicativo web completo para controle de investimentos em acoes e fundos imobiliarios, com foco em:

- ativos favoritos
- carteira
- compras
- vendas
- alertas de compra
- alertas de venda
- intencao de compra

## Funcionalidades implementadas

1. Ativos favoritos
- adicionar/remover favorito
- cotacao atual e variacao no favorito
- autocomplete de ticker/nome enquanto digita
- acao rapida para compra e para intencao

2. Carteira
- posicao ativa calculada automaticamente a partir do historico
- preco medio ponderado por compras
- valor investido, valor atual, lucro/prejuizo em valor e percentual

3. Registro de compras
- ticker, data, quantidade, valor unitario e observacao
- atualiza carteira automaticamente
- permite editar e excluir operacoes do historico

4. Registro de vendas
- ticker, data, quantidade, valor unitario e observacao
- bloqueia venda acima da quantidade disponivel
- atualiza carteira automaticamente
- permite editar e excluir operacoes do historico

5. Alertas de compra
- ticker, preco alvo e observacao
- destaca quando preco atual fica abaixo/igual ao alvo

6. Alertas de venda
- ticker, preco alvo, tipo (stop win, realizacao parcial, aviso) e observacao
- destaca quando preco atual atinge/supera o alvo

7. Intencao de compra
- ticker, preco desejado, quantidade opcional, observacao
- destaca quando preco alvo e atingido
- permite converter em compra real com 1 clique

8. Dashboard principal
- quantidade de monitorados
- quantidade em carteira
- investido total
- valor atual da carteira
- lucro/prejuizo total
- alertas ativos de compra e venda
- alertas atingidos no momento
- maior alta e maior baixa entre ativos monitorados

9. Atualizacao em tempo real
- stream de cotacoes via WebSocket com status visual (conectado/conectando/desconectado)
- inscricao automatica dos tickers monitorados
- fallback para polling/refresh tradicional

10. Tema claro/escuro
- troca em tempo real por botao no cabecalho
- preferencia persistida no navegador

11. Sincronizacao em nuvem por perfil
11. Sincronizacao em nuvem por conta
- cadastro e login com e-mail/senha no cabecalho
- salvamento automatico em nuvem a cada alteracao
- sincronizacao manual imediata por botao
- em outro dispositivo, basta entrar com a mesma conta

12. Layout legado dark com nuvem
- a tela principal `app.js` continua como interface padrao
- a aba `Configuracoes` agora tem criacao de conta, login, logout e sincronizacao
- os dados do layout dark sao enviados para `/api/legacy-cloud/data`

## Arquitetura do projeto

Estrutura modular para facilitar manutencao e expansao:

- `src/app/`:
  - `app.ts`: controlador principal (eventos, fluxo, render)
  - `store.ts`: regras de escrita e validacoes de negocio
  - `templates.ts`: renderizacao de telas/abas
- `src/modules/`:
  - `portfolio.ts`: calculo de posicao e preco medio
  - `alerts.ts`: avaliacao de alertas e estatisticas
- `src/services/`:
  - `quoteService.ts`: ponto central de configuracao da camada de cotacoes
  - `quoteProviders.ts`: providers mock e API
- `src/storage/`:
  - `localStore.ts`: persistencia no localStorage
- `src/utils/`:
  - formatacao e ids
- `src/types.ts`:
  - contratos e tipos do dominio

## Camada de cotacoes (ponto central para API real)

Arquivo central: `src/services/quoteService.ts`

Configuracao por variavel de ambiente:

- `VITE_QUOTES_PROVIDER=mock|api|hybrid`
- `VITE_QUOTES_REFRESH_MS=30000`
- `VITE_API_URL=http://localhost:3333`
- `VITE_QUOTES_USE_WS=true|false`
- `VITE_QUOTES_WS_URL=ws://localhost:3333/ws/quotes`

Variaveis de ambiente do backend para performance/cache:

- `YAHOO_HTTP_TIMEOUT_MS=10000`
- `QUOTE_CACHE_TTL_MS=15000`
- `HISTORY_CACHE_TTL_MS=180000`
- `ANALYST_CACHE_TTL_MS=300000`
- `TOP10_CACHE_TTL_MS=240000`

Modos:

- `mock`: simula cotacoes (fallback completo)
- `api`: usa API real
- `hybrid`: tenta API e, se falhar, usa mock

### Stream WebSocket

- Endpoint: `/ws/quotes`
- Fluxo:
  - cliente conecta
  - cliente envia `{ "type": "subscribe", "tickers": ["PETR4", "MXRF11"] }`
  - servidor envia `{ "type": "quotes", "data": [...] }` periodicamente
- Config backend:
  - `WS_PUSH_INTERVAL_MS=12000`

### Endpoints de mercado disponiveis

- `GET /api/market/search?q=PETR`
- `GET /api/market/quote/:ticker`
- `GET /api/market/history/:ticker?range=6mo&interval=1d`
- `GET /api/market/analyst/:ticker`
- `GET /api/market/top10-analysts`

### Endpoints de autenticacao e nuvem

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/cloud/data` (Bearer token)
- `PUT /api/cloud/data` (Bearer token)
- `GET /api/legacy-cloud/data` (Bearer token)
- `PUT /api/legacy-cloud/data` (Bearer token)

### Banco em nuvem com Supabase

Para persistencia real acessivel de qualquer lugar:

1. Crie um projeto no Supabase.
2. Rode o SQL de [supabase/schema.sql](supabase/schema.sql).
3. Preencha no `.env`:

```bash
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
SUPABASE_USERS_TABLE=invest_track_users
SUPABASE_CLOUD_TABLE=invest_track_cloud_data
```

4. Suba o backend/API com essas variaveis.
5. No app dark, abra `Configuracoes`, crie conta e sincronize.

Observacao:
- com Supabase configurado, o backend passa a gravar usuarios e dados no banco remoto
- sem Supabase, o backend local continua usando arquivo/disco como fallback

Observacoes:

- `history` suporta range: `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`
- `history` suporta interval: `1d`, `1wk`, `1mo`
- `analyst` pode retornar indisponivel para alguns ativos sem cobertura publica
- `top10-analysts` retorna ranking dinamico com base em cobertura e upside

## Requisitos

- Node.js 20+

## Como rodar

1. Instalar dependencias:

```bash
npm install
```

2. Configurar ambiente (opcional, recomendado):

```bash
copy .env.example .env
```

3. Subir app:

```bash
npm run dev
```

4. Acessar:

- Frontend: http://localhost:5173
- API (opcional para provider api/hybrid): http://localhost:3333

## Deploy na Vercel

Este projeto esta preparado para deploy com frontend estatico + API serverless na Vercel.

Arquivos de suporte:

- `vercel.json`: configura rewrite de `/api/*` para a function `api/index.js`
- `api/index.js`: implementa endpoints de mercado para Vercel Functions

### Passo a passo

1. Instalar Vercel CLI (se ainda nao tiver):

```bash
npm i -g vercel
```

2. Fazer login:

```bash
vercel login
```

3. Na raiz do projeto, publicar:

```bash
vercel
```

4. Para publicar em producao:

```bash
vercel --prod
```

### Variaveis de ambiente recomendadas na Vercel

No painel da Vercel (Project -> Settings -> Environment Variables), configure:

- `YAHOO_HTTP_TIMEOUT_MS=10000`
- `QUOTE_CACHE_TTL_MS=15000`
- `HISTORY_CACHE_TTL_MS=180000`
- `ANALYST_CACHE_TTL_MS=300000`
- `TOP10_CACHE_TTL_MS=240000`
- `SUPABASE_URL=https://SEU-PROJETO.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY`
- `SUPABASE_USERS_TABLE=invest_track_users`
- `SUPABASE_CLOUD_TABLE=invest_track_cloud_data`
- `AUTH_TOKEN_SECRET=defina-um-segredo-forte-e-unico`
- `AUTH_TOKEN_TTL_SECONDS=2592000`

### Fluxo recomendado na Vercel

1. Suba este projeto na Vercel.
2. Configure as variaveis acima.
3. No Supabase, rode [supabase/schema.sql](supabase/schema.sql).
4. Abra o site publicado.
5. Na aba `Configuracoes`, deixe `URL base backend/API` vazia para usar a mesma URL do site.
6. Crie conta, entre e sincronize.

Exemplo:
- site publicado: `https://meu-b3-monitor.vercel.app`
- chamadas do frontend: `https://meu-b3-monitor.vercel.app/api/...`

Checklist rapido completo:
- [DEPLOY_VERCEL_SUPABASE.md](DEPLOY_VERCEL_SUPABASE.md)

### Observacoes importantes do ambiente Vercel

- O frontend passa a consumir a API no mesmo dominio (base relativa `/api`).
- O stream WebSocket (`/ws/quotes`) nao fica ativo na Vercel Function.
- O app continua funcionando via chamadas HTTP/polling para cotacoes e analises.
- Cache em memoria existe por instancia de function (nao global/persistente).
- O endpoint `/api/storage/:profileId` na Function usa memoria da instancia (nao e banco persistente).
- O endpoint autenticado `/api/cloud/data` na Function tambem depende da memoria da instancia (nao persistente globalmente).
- Para persistencia duravel de dados e contas de usuario, use o backend Node local/VM (`server/index.js`) com Supabase configurado ou conecte outro banco externo.

## Persistencia local

Dados salvos no navegador via localStorage:

- favoritos
- carteira derivada de operacoes
- historico de compras e vendas
- alertas de compra e venda
- intencoes de compra

## Regras de negocio cobertas

- compra adiciona posicao
- venda reduz posicao
- bloqueio de venda acima do disponivel
- preco medio recalculado por compras
- historico de operacoes mantido
- alertas independentes de estar ou nao em carteira
- separacao clara entre favorito, carteira, intencao e alertas

## Observacao sobre B3

A B3 nao oferece API publica simples e gratuita para cotacao em tempo real para pessoa fisica. Por isso, o app usa arquitetura de provider para plugar API real sem alterar regras de negocio nem UI.
