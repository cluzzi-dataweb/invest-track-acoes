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
