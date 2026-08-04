# Rede de segurança de dados — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Give the user a self-controlled backup (export/import a JSON file) and stop the auto-sync from pushing a fully-empty payload over the cloud.

**Architecture:** Pure, testable helpers in `lib/backup.js` (Node `node --test` + browser via `window.Backup`), consumed by `app.js` for two Configurações buttons and one guard in the auto-sync path.

**Tech Stack:** Vanilla JS browser script (`app.js`), Node ESM, `node --test`, Vercel static + serverless.

**Spec:** `docs/superpowers/specs/2026-08-04-rede-seguranca-dados-design.md`

---

## File Structure
- **Create** `lib/backup.js` — `buildBackup`, `parseBackup`, `isPayloadEmpty` (pure, no deps).
- **Create** `test/backup.test.js` — `node --test` unit tests.
- **Modify** `index.html` — module shim also imports `lib/backup.js` → `window.Backup`; bump cache-buster.
- **Modify** `vercel.json` — serve `lib/backup.js` static.
- **Modify** `app.js` — export/import buttons in Configurações; empty-payload guard in `scheduleLegacyCloudSync`.

---

## Task A: `lib/backup.js` + tests

**Files:**
- Create: `lib/backup.js`
- Test: `test/backup.test.js`

- [ ] **Step 1: Write the failing tests**

Create `test/backup.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBackup, parseBackup, isPayloadEmpty } from '../lib/backup.js'

const samplePayload = { portfolio: [{ ticker: 'PETR4' }], salesHistory: [], watchlist: [], alerts: [] }

test('buildBackup wraps payload in an envelope', () => {
  const b = buildBackup(samplePayload, '2026-08-04T10:00:00.000Z')
  assert.equal(b.app, 'invest-track')
  assert.equal(b.version, 1)
  assert.equal(b.exportedAt, '2026-08-04T10:00:00.000Z')
  assert.deepEqual(b.data, samplePayload)
})

test('parseBackup accepts a valid envelope', () => {
  const text = JSON.stringify(buildBackup(samplePayload, '2026-08-04T10:00:00.000Z'))
  const r = parseBackup(text)
  assert.equal(r.ok, true)
  assert.deepEqual(r.data.portfolio, samplePayload.portfolio)
})

test('parseBackup rejects invalid JSON', () => {
  const r = parseBackup('{not json')
  assert.equal(r.ok, false)
  assert.ok(r.error)
})

test('parseBackup rejects wrong app', () => {
  const r = parseBackup(JSON.stringify({ app: 'outra-coisa', version: 1, data: samplePayload }))
  assert.equal(r.ok, false)
})

test('parseBackup rejects unsupported version', () => {
  const r = parseBackup(JSON.stringify({ app: 'invest-track', version: 999, data: samplePayload }))
  assert.equal(r.ok, false)
})

test('parseBackup tolerates a raw payload with a portfolio array', () => {
  const r = parseBackup(JSON.stringify(samplePayload))
  assert.equal(r.ok, true)
  assert.equal(r.data.portfolio.length, 1)
})

test('parseBackup rejects empty text', () => {
  assert.equal(parseBackup('').ok, false)
})

test('isPayloadEmpty', () => {
  assert.equal(isPayloadEmpty({ portfolio: [], salesHistory: [], watchlist: [], alerts: [] }), true)
  assert.equal(isPayloadEmpty({}), true)
  assert.equal(isPayloadEmpty({ portfolio: [{ ticker: 'X' }] }), false)
  assert.equal(isPayloadEmpty({ portfolio: [], salesHistory: [{ id: 1 }] }), false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/backup.test.js`
Expected: FAIL — `Cannot find module '../lib/backup.js'`.

- [ ] **Step 3: Implement `lib/backup.js`**

Create `lib/backup.js`:

```js
// Pure, dependency-free backup helpers. Used by Node tests and the browser
// (window.Backup). No filesystem/DOM access here.

const APP_ID = 'invest-track'
const SUPPORTED_VERSIONS = [1]
const CURRENT_VERSION = 1

export function buildBackup(payload, exportedAtISO) {
  return {
    app: APP_ID,
    version: CURRENT_VERSION,
    exportedAt: exportedAtISO,
    data: payload && typeof payload === 'object' ? payload : {},
  }
}

export function parseBackup(text) {
  const raw = String(text ?? '').trim()
  if (!raw) {
    return { ok: false, error: 'Arquivo vazio.' }
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Arquivo nao e um JSON valido.' }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Conteudo do backup invalido.' }
  }

  // Enveloped backup.
  if (parsed.app !== undefined || parsed.version !== undefined || parsed.data !== undefined) {
    if (parsed.app !== APP_ID) {
      return { ok: false, error: 'Este arquivo nao e um backup do invest-track.' }
    }
    if (!SUPPORTED_VERSIONS.includes(Number(parsed.version))) {
      return { ok: false, error: `Versao de backup nao suportada (${parsed.version}).` }
    }
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { ok: false, error: 'Backup sem dados.' }
    }
    return { ok: true, data: parsed.data }
  }

  // Tolerance: a raw payload that at least looks like app data.
  if (Array.isArray(parsed.portfolio)) {
    return { ok: true, data: parsed }
  }

  return { ok: false, error: 'Arquivo nao reconhecido como backup.' }
}

export function isPayloadEmpty(payload) {
  const p = payload && typeof payload === 'object' ? payload : {}
  const len = (v) => (Array.isArray(v) ? v.length : 0)
  return (
    len(p.portfolio) === 0 &&
    len(p.salesHistory) === 0 &&
    len(p.watchlist) === 0 &&
    len(p.alerts) === 0
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/backup.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/backup.js test/backup.test.js
git commit -m "feat: modulo de backup (build/parse/isPayloadEmpty) com testes"
```

---

## Task B: Browser wiring — serve `lib/backup.js`, expose `window.Backup`

**Files:**
- Modify: `vercel.json`
- Modify: `index.html`

- [ ] **Step 1: Serve `lib/backup.js` on Vercel**

In `vercel.json` `builds`, add alongside `lib/consensus.js`:

```json
    {
      "src": "lib/backup.js",
      "use": "@vercel/static"
    }
```

- [ ] **Step 2: Import it in the module shim and bump cache**

In `index.html`, change the existing module shim to also import backup, and bump BOTH cache-busters from `20260804-2` to `20260804-3`:

```html
    <script type="module">
      import * as Consensus from './lib/consensus.js?v=20260804-3'
      import * as Backup from './lib/backup.js?v=20260804-3'
      window.Consensus = Consensus
      window.Backup = Backup
    </script>
    <script src="./app.js?v=20260804-3" defer></script>
```

- [ ] **Step 3: Verify served + syntax**

Run: `node --check lib/backup.js && node --test`
Expected: OK; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add vercel.json index.html
git commit -m "chore: serve lib/backup.js e expoe window.Backup"
```

---

## Task C: Export/Import buttons + empty-sync guard (app.js)

**Files:**
- Modify: `app.js`

> Read the current `app.js` first to locate: (a) the Configurações panel markup where the cloud-account buttons live (search for `btnCloudSyncNow` / `id="btnCloudSyncNow"` and the surrounding cloud form), (b) the `scheduleLegacyCloudSync` function (search `function scheduleLegacyCloudSync`), (c) the existing helpers `buildLegacyCloudPayload`, `applyLegacyCloudPayload`, `syncLegacyCloudData`, `toNumber`, `escapeHtml`.

- [ ] **Step 1: Add export/import handler helpers (app.js)**

Add these functions near `syncLegacyCloudData` in `app.js`:

```js
function exportPortfolioBackup() {
  if (!window.Backup || typeof window.Backup.buildBackup !== "function") {
    window.alert("Nao foi possivel preparar o backup agora. Recarregue a pagina e tente de novo.");
    return;
  }
  const payload = buildLegacyCloudPayload();
  const backup = window.Backup.buildBackup(payload, new Date().toISOString());
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `carteira-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importPortfolioBackup(file) {
  if (!file) return;
  if (!window.Backup || typeof window.Backup.parseBackup !== "function") {
    window.alert("Nao foi possivel importar agora. Recarregue a pagina e tente de novo.");
    return;
  }
  let text = "";
  try {
    text = await file.text();
  } catch {
    window.alert("Nao foi possivel ler o arquivo.");
    return;
  }
  const result = window.Backup.parseBackup(text);
  if (!result.ok) {
    window.alert(`Backup invalido: ${result.error}`);
    return;
  }
  const count = Array.isArray(result.data.portfolio) ? result.data.portfolio.length : 0;
  const confirmed = window.confirm(`Isto vai substituir sua carteira atual por ${count} ativo(s) do backup. Continuar?`);
  if (!confirmed) return;

  applyLegacyCloudPayload(result.data);
  render();
  updateStatusLine();
  if (state.session.user && state.session.token) {
    await syncLegacyCloudData(true);
  } else {
    window.alert("Backup restaurado neste navegador. Entre na sua conta para salvar na nuvem.");
  }
}
```

- [ ] **Step 2: Add the buttons + hidden file input to the Configurações panel**

In the cloud-account section of the settings markup (right after the `btnCloudSyncNow` button), add:

```html
          <div class="backup-actions" style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn" id="btnExportBackup">Exportar carteira (backup)</button>
            <button type="button" class="btn" id="btnImportBackup">Importar backup</button>
            <input type="file" id="inputImportBackup" accept="application/json,.json" style="display:none" />
          </div>
```

- [ ] **Step 3: Wire the buttons (in the same place the other cloud buttons get their `onclick`)**

Where `btnCloudSyncNow.onclick` is assigned, add:

```js
    const btnExportBackup = document.getElementById("btnExportBackup");
    if (btnExportBackup) {
      btnExportBackup.onclick = () => exportPortfolioBackup();
    }

    const btnImportBackup = document.getElementById("btnImportBackup");
    const inputImportBackup = document.getElementById("inputImportBackup");
    if (btnImportBackup && inputImportBackup) {
      btnImportBackup.onclick = () => inputImportBackup.click();
      inputImportBackup.onchange = async () => {
        const file = inputImportBackup.files && inputImportBackup.files[0];
        await importPortfolioBackup(file);
        inputImportBackup.value = ""; // allow re-importing the same file
      };
    }
```

- [ ] **Step 4: Guard `scheduleLegacyCloudSync` against empty payload**

At the top of `scheduleLegacyCloudSync` (after the existing early-return conditions), add a guard that skips the auto-sync when the whole payload is empty:

```js
  if (window.Backup && typeof window.Backup.isPayloadEmpty === "function" &&
      window.Backup.isPayloadEmpty(buildLegacyCloudPayload())) {
    return; // nunca empurra um backup vazio automaticamente (protecao anti-perda)
  }
```

Place it so it runs for the automatic path only (do NOT add it inside `syncLegacyCloudData`, which stays usable for manual sync).

- [ ] **Step 5: Verify syntax + tests + bump cache**

Run: `node --check app.js && node --test`
Expected: app.js OK; all tests pass.

Confirm `index.html` already carries `?v=20260804-3` from Task B (Task C adds no new bundle version).

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: botoes exportar/importar backup e guarda anti-sobrescrita no sync"
```

---

## Task D: Manual verification + deploy

- [ ] **Step 1: Full test run**

Run: `node --test`
Expected: all suites PASS (consensus, analystSource, backup).

- [ ] **Step 2: Push branch and open PR (preview)**

```bash
git push -u origin feat/rede-seguranca-dados
```
Then open the PR (browser) so Vercel builds a preview.

- [ ] **Step 3: Verify on preview**
- Configurações → **Exportar carteira (backup)** baixa um `.json` com suas ações.
- **Importar backup** → escolher o arquivo → confirma → carteira restaurada e sincronizada.
- Editar/limpar e checar que um estado totalmente vazio não sobe sozinho (só com "Sincronizar agora").
- `/api/health` inalterado; `node --test` verde.

---

## Self-review (author)
- **Spec coverage:** Seção 1 → Task A; Seções 2–3 (export/import) → Task C Steps 1–3; Seção 4 (guarda) → Task C Step 4; Seção 5 (wiring) → Task B; Seção 6 (testes) → Task A.
- **Type consistency:** `window.Backup.buildBackup/parseBackup/isPayloadEmpty` names match `lib/backup.js` exports and the tests. `buildLegacyCloudPayload`/`applyLegacyCloudPayload`/`syncLegacyCloudData` are existing app.js functions reused as-is.
- **No placeholders:** all steps include concrete code.
