# Design — Rede de segurança de dados (export/import + guarda anti-sobrescrita)

**Data:** 2026-08-04
**Status:** Aprovado (design), pendente implementação
**Motivação:** Um incidente real (carteira sumindo ao limpar cookies / sessão vazia sobrescrevendo a nuvem) mostrou que falta um backup que o usuário controle e uma proteção contra apagamento acidental.

## Escopo (aprovado)
- **Exportar** toda a base do usuário para um arquivo `.json` (backup local).
- **Importar** um arquivo de backup, substituindo os dados atuais (com confirmação).
- **Reforço:** o sync automático não empurra um payload totalmente vazio para a nuvem.

## Fora de escopo
- "Esqueci a senha" por e-mail (o app não tem envio de e-mail).
- Merge inteligente na importação (é substituição, com confirmação).
- Versionamento/histórico de backups na nuvem.

## Seção 1 — Módulo puro `lib/backup.js` (testável)
Funções puras, sem dependência de navegador, consumidas pelos testes (`node --test`) e pelo navegador (via `window.Backup`, mesmo mecanismo do `window.Consensus`).

- `buildBackup(payload, exportedAtISO)` → `{ app: "invest-track", version: 1, exportedAt: exportedAtISO, data: payload }`.
- `parseBackup(text)` → `{ ok: true, data }` se o texto for um backup válido (JSON com `app === "invest-track"`, `version` numérico suportado e `data` objeto); senão `{ ok: false, error }`. Aceita tolerância: se vier só o payload cru (sem envelope) mas com forma de dados conhecida (`portfolio` array), também aceita.
- `isPayloadEmpty(payload)` → `true` quando `portfolio`, `salesHistory`, `watchlist` e `alerts` são todos vazios/ausentes.

## Seção 2 — Exportar (app.js, painel Configurações)
Botão **"Exportar carteira (backup)"**:
1. Monta o payload com o `buildLegacyCloudPayload()` existente (portfólio, vendas, watchlist, alertas, trailingHighs, dismissedTickers, settings).
2. `window.Backup.buildBackup(payload, new Date().toISOString())`.
3. Gera download de `carteira-backup-AAAA-MM-DD.json` via `Blob` + `<a download>`.

## Seção 3 — Importar (app.js, painel Configurações)
Botão **"Importar backup"** + `<input type="file" accept="application/json">` oculto:
1. Lê o texto do arquivo (`FileReader`/`file.text()`).
2. `window.Backup.parseBackup(text)`; se `!ok` → `alert` com o erro e aborta.
3. Confirmação: *"Isto vai substituir sua carteira atual por N ações do backup. Continuar?"* (N = `data.portfolio.length`).
4. Se confirmar → `applyLegacyCloudPayload(data)` (função existente, já persiste em localStorage e re-renderiza) → `syncLegacyCloudData(true)` para subir à nuvem.

## Seção 4 — Reforço anti-sobrescrita (app.js)
Em `scheduleLegacyCloudSync` (o sync automático debounced disparado a cada save), **não agendar** o push quando `window.Backup.isPayloadEmpty(buildLegacyCloudPayload())` for `true`. Um sync **manual** (`syncLegacyCloudData(true)`, botão "Sincronizar agora" ou a importação) continua permitido — para o caso legítimo de o usuário querer zerar. Se `window.Backup` não estiver carregado, mantém o comportamento atual (não bloqueia).

## Seção 5 — Wiring do módulo no navegador
- `index.html`: o shim `type="module"` passa a importar também `./lib/backup.js` e expor `window.Backup`. Bump do cache-buster.
- `vercel.json`: adicionar `lib/backup.js` como `@vercel/static`.

## Seção 6 — Testes
`test/backup.test.js` (`node --test`):
- `buildBackup` monta o envelope com app/version/exportedAt/data.
- `parseBackup`: backup válido; JSON inválido; `app` errado; `version` não suportada; payload cru com `portfolio` (tolerância) aceito; texto vazio.
- `isPayloadEmpty`: vazio → true; com 1 ação → false; com só vendas → false.

## Arquivos afetados
- Criar: `lib/backup.js`, `test/backup.test.js`.
- Modificar: `app.js` (botões export/import + guarda no sync), `index.html` (shim + cache), `vercel.json` (static), possivelmente `style.css` (estilo dos botões, se necessário).

## Riscos & mitigações
- **Importar sobrescreve dados atuais** → confirmação explícita com contagem; e o usuário pode exportar antes.
- **Guarda de payload vazio bloquear um "zerei tudo" legítimo** → só bloqueia o sync AUTOMÁTICO; o manual continua.
- **Módulo não carregado (timing)** → fallbacks: export/import só disparam no clique (módulo já carregado); a guarda degrada para o comportamento atual.
