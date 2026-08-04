# Consenso de analistas com convicção — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the analyst data into a graded consensus (COMPRA FORTE…VENDA FORTE) with a 0–100 conviction score, make high-conviction consensus drive the agent's buy/hold/sell decision, and make the data source resilient (retry + last-good).

**Architecture:** Pure decision logic moves to a dependency-free ES module (`lib/consensus.js`) tested with Node's built-in test runner and consumed by the browser via a small module shim (`window.Consensus`). The Yahoo analyst fetch is extracted to a shared backend source module (`server/analystSource.js`) with retry + last-good, used by both `api/index.js` (prod serverless) and `server/index.js` (local dev). `app.js` wires these in and renders a graded badge + a new "Convicção" column.

**Tech Stack:** Vanilla JS (browser global script `app.js`), Node ESM (`type: module`), `node --test` (built-in, no new deps), Yahoo Finance via `yahoo-finance2`, Vercel static + serverless.

**Spec:** `docs/superpowers/specs/2026-08-04-consenso-analistas-conviccao-design.md`

---

## File Structure

- **Create** `lib/consensus.js` — pure functions: `computeConsensus`, `decideSignal`, `consensusLabelFromScore`, config. Zero browser/node deps.
- **Create** `test/consensus.test.js` — `node --test` unit tests for the above.
- **Create** `server/analystSource.js` — `fetchAnalystConsensus(ticker, { yahooFinance })`: Yahoo impl + retry + last-good, returns distribution+targets+count.
- **Create** `test/analystSource.test.js` — `node --test` for retry + last-good using an injected fake `yahooFinance`.
- **Modify** `api/index.js` — use `fetchAnalystConsensus`; `/api/market/analyst` returns enriched object; `getTop10AnalystIdeas` uses it.
- **Modify** `server/index.js` — use the shared source module (remove duplicate `getAnalystConsensusByTicker`).
- **Modify** `index.html` — module shim populating `window.Consensus`; bump `app.js` cache version.
- **Modify** `vercel.json` — serve `lib/consensus.js` as static.
- **Modify** `app.js` — `getFinalSignal` becomes a thin wrapper over `decideSignal`; `fetchAnalystData` carries distribution + stale; `getBuyReason` respects conviction; graded consensus badge; "Convicção" column.
- **Modify** `style.css` — conviction column/badge styling.
- **Modify** `package.json` — add `"test": "node --test"`.

---

## Task 1: Test script + `computeConsensus`

**Files:**
- Modify: `package.json`
- Create: `lib/consensus.js`
- Test: `test/consensus.test.js`

- [ ] **Step 1: Add the test script**

In `package.json`, add to `"scripts"`:

```json
    "test": "node --test"
```

- [ ] **Step 2: Write the failing test**

Create `test/consensus.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeConsensus, consensusLabelFromScore } from '../lib/consensus.js'

test('label from score thresholds', () => {
  assert.equal(consensusLabelFromScore(2), 'COMPRA FORTE')
  assert.equal(consensusLabelFromScore(1.5), 'COMPRA FORTE')
  assert.equal(consensusLabelFromScore(1), 'COMPRA')
  assert.equal(consensusLabelFromScore(0), 'MANTER')
  assert.equal(consensusLabelFromScore(-1), 'VENDA')
  assert.equal(consensusLabelFromScore(-2), 'VENDA FORTE')
})

test('strong buy distribution with many analysts and tight targets = high conviction', () => {
  const r = computeConsensus({
    distribution: { strongBuy: 12, buy: 5, hold: 1, sell: 0, strongSell: 0 },
    analystsCount: 18,
    targetMin: 60, targetMean: 65, targetMax: 72,
  })
  assert.equal(r.label, 'COMPRA FORTE')
  assert.equal(r.available, true)
  assert.ok(r.conviction >= 70, `conviction ${r.conviction} should be >= 70`)
  assert.equal(r.highConviction, true)
})

test('split distribution with few analysts = low conviction, MANTER', () => {
  const r = computeConsensus({
    distribution: { strongBuy: 1, buy: 1, hold: 2, sell: 1, strongSell: 1 },
    analystsCount: 6,
    targetMin: 10, targetMean: 20, targetMax: 40,
  })
  assert.equal(r.label, 'MANTER')
  assert.ok(r.conviction < 65, `conviction ${r.conviction} should be < 65`)
  assert.equal(r.highConviction, false)
})

test('no distribution falls back to raw recommendation with limited conviction', () => {
  const r = computeConsensus({
    recommendationRaw: 'buy',
    analystsCount: 10,
    targetMin: 12, targetMean: 15, targetMax: 18,
  })
  assert.equal(r.label, 'COMPRA')
  assert.equal(r.components.hasDistribution, false)
  // agreement is neutral (0.5) without a distribution
  assert.equal(r.components.agreement, 0.5)
})

test('missing targets: tightness weight is redistributed, still computes', () => {
  const r = computeConsensus({
    distribution: { strongBuy: 10, buy: 4, hold: 1, sell: 0, strongSell: 0 },
    analystsCount: 15,
  })
  assert.equal(r.components.hasTargets, false)
  assert.equal(r.components.tightness, 0)
  assert.ok(r.conviction >= 80, `conviction ${r.conviction} should be high without targets`)
})

test('unavailable when no data at all', () => {
  const r = computeConsensus({})
  assert.equal(r.available, false)
  assert.equal(r.conviction, 0)
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/consensus.test.js`
Expected: FAIL — `Cannot find module '../lib/consensus.js'`.

- [ ] **Step 4: Implement `lib/consensus.js` (consensus part)**

Create `lib/consensus.js`:

```js
// Pure, dependency-free consensus + decision logic.
// Consumed by Node tests (import) and the browser (window.Consensus shim).

export const CONSENSUS_CONFIG = {
  weights: { coverage: 0.40, agreement: 0.35, tightness: 0.25 },
  coverageFullAt: 15, // analysts count for maximum coverage component
  highConviction: 65, // conviction >= this is "alta conviccao"
  labelThresholds: { strongBuy: 1.5, buy: 0.5, hold: -0.5, sell: -1.5 },
}

function toNumber(value, fallback = NaN) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

export function consensusLabelFromScore(score) {
  if (!Number.isFinite(score)) return 'MANTER'
  const t = CONSENSUS_CONFIG.labelThresholds
  if (score >= t.strongBuy) return 'COMPRA FORTE'
  if (score >= t.buy) return 'COMPRA'
  if (score > t.hold) return 'MANTER'
  if (score > t.sell) return 'VENDA'
  return 'VENDA FORTE'
}

function scoreFromRawRecommendation(raw) {
  const n = String(raw ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!n || n === '-' || n.includes('indispon')) return NaN
  if (n === 'strong buy' || n === 'strongbuy' || n === 'compra forte') return 2
  if (n === 'buy' || n === 'outperform' || n === 'overweight' || n === 'compra') return 1
  if (n === 'hold' || n === 'neutral' || n === 'manter') return 0
  if (n === 'sell' || n === 'underperform' || n === 'underweight' || n === 'reduce' || n === 'venda') return -1
  if (n === 'strong sell' || n === 'strongsell' || n === 'venda forte') return -2
  return NaN
}

export function computeConsensus(analyst) {
  const dist = analyst?.distribution || {}
  const sb = toNumber(dist.strongBuy, 0)
  const b = toNumber(dist.buy, 0)
  const h = toNumber(dist.hold, 0)
  const s = toNumber(dist.sell, 0)
  const ss = toNumber(dist.strongSell, 0)
  const distTotal = sb + b + h + s + ss
  const hasDistribution = distTotal > 0

  const analystsCount = toNumber(analyst?.analystsCount, distTotal) || distTotal

  let score
  if (hasDistribution) {
    score = (2 * sb + 1 * b + 0 * h - 1 * s - 2 * ss) / distTotal
  } else {
    score = scoreFromRawRecommendation(analyst?.recommendationRaw ?? analyst?.recommendation)
  }

  if (!Number.isFinite(score)) {
    return { label: '-', score: null, conviction: 0, available: false, highConviction: false, components: null }
  }

  const label = consensusLabelFromScore(score)
  const coverage = clamp((analystsCount || 0) / CONSENSUS_CONFIG.coverageFullAt, 0, 1)

  let agreement
  if (hasDistribution) {
    const side =
      label === 'COMPRA FORTE' || label === 'COMPRA' ? sb + b
      : label === 'VENDA FORTE' || label === 'VENDA' ? s + ss
      : h
    agreement = side / distTotal
  } else {
    agreement = 0.5
  }

  const targetLow = toNumber(analyst?.targetLow ?? analyst?.targetMin, NaN)
  const targetMean = toNumber(analyst?.targetMean, NaN)
  const targetHigh = toNumber(analyst?.targetHigh ?? analyst?.targetMax, NaN)
  const hasTargets =
    Number.isFinite(targetLow) && Number.isFinite(targetHigh) &&
    Number.isFinite(targetMean) && targetMean > 0

  const weights = { ...CONSENSUS_CONFIG.weights }
  let tightness = 0
  if (hasTargets) {
    const dispersion = (targetHigh - targetLow) / targetMean
    tightness = clamp(1 - dispersion, 0, 1)
  } else {
    const rest = weights.coverage + weights.agreement
    const t = weights.tightness
    weights.coverage += t * (weights.coverage / rest)
    weights.agreement += t * (weights.agreement / rest)
    weights.tightness = 0
  }

  const conviction = clamp(
    Math.round(100 * (weights.coverage * coverage + weights.agreement * agreement + weights.tightness * tightness)),
    0,
    100,
  )

  return {
    label,
    score,
    conviction,
    available: true,
    highConviction: conviction >= CONSENSUS_CONFIG.highConviction,
    components: {
      coverage, agreement, tightness,
      analystsCount, distTotal, hasDistribution, hasTargets,
      targetLow, targetMean, targetHigh,
    },
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test test/consensus.test.js`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json lib/consensus.js test/consensus.test.js
git commit -m "feat: computeConsensus (rotulo graduado + conviccao 0-100) com testes"
```

---

## Task 2: `decideSignal` (final signal, high-conviction aware)

**Files:**
- Modify: `lib/consensus.js`
- Test: `test/consensus.test.js`

- [ ] **Step 1: Write the failing test**

Append to `test/consensus.test.js`:

```js
import { decideSignal } from '../lib/consensus.js'

const base = {
  recommendation: 'COMPRAR', consensusLabel: 'COMPRA', conviction: 80,
  upsidePct: 30, pnlPct: 0, status: 'MANTER',
  currentPrice: 10, technicalSellPrice: NaN,
}

test('high-conviction buy overrides a soft technical alert', () => {
  assert.equal(decideSignal({ ...base, status: 'ATENCAO' }), 'COMPRAR')
})

test('hard exit (status VENDER) beats high-conviction buy', () => {
  assert.equal(decideSignal({ ...base, status: 'VENDER' }), 'VENDER')
})

test('high-conviction VENDA FORTE => VENDER', () => {
  assert.equal(decideSignal({ ...base, consensusLabel: 'VENDA FORTE', recommendation: 'VENDER', upsidePct: -8 }), 'VENDER')
})

test('high-conviction VENDA => REDUZIR', () => {
  assert.equal(decideSignal({ ...base, consensusLabel: 'VENDA', recommendation: 'REDUZIR', upsidePct: 2 }), 'REDUZIR')
})

test('low conviction falls back to legacy: attention + buy with no profit => MANTER', () => {
  // upsidePct 10 so the strong-opportunity path (upside > 15) does not fire and
  // we actually exercise the soft-attention fallback.
  assert.equal(decideSignal({ ...base, conviction: 40, status: 'ATENCAO', pnlPct: 0, upsidePct: 10 }), 'MANTER')
})

test('buy to improve average: below-average price with upside, neutral consensus => COMPRAR', () => {
  assert.equal(
    decideSignal({ ...base, conviction: 40, consensusLabel: 'MANTER', recommendation: 'MANTER', pnlPct: -8, upsidePct: 20 }),
    'COMPRAR',
  )
})

test('buy more zone (status COMPRAR MAIS) => COMPRAR', () => {
  assert.equal(
    decideSignal({ ...base, conviction: 30, consensusLabel: 'MANTER', recommendation: 'MANTER', status: 'COMPRAR MAIS', upsidePct: 5 }),
    'COMPRAR',
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/consensus.test.js`
Expected: FAIL — `decideSignal` is not exported.

- [ ] **Step 3: Implement `decideSignal` in `lib/consensus.js`**

Append to `lib/consensus.js`:

```js
// Ports the tactical getFinalSignal logic and adds a high-conviction consensus
// override. Inputs are already-normalized primitives (pure & testable).
export function decideSignal(input) {
  const recommendation = input?.recommendation ?? null // COMPRAR|MANTER|REDUZIR|VENDER|null
  const consensusLabel = input?.consensusLabel ?? '-'
  const conviction = toNumber(input?.conviction, 0)
  const upsidePct = toNumber(input?.upsidePct, NaN)
  const pnlPct = toNumber(input?.pnlPct, NaN)
  const status = String(input?.status || '').toUpperCase()
  const currentPrice = toNumber(input?.currentPrice, NaN)
  const technicalSellPrice = toNumber(input?.technicalSellPrice, NaN)

  const hasStrongExitStatus = status === 'VENDER'
  const hasAttentionStatus = status === 'ATENCAO'
  const isNearTechnicalSell =
    Number.isFinite(currentPrice) && Number.isFinite(technicalSellPrice) &&
    technicalSellPrice > 0 && currentPrice >= technicalSellPrice * 0.985

  const upsideNonPositive = Number.isFinite(upsidePct) && upsidePct <= 0
  const upsideClearlyNegative = Number.isFinite(upsidePct) && upsidePct <= -5
  const upsideVeryLowWithProfit = Number.isFinite(upsidePct) && upsidePct <= 5 && Number.isFinite(pnlPct) && pnlPct >= 12
  const lowUpsideWithProfit = Number.isFinite(upsidePct) && upsidePct <= 10 && Number.isFinite(pnlPct) && pnlPct >= 15
  const hasHardExitByTechnical = isNearTechnicalSell && Number.isFinite(pnlPct) && pnlPct >= 15 && Number.isFinite(upsidePct) && upsidePct <= 3
  const hasHardExitByAsymmetry = upsideClearlyNegative || (upsideNonPositive && Number.isFinite(pnlPct) && pnlPct >= 20)

  // 1) Hard exits win first (risk protects).
  if (
    hasStrongExitStatus ||
    recommendation === 'VENDER' ||
    hasHardExitByAsymmetry ||
    hasHardExitByTechnical ||
    (hasAttentionStatus && recommendation === 'REDUZIR' && Number.isFinite(upsidePct) && upsidePct <= 8)
  ) {
    return 'VENDER'
  }

  // 2) High-conviction consensus drives the decision.
  const highConviction = conviction >= CONSENSUS_CONFIG.highConviction
  if (highConviction && consensusLabel === 'VENDA FORTE') {
    return 'VENDER'
  }
  if (highConviction && consensusLabel === 'VENDA') {
    return 'REDUZIR'
  }
  const consensusBuy = consensusLabel === 'COMPRA FORTE' || consensusLabel === 'COMPRA'
  if (highConviction && consensusBuy && !isNearTechnicalSell && status !== 'REDUZIR') {
    return 'COMPRAR'
  }

  // 3) Strong analyst opportunity (legacy moderate calibration).
  const strongBuyOpportunity =
    recommendation === 'COMPRAR' && Number.isFinite(upsidePct) && upsidePct > 15 &&
    !isNearTechnicalSell && status !== 'REDUZIR'
  if (strongBuyOpportunity) {
    return 'COMPRAR'
  }

  // 4) Buy to improve the average price.
  const consensusNotNegative = recommendation !== 'VENDER' && recommendation !== 'REDUZIR'
  const inBuyMoreZone = status === 'COMPRAR MAIS'
  const belowAverageWithUpside = Number.isFinite(pnlPct) && pnlPct < 0 && Number.isFinite(upsidePct) && upsidePct > 15
  if (consensusNotNegative && !isNearTechnicalSell && status !== 'REDUZIR' && (inBuyMoreZone || belowAverageWithUpside)) {
    return 'COMPRAR'
  }

  // 5) Soft attention + buy consensus.
  if (recommendation === 'COMPRAR' && Number.isFinite(upsidePct) && upsidePct > 0 && hasAttentionStatus) {
    return (Number.isFinite(pnlPct) && pnlPct >= 12) ? 'REDUZIR' : 'MANTER'
  }

  // 6) Reduce conditions.
  if (
    status === 'REDUZIR' || lowUpsideWithProfit || upsideVeryLowWithProfit ||
    (hasAttentionStatus && Number.isFinite(pnlPct) && pnlPct >= 10) || recommendation === 'REDUZIR'
  ) {
    return 'REDUZIR'
  }

  // 7) Legacy buy fallback.
  const attractiveUpside = Number.isFinite(upsidePct) && upsidePct > 15
  const hasStrongAlert = hasAttentionStatus || status === 'REDUZIR' || status === 'VENDER'
  if (recommendation === 'COMPRAR' && attractiveUpside && !hasStrongAlert && !isNearTechnicalSell) {
    return 'COMPRAR'
  }

  return 'MANTER'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/consensus.test.js`
Expected: PASS (13 tests total).

- [ ] **Step 5: Commit**

```bash
git add lib/consensus.js test/consensus.test.js
git commit -m "feat: decideSignal com prioridade de consenso de alta conviccao"
```

---

## Task 3: Backend source module `server/analystSource.js`

**Files:**
- Create: `server/analystSource.js`
- Test: `test/analystSource.test.js`

- [ ] **Step 1: Write the failing test (retry + last-good, injected fake)**

Create `test/analystSource.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createAnalystSource } from '../server/analystSource.js'

function fakeYahoo(sequence) {
  let i = 0
  return {
    async quoteSummary() {
      const step = sequence[Math.min(i, sequence.length - 1)]
      i += 1
      if (step instanceof Error) throw step
      return step
    },
  }
}

const goodSummary = {
  financialData: {
    targetMeanPrice: 65, targetLowPrice: 60, targetHighPrice: 72,
    numberOfAnalystOpinions: 18, recommendationKey: 'strong_buy',
  },
  recommendationTrend: { trend: [{ strongBuy: 12, buy: 5, hold: 1, sell: 0, strongSell: 0 }] },
}

test('returns distribution and targets on success', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([goodSummary]), retries: 2, retryDelayMs: 0 })
  const r = await src.fetchAnalystConsensus('SUZB3')
  assert.equal(r.available, true)
  assert.equal(r.analystsCount, 18)
  assert.deepEqual(r.distribution, { strongBuy: 12, buy: 5, hold: 1, sell: 0, strongSell: 0 })
  assert.equal(r.targetMean, 65)
  assert.equal(r.stale, false)
})

test('retries transient failure then succeeds', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([new Error('504'), goodSummary]), retries: 2, retryDelayMs: 0 })
  const r = await src.fetchAnalystConsensus('SUZB3')
  assert.equal(r.available, true)
  assert.equal(r.stale, false)
})

test('serves last-good marked stale when all retries fail', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([goodSummary]), retries: 1, retryDelayMs: 0 })
  await src.fetchAnalystConsensus('SUZB3') // primes last-good
  // now make it always fail
  src._setYahoo(fakeYahoo([new Error('504')]))
  const r = await src.fetchAnalystConsensus('SUZB3')
  assert.equal(r.available, true)
  assert.equal(r.stale, true)
  assert.equal(r.analystsCount, 18)
})

test('unavailable when failing with no last-good', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([new Error('504')]), retries: 1, retryDelayMs: 0 })
  const r = await src.fetchAnalystConsensus('XXXX3')
  assert.equal(r.available, false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/analystSource.test.js`
Expected: FAIL — `Cannot find module '../server/analystSource.js'`.

- [ ] **Step 3: Implement `server/analystSource.js`**

Create `server/analystSource.js`:

```js
// Analyst consensus source interface. Today: Yahoo Finance, with retry and a
// per-ticker last-good cache. New sources implement the same shape (Phase 2).

const DEFAULT_RETRIES = 3
const DEFAULT_RETRY_DELAY_MS = 400

function normalizeTicker(ticker) {
  return String(ticker ?? '').trim().toUpperCase().replace(/\.SA$/i, '')
}

function toYahooSymbol(ticker) {
  return `${normalizeTicker(ticker)}.SA`
}

function num(value, fallback = NaN) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function mapSummaryToConsensus(ticker, summary) {
  const financialData = summary?.financialData ?? {}
  const trend = summary?.recommendationTrend?.trend?.[0] ?? {}
  const distribution = {
    strongBuy: num(trend.strongBuy, 0),
    buy: num(trend.buy, 0),
    hold: num(trend.hold, 0),
    sell: num(trend.sell, 0),
    strongSell: num(trend.strongSell, 0),
  }
  const targetMean = num(financialData.targetMeanPrice, NaN)
  const targetLow = num(financialData.targetLowPrice, NaN)
  const targetHigh = num(financialData.targetHighPrice, NaN)
  const analystsCount = num(financialData.numberOfAnalystOpinions, 0)
  const available =
    Number.isFinite(targetMean) || Number.isFinite(targetLow) || Number.isFinite(targetHigh) ||
    distribution.strongBuy + distribution.buy + distribution.hold + distribution.sell + distribution.strongSell > 0

  return {
    ticker: normalizeTicker(ticker),
    distribution,
    targetMean, targetLow, targetHigh,
    // keep legacy fields for backward compatibility with existing callers
    targetMin: targetLow, targetMax: targetHigh,
    analystsCount,
    recommendationRaw: String(financialData.recommendationKey ?? ''),
    available,
    fetchedAt: null, // stamped by caller layer (Date.now not used in pure map)
    stale: false,
  }
}

export function createAnalystSource(options = {}) {
  let yahooFinance = options.yahooFinance
  const retries = Number.isFinite(options.retries) ? options.retries : DEFAULT_RETRIES
  const retryDelayMs = Number.isFinite(options.retryDelayMs) ? options.retryDelayMs : DEFAULT_RETRY_DELAY_MS
  const lastGood = new Map()

  async function fetchAnalystConsensus(tickerInput) {
    const ticker = normalizeTicker(tickerInput)
    const symbol = toYahooSymbol(ticker)

    let lastError
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        const summary = await yahooFinance.quoteSummary(symbol, {
          modules: ['financialData', 'recommendationTrend'],
        })
        const data = mapSummaryToConsensus(ticker, summary)
        data.fetchedAt = new Date().toISOString()
        if (data.available) {
          lastGood.set(ticker, data)
        }
        return data
      } catch (error) {
        lastError = error
        if (attempt < retries - 1 && retryDelayMs > 0) {
          await sleep(retryDelayMs * (attempt + 1))
        }
      }
    }

    const cached = lastGood.get(ticker)
    if (cached) {
      return { ...cached, stale: true }
    }
    return {
      ticker,
      distribution: { strongBuy: 0, buy: 0, hold: 0, sell: 0, strongSell: 0 },
      targetMean: NaN, targetLow: NaN, targetHigh: NaN, targetMin: NaN, targetMax: NaN,
      analystsCount: 0,
      recommendationRaw: '',
      available: false,
      fetchedAt: new Date().toISOString(),
      stale: false,
      error: String(lastError?.message ?? 'sem dados'),
    }
  }

  return {
    fetchAnalystConsensus,
    _setYahoo(next) { yahooFinance = next }, // test hook
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/analystSource.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/analystSource.js test/analystSource.test.js
git commit -m "feat: modulo de fonte de analistas com retry e ultimo-bom-valor"
```

---

## Task 4: Wire `api/index.js` (prod serverless) to the source module

**Files:**
- Modify: `api/index.js`

- [ ] **Step 1: Import and instantiate the source**

Near the top imports of `api/index.js` (after `import YahooFinance from 'yahoo-finance2'` and `const yahooFinance = new YahooFinance()`), add:

```js
import { createAnalystSource } from '../server/analystSource.js'

const analystSource = createAnalystSource({ yahooFinance })
```

- [ ] **Step 2: Replace `getAnalystConsensusByTicker` body to delegate + keep the app cache**

Replace the existing `getAnalystConsensusByTicker` function so it calls the source (which now owns retry/last-good) and preserves the in-memory TTL cache:

```js
async function getAnalystConsensusByTicker(ticker) {
  const cleanTicker = normalizeTicker(ticker)
  const cached = getCacheValue(analystCache, cleanTicker)
  if (cached) {
    return cached
  }

  const consensus = await analystSource.fetchAnalystConsensus(cleanTicker)
  const recommendation = mapRecommendation(consensus.recommendationRaw, consensus.distribution)

  const data = {
    ticker: cleanTicker,
    targetMean: consensus.targetMean,
    targetMin: consensus.targetMin,
    targetMax: consensus.targetMax,
    distribution: consensus.distribution,
    recommendation,
    recommendationRaw: consensus.recommendationRaw,
    analystsCount: consensus.analystsCount,
    available: consensus.available,
    stale: consensus.stale,
  }

  if (data.available && !consensus.stale) {
    setCacheValue(analystCache, cleanTicker, data, ANALYST_CACHE_TTL_MS)
  }
  return data
}
```

> Note: `mapRecommendation` already accepts `(recommendationKey, trend)` and reads `trend.strongBuy/buy/hold/sell/strongSell`; the `distribution` object has exactly those keys, so it is compatible.

- [ ] **Step 3: Return 200 with the enriched object in the analyst endpoint**

In the `/api/market/analyst/` handler, the existing code returns `data` when `available`. Confirm it now sends `distribution`, `recommendationRaw`, and `stale` (it does, since it returns the whole `data`). No further change needed beyond Step 2. Leave the `available === false → 404` behavior as-is.

- [ ] **Step 4: Run the analyst endpoint locally against the retry path (smoke)**

Run: `node --test` (ensures nothing else broke)
Expected: PASS for all test files.

- [ ] **Step 5: Commit**

```bash
git add api/index.js
git commit -m "refactor: api usa fonte de analistas compartilhada com distribuicao/stale"
```

---

## Task 5: Wire `server/index.js` (local dev) to the source module

**Files:**
- Modify: `server/index.js`

- [ ] **Step 1: Import the source and remove the duplicate fetch**

At the top of `server/index.js`, add:

```js
import { createAnalystSource } from './analystSource.js'
```

Just after the `yahooFinance` instance is created in `server/index.js`, add:

```js
const analystSource = createAnalystSource({ yahooFinance })
```

- [ ] **Step 2: Replace the body of `getAnalystConsensusByTicker` (server/index.js:216)**

Replace it with the same delegating implementation as Task 4 Step 2 (keeping the server's own `analystCache`, `getCacheValue`, `setCacheValue`, `mapRecommendation`, `ANALYST_CACHE_TTL_MS`, `normalizeTicker` names, which already exist in this file):

```js
async function getAnalystConsensusByTicker(ticker) {
  const cacheKey = getAnalystCacheKey(ticker)
  const cached = getCacheValue(analystCache, cacheKey)
  if (cached) {
    return cached
  }

  const cleanTicker = normalizeTicker(ticker)
  const consensus = await analystSource.fetchAnalystConsensus(cleanTicker)
  const recommendation = mapRecommendation(consensus.recommendationRaw, consensus.distribution)

  const data = {
    ticker: cleanTicker,
    targetMean: consensus.targetMean,
    targetMin: consensus.targetMin,
    targetMax: consensus.targetMax,
    distribution: consensus.distribution,
    recommendation,
    recommendationRaw: consensus.recommendationRaw,
    analystsCount: consensus.analystsCount,
    available: consensus.available,
    stale: consensus.stale,
  }

  if (data.available && !consensus.stale) {
    setCacheValue(analystCache, cacheKey, data, ANALYST_CACHE_TTL_MS)
  }
  return data
}
```

> If `server/index.js` does not define `normalizeTicker`, use the existing ticker-cleaning it already applies in `getAnalystCacheKey` (reuse that helper's cleaning) — check the file and match its existing helper name.

- [ ] **Step 3: Verify server boots**

Run: `node -e "import('./server/index.js').then(()=>{console.log('boot ok'); process.exit(0)}).catch(e=>{console.error(e); process.exit(1)})"`
Expected: prints `boot ok` (server may keep a port open — Ctrl-C is fine; the import resolving without throwing is the check).

- [ ] **Step 4: Commit**

```bash
git add server/index.js
git commit -m "refactor: server/index usa fonte de analistas compartilhada"
```

---

## Task 6: Browser wiring — expose `window.Consensus`, serve the lib, refactor `getFinalSignal`

**Files:**
- Modify: `vercel.json`
- Modify: `index.html`
- Modify: `app.js`

- [ ] **Step 1: Serve `lib/consensus.js` statically on Vercel**

In `vercel.json`, add to the `builds` array (alongside the other static entries):

```json
    {
      "src": "lib/consensus.js",
      "use": "@vercel/static"
    }
```

- [ ] **Step 2: Add the module shim in `index.html` (before app.js) and bump cache**

In `index.html`, immediately before the `<script src="./app.js?v=...">` line, add:

```html
    <script type="module">
      import * as Consensus from './lib/consensus.js?v=20260804-1'
      window.Consensus = Consensus
    </script>
```

And bump the app cache-buster on the next line:

```html
    <script src="./app.js?v=20260804-1" defer></script>
```

- [ ] **Step 3: Refactor `getFinalSignal` in `app.js` to delegate to `decideSignal`**

Replace the entire `getFinalSignal` function body (currently at `app.js` ~line 1106) with a thin wrapper. Keep the function name and signature so all callers keep working:

```js
function computeAssetConsensus(asset) {
  const source = asset?.analyst && typeof asset.analyst === "object" ? asset.analyst : asset;
  if (window.Consensus && typeof window.Consensus.computeConsensus === "function") {
    return window.Consensus.computeConsensus(source);
  }
  return { label: "-", conviction: 0, available: false, highConviction: false, components: null };
}

function getFinalSignal(asset) {
  const recommendation = normalizeAnalystRecommendation(
    asset?.analystRecommendation ?? asset?.analyst?.recommendation ?? asset?.recommendation
  );
  const consensus = computeAssetConsensus(asset);

  const input = {
    recommendation,
    consensusLabel: consensus?.label ?? "-",
    conviction: toNumber(consensus?.conviction, 0),
    upsidePct: toNumber(asset?.upsidePct, NaN),
    pnlPct: toNumber(asset?.pnlPct, NaN),
    status: String(asset?.status || "").toUpperCase(),
    currentPrice: toNumber(asset?.currentPrice, NaN),
    technicalSellPrice: toNumber(asset?.technicalSellPrice, NaN),
  };

  if (window.Consensus && typeof window.Consensus.decideSignal === "function") {
    return window.Consensus.decideSignal(input);
  }
  // Defensive fallback if the module has not loaded yet.
  return "MANTER";
}
```

> This removes the large inline decision block from `app.js` (now living in `lib/consensus.js`). Delete the old body entirely — do not leave both.

- [ ] **Step 4: Make `getBuyReason` conviction-aware (app.js)**

Replace `getBuyReason` so a high-conviction consensus buy is classified as "analistas":

```js
function getBuyReason(asset) {
  if (getFinalSignal(asset) !== "COMPRAR") {
    return null;
  }

  const recommendation = normalizeAnalystRecommendation(
    asset?.analystRecommendation ?? asset?.analyst?.recommendation ?? asset?.recommendation
  );
  const upsidePct = toNumber(asset?.upsidePct, NaN);
  const status = String(asset?.status || "").toUpperCase();
  const consensus = computeAssetConsensus(asset);
  const highConvictionBuy =
    consensus?.highConviction &&
    (consensus.label === "COMPRA FORTE" || consensus.label === "COMPRA");

  const analystDriven =
    highConvictionBuy ||
    (recommendation === "COMPRAR" && Number.isFinite(upsidePct) && upsidePct > 15 && status !== "REDUZIR");

  return analystDriven ? "analistas" : "preco-medio";
}
```

- [ ] **Step 5: Carry distribution + stale in `fetchAnalystData` (app.js:2364)**

In `fetchAnalystData`, extend the backend-branch `data` object to include the new fields:

```js
    const data = {
      ticker: cleanTicker,
      targetMean: toNumber(payload?.targetMean, NaN),
      targetMin: toNumber(payload?.targetMin, NaN),
      targetMax: toNumber(payload?.targetMax, NaN),
      distribution: payload?.distribution && typeof payload.distribution === "object" ? payload.distribution : null,
      recommendation: payload?.recommendation || "-",
      recommendationRaw: payload?.recommendationRaw || "",
      analystsCount: toNumber(payload?.analystsCount, 0),
      stale: payload?.stale === true,
      available: true,
      source: "backend"
    };
```

- [ ] **Step 6: Verify syntax and run tests**

Run: `node --check app.js && node --test`
Expected: `app.js` OK; all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add vercel.json index.html app.js
git commit -m "feat: app usa modulo de consenso (window.Consensus) e delega getFinalSignal"
```

---

## Task 7: UI — graded consensus badge + "Convicção" column

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add a consensus badge helper (app.js)**

Add near `finalSignalBadge` in `app.js`:

```js
function consensusBadge(consensus) {
  const label = consensus?.label || "-";
  if (!consensus || !consensus.available || label === "-") {
    return '<span class="badge rec-na">-</span>';
  }
  const cls =
    label === "COMPRA FORTE" ? "rec-strong-buy" :
    label === "COMPRA" ? "buy" :
    label === "MANTER" ? "hold" :
    label === "VENDA" ? "reduce" : "sell";
  const arrow = label === "COMPRA FORTE" ? "&#9650; " : label === "VENDA FORTE" ? "&#9660; " : "";
  const c = consensus.components || {};
  const tip = `${Math.round(toNumber(c.analystsCount, 0))} analistas · ` +
    `${Math.round(toNumber(c.agreement, 0) * 100)}% concordam · ` +
    `conviccao ${consensus.conviction}`;
  return `<span class="badge ${cls}" title="${escapeHtml(tip)}">${arrow}${escapeHtml(label)}</span>`;
}

function convictionCell(consensus) {
  if (!consensus || !consensus.available) {
    return '<td class="muted-text">-</td>';
  }
  const v = toNumber(consensus.conviction, 0);
  const cls = v >= 65 ? "positive" : v >= 45 ? "warn-text" : "muted-text";
  const c = consensus.components || {};
  const tip = `Cobertura ${Math.round(toNumber(c.coverage, 0) * 100)}% · ` +
    `Concordancia ${Math.round(toNumber(c.agreement, 0) * 100)}% · ` +
    `Aperto do alvo ${Math.round(toNumber(c.tightness, 0) * 100)}%`;
  return `<td class="${cls}" title="${escapeHtml(tip)}"><strong>${v}</strong></td>`;
}
```

- [ ] **Step 2: Use the graded badge + conviction column in the Radar table**

In `renderOpportunityRadar` `rowsHtml` (app.js ~line 1780), compute the consensus for each item and render a conviction cell. Replace the analysts `<td>` and add a conviction `<td>` right after the score. Concretely, in the `filtered.map((item) => {...})`:

Add near the top of the map callback:

```js
    const consensus = window.Consensus && window.Consensus.computeConsensus
      ? window.Consensus.computeConsensus({
          distribution: item.distribution,
          analystsCount: item.analystsCount,
          targetMin: item.targetMin, targetMean: item.targetMean, targetMax: item.targetMax,
          recommendationRaw: item.recommendation,
        })
      : { label: "-", conviction: 0, available: false };
```

Then change the signal cell to show the graded badge and add the conviction cell after the score cell:

```js
        <td class="${scoreClass}"><strong>${item.score}</strong></td>
        ${convictionCell(consensus)}
        <td>${finalSignalBadge(item.finalSignal || "MANTER", item.finalSignalReason || "", item.buyReason === "preco-medio" ? "COMPRAR PM" : "")}</td>
```

And add the header cell `<th>Convicção</th>` right after the `<th>Score</th>` in the radar `<thead>`.

> `item.distribution`, `item.targetMin`, and `item.targetMax` must be present. In `buildOpportunityRadar`, add to each `items.push({...})`:
> - carteira loop: `distribution: row.analyst?.distribution`, `targetMin: toNumber(row.analyst?.targetMin, NaN)`, `targetMax: toNumber(row.analyst?.targetMax, NaN)`
> - watchlist loop: `distribution: analyst.distribution`, `targetMin: toNumber(analyst.targetMin, NaN)`, `targetMax: toNumber(analyst.targetMax, NaN)`
> (The carteira loop already pushes `targetMean`; the watchlist loop already computes `analyst`.)

- [ ] **Step 3: Add graded consensus + conviction to the Minha Carteira table**

In the portfolio table rendering (the row template around `app.js:3062-3095`, where the analyst consensus column lives), replace the existing recommendation badge with `consensusBadge(...)` and add a conviction cell. First compute per row:

```js
      const rowConsensus = window.Consensus && window.Consensus.computeConsensus
        ? window.Consensus.computeConsensus(row.analyst)
        : { label: "-", conviction: 0, available: false };
```

Replace the existing `recommendationBadge(row.analyst?.recommendation)` usage in that row with `consensusBadge(rowConsensus)`, and add `${convictionCell(rowConsensus)}` as a new cell immediately after it. Add a matching `<th>Convicção</th>` in the portfolio table header right after the "Consenso analistas" header.

> Search the portfolio `<thead>` for the "Consenso" header text and insert the new `<th>` after it, so header/columns stay aligned.

- [ ] **Step 4: Style the conviction/badges (style.css)**

Append to `style.css`:

```css
.agent-radar-table th:nth-last-child(2),
.agent-radar-table td:nth-last-child(2) {
  text-align: center;
}

.badge.rec-strong-buy {
  background: rgba(34, 197, 94, 0.18);
  color: #7ff0b0;
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.warn-text { color: #e6c34a; }
```

> If `.rec-strong-buy` and `.warn-text` already exist in `style.css`, skip re-adding them (avoid duplicates) — check first with a search.

- [ ] **Step 5: Verify syntax**

Run: `node --check app.js`
Expected: OK.

- [ ] **Step 6: Commit**

```bash
git add app.js style.css
git commit -m "feat: badge de consenso graduado + coluna Conviccao (carteira e radar)"
```

---

## Task 8: Manual verification + deploy

**Files:** none (verification)

- [ ] **Step 1: Full test run**

Run: `node --test`
Expected: all suites PASS.

- [ ] **Step 2: Local smoke of the analyst endpoint shape (optional, needs network)**

Start the API (`npm run start:api`) and, in another shell:
Run: `curl -s http://localhost:3000/api/market/analyst/SUZB3`
Expected: JSON including `distribution`, `analystsCount`, `recommendationRaw`, `stale`.
(If the local server uses a different port, use the one printed on boot.)

- [ ] **Step 3: Commit any cache-version bump already made and push**

```bash
git push origin main
```

- [ ] **Step 4: Verify in production after deploy**

- Open `https://invest-track-acoes.vercel.app/api/market/analyst/SUZB3` → confirm `distribution` + `stale` fields.
- Hard-refresh the app (Ctrl+Shift+R) → the **AGENTE ORION** tables show a graded consensus badge (e.g., ▲ COMPRA FORTE) and a **Convicção** column with tooltips; high-conviction buys surface as COMPRAR.

---

## Self-Review notes (author)

- **Spec coverage:** Seção 1 (interface de fonte) → Task 3; Seção 2 (consenso+convicção) → Task 1; Seção 3 (influência no sinal) → Task 2 + Task 6 Step 3–4; Seção 4 (UI) → Task 7; Seção 5 (robustez retry/last-good) → Task 3 + Tasks 4–5; Seção 6 (testes) → Tasks 1–3.
- **Type consistency:** `computeConsensus`/`decideSignal`/`fetchAnalystConsensus`/`createAnalystSource` names are used identically across tasks. `distribution` keys `{strongBuy,buy,hold,sell,strongSell}` are consistent in the source module, `mapRecommendation`, and `computeConsensus`. `consensusBadge`/`convictionCell` defined in Task 7 Step 1 and used in Steps 2–3.
- **Field names:** app uses `targetMin`/`targetMax`; `computeConsensus` reads `targetLow ?? targetMin` and `targetHigh ?? targetMax`, so both naming conventions work.
