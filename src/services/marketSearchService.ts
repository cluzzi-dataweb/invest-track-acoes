export interface MarketSuggestion {
  ticker: string
  name: string
  type: 'stock' | 'fii'
}

interface SearchResponse {
  results?: Array<{
    ticker?: string
    name?: string
    type?: 'stock' | 'fii'
  }>
}

export class MarketSearchService {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  async search(query: string): Promise<MarketSuggestion[]> {
    const normalized = query.trim()

    if (normalized.length < 2) {
      return []
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/market/search?q=${encodeURIComponent(normalized)}`)

      if (!response.ok) {
        return []
      }

      const payload = (await response.json()) as SearchResponse
      const entries = Array.isArray(payload.results) ? payload.results : []

      return entries
        .map((item): MarketSuggestion => ({
          ticker: String(item.ticker ?? '').trim().toUpperCase(),
          name: String(item.name ?? '').trim() || 'Ativo sem nome',
          type: item.type === 'fii' ? 'fii' : 'stock',
        }))
        .filter((item) => item.ticker)
    } catch {
      return []
    }
  }
}
