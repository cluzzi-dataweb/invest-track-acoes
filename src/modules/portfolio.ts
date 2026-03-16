import type { Position, QuoteData, TradeRecord } from '../types.ts'

export function buildPositions(trades: TradeRecord[], quotes: Map<string, QuoteData>): Position[] {
  const map = new Map<string, { ticker: string; type: 'stock' | 'fii'; quantity: number; avgPrice: number }>()

  for (const trade of trades) {
    const current = map.get(trade.ticker) ?? {
      ticker: trade.ticker,
      type: trade.type,
      quantity: 0,
      avgPrice: 0,
    }

    if (trade.side === 'buy') {
      const newQuantity = current.quantity + trade.quantity
      const weighted = (current.quantity * current.avgPrice) + (trade.quantity * trade.unitPrice)
      current.quantity = newQuantity
      current.avgPrice = newQuantity > 0 ? weighted / newQuantity : 0
      current.type = trade.type
      map.set(trade.ticker, current)
      continue
    }

    current.quantity -= trade.quantity

    if (current.quantity <= 0) {
      map.delete(trade.ticker)
    } else {
      map.set(trade.ticker, current)
    }
  }

  const positions: Position[] = []

  for (const entry of map.values()) {
    const quote = quotes.get(entry.ticker)
    const currentPrice = quote?.price ?? entry.avgPrice
    const investedValue = entry.quantity * entry.avgPrice
    const marketValue = entry.quantity * currentPrice
    const pnlValue = marketValue - investedValue
    const pnlPercent = investedValue > 0 ? (pnlValue / investedValue) * 100 : 0

    positions.push({
      ticker: entry.ticker,
      type: entry.type,
      quantity: entry.quantity,
      avgPrice: entry.avgPrice,
      investedValue,
      currentPrice,
      marketValue,
      pnlValue,
      pnlPercent,
    })
  }

  positions.sort((a, b) => a.ticker.localeCompare(b.ticker))
  return positions
}

export function getAvailableQuantity(trades: TradeRecord[], ticker: string): number {
  let quantity = 0

  for (const trade of trades) {
    if (trade.ticker !== ticker) {
      continue
    }

    quantity += trade.side === 'buy' ? trade.quantity : -trade.quantity
  }

  return Math.max(0, quantity)
}
