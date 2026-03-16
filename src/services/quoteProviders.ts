import type { QuoteData } from '../types.ts'

export interface QuoteProvider {
  getQuote(ticker: string): Promise<QuoteData>
}

const mockSeed = new Map<string, QuoteData>()

function basePriceByTicker(ticker: string): number {
  const numericPart = Number(ticker.replace(/\D/g, '')) || 10
  const charCode = ticker.charCodeAt(0) || 65
  return Math.max(5, (numericPart * 2.3) + (charCode % 20))
}

function randomStep(base: number): number {
  const variation = (Math.random() - 0.5) * 0.03
  return Math.max(1, base * (1 + variation))
}

export class MockQuoteProvider implements QuoteProvider {
  async getQuote(ticker: string): Promise<QuoteData> {
    const previous = mockSeed.get(ticker)
    const price = randomStep(previous?.price ?? basePriceByTicker(ticker))
    const changePercent = previous ? ((price - previous.price) / previous.price) * 100 : ((Math.random() - 0.5) * 2)

    const quote: QuoteData = {
      ticker,
      price,
      changePercent,
      updatedAt: new Date().toISOString(),
      source: 'mock',
    }

    mockSeed.set(ticker, quote)
    return quote
  }
}

export class ApiQuoteProvider implements QuoteProvider {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  async getQuote(ticker: string): Promise<QuoteData> {
    const response = await fetch(`${this.apiBaseUrl}/api/market/quote/${ticker}`)

    if (!response.ok) {
      throw new Error(`Falha na API para ${ticker}`)
    }

    const payload = await response.json() as {
      quote: {
        ticker: string
        regularMarketPrice: number
        regularMarketChangePercent: number
        regularMarketTime?: string
      }
    }

    return {
      ticker: payload.quote.ticker,
      price: payload.quote.regularMarketPrice,
      changePercent: payload.quote.regularMarketChangePercent,
      updatedAt: payload.quote.regularMarketTime ?? new Date().toISOString(),
      source: 'api',
    }
  }
}
