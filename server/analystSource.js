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
          lastGood.set(ticker, { ...data })
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
