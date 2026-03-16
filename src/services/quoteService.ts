import { ApiQuoteProvider, MockQuoteProvider, type QuoteProvider } from './quoteProviders.ts'
import type { QuoteData } from '../types.ts'

export interface QuoteConfig {
  provider: 'mock' | 'api' | 'hybrid'
  refreshIntervalMs: number
  apiBaseUrl: string
  wsUrl?: string
  useWebSocket: boolean
}

export const quoteConfig: QuoteConfig = {
  provider: (import.meta.env.VITE_QUOTES_PROVIDER as QuoteConfig['provider'] | undefined) ?? 'hybrid',
  refreshIntervalMs: Number(import.meta.env.VITE_QUOTES_REFRESH_MS ?? 30000),
  apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
  wsUrl: import.meta.env.VITE_QUOTES_WS_URL,
  useWebSocket: String(import.meta.env.VITE_QUOTES_USE_WS ?? 'true') === 'true',
}

function selectProviders(config: QuoteConfig): { primary: QuoteProvider; fallback?: QuoteProvider } {
  const mock = new MockQuoteProvider()
  const api = new ApiQuoteProvider(config.apiBaseUrl)

  if (config.provider === 'mock') {
    return { primary: mock }
  }

  if (config.provider === 'api') {
    return { primary: api }
  }

  return { primary: api, fallback: mock }
}

export class QuoteService {
  private readonly primary: QuoteProvider
  private readonly fallback?: QuoteProvider
  private readonly cache = new Map<string, QuoteData>()

  constructor(config: QuoteConfig) {
    const providers = selectProviders(config)
    this.primary = providers.primary
    this.fallback = providers.fallback
  }

  getCache(): Map<string, QuoteData> {
    return this.cache
  }

  async refreshTickers(tickers: string[]): Promise<Map<string, QuoteData>> {
    const unique = [...new Set(tickers.filter(Boolean))]

    if (unique.length === 0) {
      return this.cache
    }

    const results = await Promise.all(unique.map((ticker) => this.getQuoteWithFallback(ticker)))

    for (const quote of results) {
      this.cache.set(quote.ticker, quote)
    }

    return this.cache
  }

  mergeQuotes(quotes: QuoteData[]): Map<string, QuoteData> {
    for (const quote of quotes) {
      if (!quote.ticker) {
        continue
      }

      this.cache.set(quote.ticker, quote)
    }

    return this.cache
  }

  private async getQuoteWithFallback(ticker: string): Promise<QuoteData> {
    try {
      return await this.primary.getQuote(ticker)
    } catch {
      if (!this.fallback) {
        throw new Error(`Nao foi possivel obter cotacao para ${ticker}`)
      }

      return this.fallback.getQuote(ticker)
    }
  }
}
