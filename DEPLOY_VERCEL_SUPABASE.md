# Deploy Vercel + Supabase

Este checklist coloca o app online com persistencia real em nuvem e teste entre duas maquinas.

## 1. Criar o banco no Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo [supabase/schema.sql](supabase/schema.sql).
4. No menu `Project Settings -> API`, copie:
   - `Project URL`
   - `service_role` key

## 2. Publicar na Vercel

1. Suba este repositorio para GitHub, se ainda nao estiver la.
2. Na Vercel, clique em `Add New Project`.
3. Importe o repositorio.
4. Em `Settings -> Environment Variables`, cadastre:

```env
YAHOO_HTTP_TIMEOUT_MS=10000
QUOTE_CACHE_TTL_MS=15000
HISTORY_CACHE_TTL_MS=180000
ANALYST_CACHE_TTL_MS=300000
TOP10_CACHE_TTL_MS=240000
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
SUPABASE_USERS_TABLE=invest_track_users
SUPABASE_CLOUD_TABLE=invest_track_cloud_data
AUTH_TOKEN_SECRET=troque-por-um-segredo-forte-e-unico
AUTH_TOKEN_TTL_SECONDS=2592000
```

5. Faça o primeiro deploy.
6. Abra a URL publicada, por exemplo `https://seu-projeto.vercel.app`.

## 3. Configurar o app publicado

1. Abra a aba `Configuracoes`.
2. Em `URL base backend/API`, deixe vazio.
3. Salve as configuracoes.
4. Ainda em `Configuracoes`, crie sua conta.
5. Clique em `Sincronizar agora`.

## 4. Teste entre duas maquinas

### Maquina 1

1. Abra o site publicado.
2. Entre com sua conta.
3. Cadastre ou edite alguns ativos.
4. Clique em `Sincronizar agora`.
5. Confirme que o status mostra conta conectada e nuvem sincronizada.

### Maquina 2

1. Abra o mesmo dominio publicado.
2. Entre com a mesma conta.
3. Abra `Configuracoes`.
4. Clique em `Sincronizar agora` se necessario.
5. Volte para `Minha Carteira`.
6. Confirme que os mesmos dados apareceram.

## 5. Verificacao no Supabase

Rode estas consultas no SQL Editor para confirmar que os dados estao chegando:

```sql
select id, email, created_at
from public.invest_track_users
order by created_at desc;

select user_id, updated_at
from public.invest_track_cloud_data
order by updated_at desc;
```

## 6. Se algo nao carregar

1. Confirme que `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` foram configurados na Vercel.
2. Confirme que o SQL de [supabase/schema.sql](supabase/schema.sql) foi executado sem erro.
3. Confirme que `AUTH_TOKEN_SECRET` existe e nao ficou vazio.
4. No app publicado, deixe `URL base backend/API` vazia.
5. Faça logout e login novamente.
6. Clique em `Sincronizar agora`.

## 7. Resultado esperado

1. O site fica acessivel por URL publica.
2. Login funciona pelo dominio publicado.
3. Dados ficam no Supabase, nao presos ao navegador local.
4. Outra maquina acessa os mesmos dados usando a mesma conta.
