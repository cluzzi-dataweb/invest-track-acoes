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
