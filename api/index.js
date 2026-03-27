import YahooFinance from 'yahoo-finance2'
import crypto from 'node:crypto'
import { createCloudUser, getCloudDataByUserId, getCloudUserByEmail, isCloudDatabaseConfigured, writeCloudDataByUserId } from '../server/cloudDatabase.js'

const yahooFinance = new YahooFinance()

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

const quoteCache = new Map()
const historyCache = new Map()
const analystCache = new Map()
const top10Cache = new Map()
const cloudProfileCache = new Map()
const authUsers = new Map()
const cloudByUserCache = new Map()
const AUTH_TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30)
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET ?? 'invest-track-dev-secret'

const EMPTY_APP_DATA = {
  favorites: [],
  trades: [],
  buyIntents: [],
  buyAlerts: [],
  sellAlerts: [],
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

function normalizeEmail(input) {
  return String(input ?? '').trim().toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt)
  return { salt, hash }
}

function verifyPassword(password, salt, hash) {
  const computed = hashPassword(password, salt)
  const left = Buffer.from(computed, 'hex')
  const right = Buffer.from(String(hash ?? ''), 'hex')

  if (left.length !== right.length) {
    return false
  }

  return crypto.timingSafeEqual(left, right)
}

function toBase64Url(data) {
  return Buffer.from(data).toString('base64url')
}

function fromBase64Url(data) {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

function sign(payloadEncoded) {
  return crypto.createHmac('sha256', AUTH_TOKEN_SECRET).update(payloadEncoded).digest('base64url')
}

function createToken(user) {
  const exp = Math.floor(Date.now() / 1000) + AUTH_TOKEN_TTL_SECONDS
  const payloadEncoded = toBase64Url(JSON.stringify({ uid: user.id, email: user.email, exp }))
  const signature = sign(payloadEncoded)
  return {
    token: `${payloadEncoded}.${signature}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  }
}

function verifyToken(tokenInput) {
  const token = String(tokenInput ?? '').trim()

  if (!token.includes('.')) {
    return null
  }

  const [payloadEncoded, signature] = token.split('.')

  if (!payloadEncoded || !signature) {
    return null
  }

  const expectedSignature = sign(payloadEncoded)

  if (signature.length !== expectedSignature.length) {
    return null
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded))

    if (!payload?.uid || !payload?.email || !Number.isFinite(payload?.exp)) {
      return null
    }

    if (Date.now() >= Number(payload.exp) * 1000) {
      return null
    }

    return { userId: String(payload.uid), email: String(payload.email) }
  } catch {
    return null
  }
}

function getBearerToken(req) {
  const header = String(req.headers.authorization ?? '')

  if (!header.toLowerCase().startsWith('bearer ')) {
    return null
  }

  return header.slice(7).trim()
}

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

function normalizeAppData(raw) {
  return {
    favorites: Array.isArray(raw?.favorites) ? raw.favorites : [],
    trades: Array.isArray(raw?.trades) ? raw.trades : [],
    buyIntents: Array.isArray(raw?.buyIntents) ? raw.buyIntents : [],
    buyAlerts: Array.isArray(raw?.buyAlerts) ? raw.buyAlerts : [],
    sellAlerts: Array.isArray(raw?.sellAlerts) ? raw.sellAlerts : [],
  }
}

function normalizeProfileId(value) {
  const input = String(value ?? '').trim()
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(input)) {
    return null
  }
  return input
}

function normalizeTicker(ticker) {
  return String(ticker ?? '').trim().toUpperCase().replace(/\.SA$/i, '')
}

function toYahooSymbol(ticker) {
  return `${normalizeTicker(ticker)}.SA`
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

function calculateUpsidePercent(currentPrice, targetPrice) {
  if (!Number.isFinite(currentPrice) || currentPrice <= 0 || !Number.isFinite(targetPrice)) {
    return null
  }

  return ((targetPrice - currentPrice) / currentPrice) * 100
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

async function getQuotesByTickers(tickers) {
  if (!tickers.length) {
    return []
  }

  const normalized = [...new Set(tickers.map(normalizeTicker).filter(Boolean))]
  const cachedQuotes = []
  const missing = []

  for (const ticker of normalized) {
    const cacheKey = ticker
    const hit = getCacheValue(quoteCache, cacheKey)

    if (hit) {
      cachedQuotes.push(hit)
    } else {
      missing.push(ticker)
    }
  }

  let freshQuotes = []

  if (missing.length) {
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
      setCacheValue(quoteCache, quote.ticker, quote, QUOTE_CACHE_TTL_MS)
    }
  }

  const quoteByTicker = new Map([...cachedQuotes, ...freshQuotes].map((quote) => [quote.ticker, quote]))
  return normalized.map((ticker) => quoteByTicker.get(ticker)).filter(Boolean)
}

async function getHistoricalDataByTicker(ticker, range = '6mo', interval = '1d') {
  const safeRange = clampRange(range)
  const safeInterval = clampInterval(interval)
  const cacheKey = `${normalizeTicker(ticker)}::${safeRange}::${safeInterval}`
  const cached = getCacheValue(historyCache, cacheKey)

  if (cached) {
    return cached
  }

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

async function getAnalystConsensusByTicker(ticker) {
  const cleanTicker = normalizeTicker(ticker)
  const cached = getCacheValue(analystCache, cleanTicker)

  if (cached) {
    return cached
  }

  const symbol = toYahooSymbol(cleanTicker)
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
    ticker: cleanTicker,
    targetMean,
    targetMin,
    targetMax,
    recommendation,
    analystsCount,
    available,
  }

  setCacheValue(analystCache, cleanTicker, data, ANALYST_CACHE_TTL_MS)
  return data
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
      // ignora falha individual para preservar retorno parcial
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

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT') {
    sendJson(res, 405, { error: 'Metodo nao suportado nesta API.' })
    return
  }

  try {
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const email = normalizeEmail(req.body?.email)
      const password = String(req.body?.password ?? '')

      if (!isValidEmail(email)) {
        sendJson(res, 400, { error: 'Informe um e-mail valido.' })
        return
      }

      if (password.length < 6) {
        sendJson(res, 400, { error: 'A senha deve ter pelo menos 6 caracteres.' })
        return
      }

      const cloudUser = isCloudDatabaseConfigured() ? await getCloudUserByEmail(email) : null

      if (cloudUser || authUsers.has(email)) {
        sendJson(res, 400, { error: 'Ja existe uma conta com esse e-mail.' })
        return
      }

      const { salt, hash } = createPasswordHash(password)
      const user = {
        id: crypto.randomUUID(),
        email,
        passwordHash: hash,
        passwordSalt: salt,
      }

      if (isCloudDatabaseConfigured()) {
        await createCloudUser(user)
      } else {
        authUsers.set(email, user)
      }
      const tokenPayload = createToken(user)

      sendJson(res, 201, {
        token: tokenPayload.token,
        user: { id: user.id, email: user.email },
        expiresAt: tokenPayload.expiresAt,
      })
      return
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const email = normalizeEmail(req.body?.email)
      const password = String(req.body?.password ?? '')
      const user = isCloudDatabaseConfigured() ? await getCloudUserByEmail(email) : authUsers.get(email)

      if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
        sendJson(res, 401, { error: 'E-mail ou senha invalidos.' })
        return
      }

      const tokenPayload = createToken(user)

      sendJson(res, 200, {
        token: tokenPayload.token,
        user: { id: user.id, email: user.email },
        expiresAt: tokenPayload.expiresAt,
      })
      return
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const auth = verifyToken(getBearerToken(req))

      if (!auth) {
        sendJson(res, 401, { error: 'Nao autenticado.' })
        return
      }

      sendJson(res, 200, { user: auth })
      return
    }

    if (pathname === '/api/cloud/data') {
      const auth = verifyToken(getBearerToken(req))

      if (!auth) {
        sendJson(res, 401, { error: 'Nao autenticado.' })
        return
      }

      if (req.method === 'GET') {
        const payload = isCloudDatabaseConfigured()
          ? await getCloudDataByUserId(auth.userId)
          : cloudByUserCache.get(auth.userId)

        if (!payload) {
          sendJson(res, 404, { error: 'Dados de nuvem nao encontrados para este usuario.' })
          return
        }

        sendJson(res, 200, payload)
        return
      }

      if (req.method === 'PUT') {
        const normalizedData = normalizeAppData(req.body?.data ?? EMPTY_APP_DATA)
        const payload = isCloudDatabaseConfigured()
          ? {
              userId: auth.userId,
              ...(await writeCloudDataByUserId(auth.userId, normalizedData)),
            }
          : {
              userId: auth.userId,
              data: normalizedData,
              updatedAt: new Date().toISOString(),
            }

        if (!isCloudDatabaseConfigured()) {
          cloudByUserCache.set(auth.userId, payload)
        }

        sendJson(res, 201, payload)
        return
      }

      sendJson(res, 405, { error: 'Metodo nao suportado nesta API.' })
      return
    }

    if (pathname === '/api/legacy-cloud/data') {
      const auth = verifyToken(getBearerToken(req))

      if (!auth) {
        sendJson(res, 401, { error: 'Nao autenticado.' })
        return
      }

      if (req.method === 'GET') {
        const payload = isCloudDatabaseConfigured()
          ? await getCloudDataByUserId(`legacy:${auth.userId}`)
          : cloudByUserCache.get(`legacy:${auth.userId}`)

        if (!payload) {
          sendJson(res, 404, { error: 'Dados legados em nuvem nao encontrados para este usuario.' })
          return
        }

        sendJson(res, 200, payload)
        return
      }

      if (req.method === 'PUT') {
        const payload = isCloudDatabaseConfigured()
          ? {
              userId: auth.userId,
              ...(await writeCloudDataByUserId(`legacy:${auth.userId}`, req.body?.data ?? {})),
            }
          : {
              userId: auth.userId,
              data: req.body?.data ?? {},
              updatedAt: new Date().toISOString(),
            }

        if (!isCloudDatabaseConfigured()) {
          cloudByUserCache.set(`legacy:${auth.userId}`, payload)
        }

        sendJson(res, 201, payload)
        return
      }

      sendJson(res, 405, { error: 'Metodo nao suportado nesta API.' })
      return
    }

    if (pathname.startsWith('/api/storage/')) {
      const profileId = normalizeProfileId(pathname.replace('/api/storage/', ''))

      if (!profileId) {
        sendJson(res, 400, { error: 'Perfil invalido.' })
        return
      }

      if (req.method === 'GET') {
        const payload = cloudProfileCache.get(profileId)

        if (!payload) {
          sendJson(res, 404, { error: 'Perfil nao encontrado.' })
          return
        }

        sendJson(res, 200, payload)
        return
      }

      const data = normalizeAppData(req.body?.data ?? EMPTY_APP_DATA)
      const payload = {
        profileId,
        data,
        updatedAt: new Date().toISOString(),
      }

      cloudProfileCache.set(profileId, payload)
      sendJson(res, 201, payload)
      return
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Metodo nao suportado nesta API.' })
      return
    }

    if (pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', provider: 'yahoo', runtime: 'vercel-function' })
      return
    }

    if (pathname === '/api/market/search') {
      const query = String(url.searchParams.get('q') ?? '').trim()

      if (query.length < 2) {
        sendJson(res, 400, { error: 'Informe ao menos 2 caracteres para buscar.' })
        return
      }

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

      sendJson(res, 200, { results })
      return
    }

    if (pathname.startsWith('/api/market/quote/')) {
      const ticker = normalizeTicker(pathname.replace('/api/market/quote/', ''))

      if (!ticker) {
        sendJson(res, 400, { error: 'Ticker invalido.' })
        return
      }

      const quotes = await getQuotesByTickers([ticker])

      if (!quotes.length) {
        sendJson(res, 404, { error: 'Ativo nao encontrado.' })
        return
      }

      sendJson(res, 200, { quote: quotes[0] })
      return
    }

    if (pathname.startsWith('/api/market/history/')) {
      const ticker = normalizeTicker(pathname.replace('/api/market/history/', ''))
      const range = String(url.searchParams.get('range') ?? '6mo')
      const interval = String(url.searchParams.get('interval') ?? '1d')

      if (!ticker) {
        sendJson(res, 400, { error: 'Ticker invalido.' })
        return
      }

      const prices = await getHistoricalDataByTicker(ticker, range, interval)
      sendJson(res, 200, { ticker, range: clampRange(range), interval: clampInterval(interval), prices })
      return
    }

    if (pathname.startsWith('/api/market/analyst/')) {
      const ticker = normalizeTicker(pathname.replace('/api/market/analyst/', ''))

      if (!ticker) {
        sendJson(res, 400, { error: 'Ticker invalido.' })
        return
      }

      const data = await getAnalystConsensusByTicker(ticker)

      if (!data.available) {
        sendJson(res, 404, {
          ticker,
          available: false,
          message: 'dados de analistas indisponiveis no modo local',
        })
        return
      }

      sendJson(res, 200, data)
      return
    }

    if (pathname === '/api/market/top10-analysts') {
      const items = await getTop10AnalystIdeas()
      sendJson(res, 200, { items, generatedAt: new Date().toISOString() })
      return
    }

    sendJson(res, 404, { error: 'Endpoint nao encontrado.' })
  } catch (error) {
    sendJson(res, 502, { error: error?.message ?? 'Falha ao consultar fonte externa.' })
  }
}
