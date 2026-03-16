import type { QuoteData } from '../types.ts'

export interface LiveSocketOptions {
  url: string
  onQuotes: (quotes: QuoteData[]) => void
  onStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
}

export class LiveQuoteSocket {
  private readonly url: string
  private readonly onQuotes: (quotes: QuoteData[]) => void
  private readonly onStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  private socket?: WebSocket

  constructor(options: LiveSocketOptions) {
    this.url = options.url
    this.onQuotes = options.onQuotes
    this.onStatus = options.onStatus
  }

  connect(): void {
    this.disconnect()

    this.onStatus?.('connecting')
    this.socket = new WebSocket(this.url)

    this.socket.addEventListener('open', () => {
      this.onStatus?.('connected')
    })

    this.socket.addEventListener('close', () => {
      this.onStatus?.('disconnected')
    })

    this.socket.addEventListener('error', () => {
      this.onStatus?.('error')
    })

    this.socket.addEventListener('message', (event) => {
      const payload = this.parseMessage(event.data)

      if (!payload || payload.type !== 'quotes' || !Array.isArray(payload.data)) {
        return
      }

      const quotes = payload.data
        .map((item) => this.mapIncomingQuote(item))
        .filter((item): item is QuoteData => item !== null)

      if (quotes.length > 0) {
        this.onQuotes(quotes)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = undefined
    }
  }

  subscribe(tickers: string[]): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(JSON.stringify({ type: 'subscribe', tickers }))
  }

  private parseMessage(raw: unknown): { type?: string; data?: unknown[] } | null {
    try {
      return JSON.parse(String(raw)) as { type?: string; data?: unknown[] }
    } catch {
      return null
    }
  }

  private mapIncomingQuote(raw: unknown): QuoteData | null {
    if (!raw || typeof raw !== 'object') {
      return null
    }

    const item = raw as {
      ticker?: unknown
      regularMarketPrice?: unknown
      regularMarketChangePercent?: unknown
      regularMarketTime?: unknown
    }

    const ticker = String(item.ticker ?? '').toUpperCase().trim()

    if (!ticker) {
      return null
    }

    return {
      ticker,
      price: Number(item.regularMarketPrice ?? 0),
      changePercent: Number(item.regularMarketChangePercent ?? 0),
      updatedAt: String(item.regularMarketTime ?? new Date().toISOString()),
      source: 'ws',
    }
  }
}
