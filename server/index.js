import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import YahooFinance from 'yahoo-finance2'
import { loginUser, registerUser, verifyToken } from './auth.js'
import { readCloudProfile, readLegacyUserCloudData, readPortfolio, readUserCloudData, writeCloudProfile, writeLegacyUserCloudData, writePortfolio, writeUserCloudData } from './storage.js'

const yahooFinance = new YahooFinance()

const app = express()
const PORT = Number(process.env.API_PORT ?? 3333)
const WS_PUSH_INTERVAL_MS = Number(process.env.WS_PUSH_INTERVAL_MS ?? 12000)
const YAHOO_HTTP_TIMEOUT_MS = Number(process.env.YAHOO_HTTP_TIMEOUT_MS ?? 10000)
const QUOTE_CACHE_TTL_MS = Number(process.env.QUOTE_CACHE_TTL_MS ?? 15000)
const HISTORY_CACHE_TTL_MS = Number(process.env.HISTORY_CACHE_TTL_MS ?? 180000)
const ANALYST_CACHE_TTL_MS = Number(process.env.ANALYST_CACHE_TTL_MS ?? 300000)
const TOP10_CACHE_TTL_MS = Number(process.env.TOP10_CACHE_TTL_MS ?? 240000)
const TOP10_CANDIDATES = [
  'PETR4',
  'VALE3',
  'ITUB4',
  'BBDC4',
  'BBAS3',
  'ABEV3',
  'WEGE3',
  'RENT3',
  'SUZB3',
  'PRIO3',
  'JBSS3',
  'RAIL3',
  'GGBR4',
  'CMIG4',
  'ELET3',
  'EQTL3',
  'LREN3',
  'RDOR3',
  'B3SA3',
  'VBBR3',
]


app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const wsServer = new WebSocketServer({ server: httpServer, path: '/ws/quotes' })
const clientSubscriptions = new Map()
const quoteCache = new Map()
const historyCache = new Map()
const analystCache = new Map()
const top10Cache = new Map()

function getCacheValue(cache, key) {
  const hit = cache.get(key)

  if (!hit) {
    return null
  }

  if (Date.now() > hit.expiresAt) {
    cache.delete(key)
    return null
  }

  return hit.value
}

function setCacheValue(cache, key, value, ttlMs) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}

function getQuoteCacheKey(ticker) {
  return normalizeTicker(ticker)
}

function getHistoryCacheKey(ticker, range, interval) {
  return `${normalizeTicker(ticker)}::${clampRange(range)}::${clampInterval(interval)}`
}

function getAnalystCacheKey(ticker) {
  return normalizeTicker(ticker)
}

function normalizeTicker(ticker) {
  return String(ticker ?? '').trim().toUpperCase()
}

function toAssetType(rawType) {
  const value = String(rawType ?? '').trim().toLowerCase()

  if (value === 'fii' || value === 'fund') {
    return 'fii'
  }

  return 'stock'
}

function toYahooSymbol(ticker) {
  return `${ticker}.SA`
}

function fromYahooSymbol(symbol) {
  return String(symbol ?? '').replace(/\.SA$/i, '').toUpperCase()
}

function clampRange(range) {
  const allowed = new Set(['1mo', '3mo', '6mo', '1y', '2y', '5y'])
  return allowed.has(range) ? range : '6mo'
}

function clampInterval(interval) {
  const allowed = new Set(['1d', '1wk', '1mo'])
  return allowed.has(interval) ? interval : '1d'
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), YAHOO_HTTP_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status} ao consultar fonte externa.`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

async function getHistoricalDataByTicker(ticker, range = '6mo', interval = '1d') {
  const cacheKey = getHistoryCacheKey(ticker, range, interval)
  const cached = getCacheValue(historyCache, cacheKey)

  if (cached) {
    return cached
  }

  const safeRange = clampRange(range)
  const safeInterval = clampInterval(interval)
  const symbol = toYahooSymbol(ticker)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(safeRange)}&interval=${encodeURIComponent(safeInterval)}`

  const payload = await fetchJsonWithTimeout(url)
  const result = payload?.chart?.result?.[0]

  if (!result) {
    return []
  }

  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : []
  const quote = result?.indicators?.quote?.[0] ?? {}
  const closes = Array.isArray(quote.close) ? quote.close : []
  const volumes = Array.isArray(quote.volume) ? quote.volume : []

  const points = timestamps
    .map((unix, index) => ({
      date: new Date(unix * 1000).toISOString(),
      close: Number(closes[index] ?? NaN),
      volume: Number(volumes[index] ?? 0),
    }))
    .filter((point) => Number.isFinite(point.close))

  setCacheValue(historyCache, cacheKey, points, HISTORY_CACHE_TTL_MS)

  return points
}

function mapRecommendation(value, trend) {
  const key = String(value ?? '').toLowerCase()

  if (key.includes('strong_buy') || key.includes('strong buy') || key.includes('strongbuy')) {
    return 'strong buy'
  }

  if (key.includes('buy')) {
    return 'buy'
  }

  if (key.includes('sell') || key.includes('underperform') || key.includes('reduce')) {
    return 'sell'
  }

  const strongBuyVotes = Number(trend?.strongBuy ?? 0)
  const plainBuyVotes = Number(trend?.buy ?? 0)
  const buyVotes = strongBuyVotes + plainBuyVotes
  const holdVotes = Number(trend?.hold ?? 0)
  const sellVotes = Number(trend?.sell ?? 0) + Number(trend?.strongSell ?? 0)

  if (strongBuyVotes > 0 && strongBuyVotes >= plainBuyVotes && strongBuyVotes > holdVotes && strongBuyVotes > sellVotes) {
    return 'strong buy'
  }

  if (buyVotes > holdVotes && buyVotes > sellVotes) {
    return 'buy'
  }

  if (sellVotes > buyVotes && sellVotes > holdVotes) {
    return 'sell'
  }

  return 'hold'
}

async function getAnalystConsensusByTicker(ticker) {
  const cacheKey = getAnalystCacheKey(ticker)
  const cached = getCacheValue(analystCache, cacheKey)

  if (cached) {
    return cached
  }

  const symbol = toYahooSymbol(ticker)
  const payload = await yahooFinance.quoteSummary(symbol, {
    modules: ['financialData', 'recommendationTrend'],
  })

  const financialData = payload?.financialData ?? {}
  const trend = payload?.recommendationTrend?.trend?.[0] ?? {}

  const targetMean = Number(financialData?.targetMeanPrice ?? NaN)
  const targetMin = Number(financialData?.targetLowPrice ?? NaN)
  const targetMax = Number(financialData?.targetHighPrice ?? NaN)
  const analystsCount = Number(financialData?.numberOfAnalystOpinions ?? 0)
  const recommendation = mapRecommendation(financialData?.recommendationKey, trend)

  const available = Number.isFinite(targetMean) || Number.isFinite(targetMin) || Number.isFinite(targetMax)

  const data = {
    ticker,
    targetMean,
    targetMin,
    targetMax,
    recommendation,
    analystsCount,
    available,
  }

  setCacheValue(analystCache, cacheKey, data, ANALYST_CACHE_TTL_MS)

  return data
}

function calculateUpsidePercent(currentPrice, targetPrice) {
  if (!Number.isFinite(currentPrice) || currentPrice <= 0 || !Number.isFinite(targetPrice)) {
    return null
  }

  return ((targetPrice - currentPrice) / currentPrice) * 100
}

async function getTop10AnalystIdeas() {
  const cached = getCacheValue(top10Cache, 'top10')

  if (cached) {
    return cached
  }

  const items = []

  const jobs = TOP10_CANDIDATES.map(async (ticker) => {
    try {
      const [quotes, analyst] = await Promise.all([
        getQuotesByTickers([ticker]),
        getAnalystConsensusByTicker(ticker),
      ])

      const quote = quotes[0]

      if (!quote || !analyst.available || !Number.isFinite(quote.regularMarketPrice) || !Number.isFinite(analyst.targetMean)) {
        return
      }

      items.push({
        ticker,
        company: quote.name ?? ticker,
        currentPrice: Number(quote.regularMarketPrice),
        targetMean: Number(analyst.targetMean),
        targetMax: Number(analyst.targetMax),
        upside: calculateUpsidePercent(Number(quote.regularMarketPrice), Number(analyst.targetMean)),
        recommendation: analyst.recommendation,
        analystsCount: Number(analyst.analystsCount ?? 0),
      })
    } catch {
      // ignora falha individual para preservar retorno parcial do Top 10
    }
  })

  await Promise.all(jobs)

  const ranked = items
    .sort((a, b) => {
      const byAnalysts = b.analystsCount - a.analystsCount
      if (byAnalysts !== 0) {
        return byAnalysts
      }

      return Number(b.upside ?? -Infinity) - Number(a.upside ?? -Infinity)
    })
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }))

  setCacheValue(top10Cache, 'top10', ranked, TOP10_CACHE_TTL_MS)

  return ranked
}

async function getQuotesByTickers(tickers) {
  if (tickers.length === 0) {
    return []
  }

  const normalized = [...new Set(tickers.map(normalizeTicker).filter(Boolean))]
  const cachedQuotes = []
  const missing = []

  for (const ticker of normalized) {
    const hit = getCacheValue(quoteCache, getQuoteCacheKey(ticker))

    if (hit) {
      cachedQuotes.push(hit)
    } else {
      missing.push(ticker)
    }
  }

  let freshQuotes = []

  if (missing.length > 0) {
    const symbols = missing.map(toYahooSymbol)
    const results = await yahooFinance.quote(symbols)
    const list = Array.isArray(results) ? results : [results]

    freshQuotes = list.map((item) => ({
      ticker: fromYahooSymbol(item.symbol),
      name: item.longName ?? item.shortName ?? fromYahooSymbol(item.symbol),
      currency: item.currency ?? 'BRL',
      regularMarketPrice: Number(item.regularMarketPrice ?? 0),
      regularMarketChangePercent: Number(item.regularMarketChangePercent ?? 0),
      regularMarketTime: item.regularMarketTime ? item.regularMarketTime.toISOString() : null,
    }))

    for (const quote of freshQuotes) {
      setCacheValue(quoteCache, getQuoteCacheKey(quote.ticker), quote, QUOTE_CACHE_TTL_MS)
    }
  }

  const quoteByTicker = new Map([...cachedQuotes, ...freshQuotes].map((quote) => [quote.ticker, quote]))
  return normalized.map((ticker) => quoteByTicker.get(ticker)).filter(Boolean)
}

function isSocketOpen(socket) {
  return socket.readyState === 1
}

function getWebSocketBaseUrl() {
  return `ws://localhost:${PORT}/ws/quotes`
}

function parseIncomingMessage(raw) {
  try {
    return JSON.parse(String(raw))
  } catch {
    return null
  }
}

function normalizeTickers(input) {
  if (!Array.isArray(input)) {
    return []
  }

  const set = new Set()

  for (const item of input) {
    const ticker = normalizeTicker(item)

    if (ticker) {
      set.add(ticker)
    }
  }

  return [...set]
}

wsServer.on('connection', (socket) => {
  clientSubscriptions.set(socket, [])

  if (isSocketOpen(socket)) {
    socket.send(JSON.stringify({ type: 'hello', message: 'Conectado ao stream de cotacoes.' }))
  }

  socket.on('message', (payload) => {
    const message = parseIncomingMessage(payload)

    if (!message || message.type !== 'subscribe') {
      return
    }

    const tickers = normalizeTickers(message.tickers)
    clientSubscriptions.set(socket, tickers)

    if (isSocketOpen(socket)) {
      socket.send(JSON.stringify({ type: 'subscribed', tickers }))
    }
  })

  socket.on('close', () => {
    clientSubscriptions.delete(socket)
  })
})

setInterval(async () => {
  const jobs = []

  for (const [socket, tickers] of clientSubscriptions.entries()) {
    if (!isSocketOpen(socket)) {
      clientSubscriptions.delete(socket)
      continue
    }

    if (!Array.isArray(tickers) || tickers.length === 0) {
      continue
    }

    jobs.push(
      getQuotesByTickers(tickers)
        .then((quotes) => {
          if (!isSocketOpen(socket)) {
            return
          }

          socket.send(JSON.stringify({ type: 'quotes', data: quotes, sentAt: new Date().toISOString() }))
        })
        .catch((error) => {
          if (!isSocketOpen(socket)) {
            return
          }

          socket.send(JSON.stringify({ type: 'error', message: error.message }))
        }),
    )
  }

  await Promise.all(jobs)
}, WS_PUSH_INTERVAL_MS)

function enrichPortfolio(holdings, quotes) {
  const quoteByTicker = new Map(quotes.map((quote) => [quote.ticker, quote]))

  const positions = holdings.map((position) => {
    const quote = quoteByTicker.get(position.ticker)
    const currentPrice = quote?.regularMarketPrice ?? 0
    const investedValue = position.quantity * position.avgPrice
    const marketValue = position.quantity * currentPrice

    return {
      ...position,
      currentPrice,
      investedValue,
      marketValue,
      pnl: marketValue - investedValue,
      changePercent: investedValue > 0 ? ((marketValue - investedValue) / investedValue) * 100 : 0,
    }
  })

  const totals = positions.reduce(
    (acc, position) => {
      acc.invested += position.investedValue
      acc.market += position.marketValue
      return acc
    },
    { invested: 0, market: 0 },
  )

  return {
    positions,
    totals: {
      invested: totals.invested,
      market: totals.market,
      pnl: totals.market - totals.invested,
      changePercent: totals.invested > 0 ? ((totals.market - totals.invested) / totals.invested) * 100 : 0,
    },
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: 'yahoo' })
})

function getBearerToken(req) {
  const header = String(req.headers.authorization ?? '')

  if (!header.toLowerCase().startsWith('bearer ')) {
    return null
  }

  return header.slice(7).trim()
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req)
  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'Nao autenticado.' })
  }

  req.auth = payload
  return next()
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await registerUser(req.body)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await loginUser(req.body)
    return res.json(result)
  } catch (error) {
    return res.status(401).json({ error: error.message })
  }
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({ user: req.auth })
})

app.get('/api/cloud/data', requireAuth, async (req, res) => {
  try {
    const payload = await readUserCloudData(req.auth.userId)

    if (!payload) {
      return res.status(404).json({ error: 'Dados de nuvem nao encontrados para este usuario.' })
    }

    return res.json(payload)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.put('/api/cloud/data', requireAuth, async (req, res) => {
  try {
    const saved = await writeUserCloudData(req.auth.userId, req.body?.data)
    return res.status(201).json(saved)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.get('/api/legacy-cloud/data', requireAuth, async (req, res) => {
  try {
    const payload = await readLegacyUserCloudData(req.auth.userId)

    if (!payload) {
      return res.status(404).json({ error: 'Dados legados em nuvem nao encontrados para este usuario.' })
    }

    return res.json(payload)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.put('/api/legacy-cloud/data', requireAuth, async (req, res) => {
  try {
    const saved = await writeLegacyUserCloudData(req.auth.userId, req.body?.data)
    return res.status(201).json(saved)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.get('/api/storage/:profileId', async (req, res) => {
  try {
    const payload = await readCloudProfile(req.params.profileId)

    if (!payload) {
      return res.status(404).json({ error: 'Perfil nao encontrado.' })
    }

    return res.json(payload)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.put('/api/storage/:profileId', async (req, res) => {
  try {
    const saved = await writeCloudProfile(req.params.profileId, req.body?.data)
    return res.status(201).json(saved)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.get('/api/market/search', async (req, res) => {
  const query = String(req.query.q ?? '').trim()

  if (query.length < 2) {
    return res.status(400).json({ error: 'Informe ao menos 2 caracteres para buscar.' })
  }

  try {
    const payload = await yahooFinance.search(query, { lang: 'pt-BR', region: 'BR', quotesCount: 12, newsCount: 0 })
    const entries = Array.isArray(payload?.quotes) ? payload.quotes : []

    const results = entries
      .filter((item) => item.exchange === 'SAO' || String(item.symbol ?? '').endsWith('.SA'))
      .map((item) => ({
        ticker: fromYahooSymbol(item.symbol),
        name: item.longname ?? item.shortname ?? fromYahooSymbol(item.symbol),
        type: (item.quoteType === 'MUTUALFUND' || item.quoteType === 'ETF') ? 'fii' : 'stock',
        sector: '-',
        exchange: 'B3',
      }))

    return res.json({ results })
  } catch (error) {
    return res.status(502).json({ error: error.message })
  }
})

app.get('/api/market/quote/:ticker', async (req, res) => {
  const ticker = normalizeTicker(req.params.ticker)

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker invalido.' })
  }

  try {
    const quotes = await getQuotesByTickers([ticker])

    if (quotes.length === 0) {
      return res.status(404).json({ error: 'Ativo nao encontrado.' })
    }

    return res.json({ quote: quotes[0] })
  } catch (error) {
    return res.status(502).json({ error: error.message })
  }
})

app.get('/api/market/history/:ticker', async (req, res) => {
  const ticker = normalizeTicker(req.params.ticker)
  const range = String(req.query.range ?? '6mo')
  const interval = String(req.query.interval ?? '1d')

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker invalido.' })
  }

  try {
    const prices = await getHistoricalDataByTicker(ticker, range, interval)
    return res.json({ ticker, range: clampRange(range), interval: clampInterval(interval), prices })
  } catch (error) {
    return res.status(502).json({ error: error.message })
  }
})

app.get('/api/market/analyst/:ticker', async (req, res) => {
  const ticker = normalizeTicker(req.params.ticker)

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker invalido.' })
  }

  try {
    const data = await getAnalystConsensusByTicker(ticker)

    if (!data.available) {
      return res.status(404).json({
        ticker,
        available: false,
        message: 'dados de analistas indisponiveis no modo local',
      })
    }

    return res.json(data)
  } catch (error) {
    return res.status(502).json({ error: error.message })
  }
})

app.get('/api/market/top10-analysts', async (_req, res) => {
  try {
    const items = await getTop10AnalystIdeas()
    return res.json({ items, generatedAt: new Date().toISOString() })
  } catch (error) {
    return res.status(502).json({ error: error.message })
  }
})

app.get('/api/portfolio', async (_req, res) => {
  try {
    const portfolio = await readPortfolio()
    const tickers = portfolio.holdings.map((position) => position.ticker)
    const quotes = await getQuotesByTickers(tickers)

    return res.json(enrichPortfolio(portfolio.holdings, quotes))
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.post('/api/portfolio/trades', async (req, res) => {
  const ticker = normalizeTicker(req.body.ticker)
  const side = String(req.body.side ?? '').toLowerCase()
  const quantity = Number(req.body.quantity)
  const price = Number(req.body.price)
  const type = toAssetType(req.body.type)

  if (!ticker || !Number.isFinite(quantity) || !Number.isFinite(price) || quantity <= 0 || price <= 0) {
    return res.status(400).json({ error: 'Dados de operacao invalidos.' })
  }

  if (side !== 'buy' && side !== 'sell') {
    return res.status(400).json({ error: 'Tipo de operacao invalido. Use buy ou sell.' })
  }

  try {
    const portfolio = await readPortfolio()
    const holdings = [...portfolio.holdings]
    const existingIndex = holdings.findIndex((position) => position.ticker === ticker)

    if (existingIndex === -1 && side === 'sell') {
      return res.status(400).json({ error: 'Voce nao possui esse ativo para venda.' })
    }

    if (existingIndex === -1) {
      holdings.push({
        ticker,
        type,
        quantity,
        avgPrice: price,
        updatedAt: new Date().toISOString(),
      })
    } else {
      const current = holdings[existingIndex]

      if (side === 'buy') {
        const newQuantity = current.quantity + quantity
        const weightedAvgPrice = ((current.quantity * current.avgPrice) + (quantity * price)) / newQuantity

        holdings[existingIndex] = {
          ...current,
          quantity: newQuantity,
          avgPrice: weightedAvgPrice,
          type,
          updatedAt: new Date().toISOString(),
        }
      } else {
        if (current.quantity < quantity) {
          return res.status(400).json({ error: 'Quantidade para venda maior do que a posicao atual.' })
        }

        const remainingQuantity = current.quantity - quantity

        if (remainingQuantity === 0) {
          holdings.splice(existingIndex, 1)
        } else {
          holdings[existingIndex] = {
            ...current,
            quantity: remainingQuantity,
            updatedAt: new Date().toISOString(),
          }
        }
      }
    }

    const updatedPortfolio = { holdings }
    await writePortfolio(updatedPortfolio)

    const quotes = await getQuotesByTickers(holdings.map((position) => position.ticker))
    return res.status(201).json(enrichPortfolio(holdings, quotes))
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

httpServer.listen(PORT, () => {
  console.log(`API pronta em http://localhost:${PORT}`)
  console.log(`WebSocket de cotacoes pronto em ${getWebSocketBaseUrl()}`)
})
