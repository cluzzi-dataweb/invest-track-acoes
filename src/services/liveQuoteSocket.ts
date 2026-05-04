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
  private reconnectTimer?: number
  private reconnectAttempts = 0
  private manuallyDisconnected = false
  private subscribedTickers: string[] = []

  constructor(options: LiveSocketOptions) {
    this.url = options.url
    this.onQuotes = options.onQuotes
    this.onStatus = options.onStatus
  }

  connect(): void {
    this.manuallyDisconnected = false
    this.clearReconnectTimer()
    this.openSocket()
  }

  disconnect(): void {
    this.manuallyDisconnected = true
    this.clearReconnectTimer()

    if (this.socket) {
      this.socket.close()
      this.socket = undefined
    }
  }

  subscribe(tickers: string[]): void {
    const unique = [...new Set(tickers.map((ticker) => String(ticker ?? '').trim().toUpperCase()).filter(Boolean))]
    this.subscribedTickers = unique

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(JSON.stringify({ type: 'subscribe', tickers: this.subscribedTickers }))
  }

  private openSocket(): void {
    if (this.manuallyDisconnected) {
      return
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.onStatus?.('connecting')
    const socket = new WebSocket(this.url)
    this.socket = socket

    socket.addEventListener('open', () => {
      if (this.socket !== socket) {
        return
      }

      this.reconnectAttempts = 0
      this.onStatus?.('connected')
      this.sendSubscribeIfNeeded()
    })

    socket.addEventListener('close', () => {
      if (this.socket === socket) {
        this.socket = undefined
      }

      this.onStatus?.('disconnected')

      if (!this.manuallyDisconnected) {
        this.scheduleReconnect()
      }
    })

    socket.addEventListener('error', () => {
      this.onStatus?.('error')
    })

    socket.addEventListener('message', (event) => {
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

  private sendSubscribeIfNeeded(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.subscribedTickers.length === 0) {
      return
    }

    this.socket.send(JSON.stringify({ type: 'subscribe', tickers: this.subscribedTickers }))
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return
    }

    const baseDelayMs = 1000
    const maxDelayMs = 30000
    const delayMs = Math.min(baseDelayMs * (2 ** this.reconnectAttempts), maxDelayMs)

    this.reconnectAttempts += 1
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined
      this.openSocket()
    }, delayMs)
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return
    }

    window.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = undefined
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
