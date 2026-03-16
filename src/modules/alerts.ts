import type { BuyIntent, DashboardStats, Position, PriceAlert, QuoteData, TriggeredAlert } from '../types.ts'

function createTriggered(
  id: string,
  source: TriggeredAlert['source'],
  ticker: string,
  targetPrice: number,
  currentPrice: number,
  message: string,
): TriggeredAlert {
  return { id, source, ticker, targetPrice, currentPrice, message }
}

export function evaluateTriggeredAlerts(
  buyAlerts: PriceAlert[],
  sellAlerts: PriceAlert[],
  buyIntents: BuyIntent[],
  quotes: Map<string, QuoteData>,
): TriggeredAlert[] {
  const triggered: TriggeredAlert[] = []

  for (const alert of buyAlerts) {
    if (!alert.active) {
      continue
    }

    const current = quotes.get(alert.ticker)?.price

    if (current !== undefined && current <= alert.targetPrice) {
      triggered.push(
        createTriggered(
          alert.id,
          'buy-alert',
          alert.ticker,
          alert.targetPrice,
          current,
          `Alerta de compra atingido para ${alert.ticker}`,
        ),
      )
    }
  }

  for (const alert of sellAlerts) {
    if (!alert.active) {
      continue
    }

    const current = quotes.get(alert.ticker)?.price

    if (current !== undefined && current >= alert.targetPrice) {
      triggered.push(
        createTriggered(
          alert.id,
          'sell-alert',
          alert.ticker,
          alert.targetPrice,
          current,
          `Alerta de venda atingido para ${alert.ticker}`,
        ),
      )
    }
  }

  for (const intent of buyIntents) {
    if (!intent.active) {
      continue
    }

    const current = quotes.get(intent.ticker)?.price

    if (current !== undefined && current <= intent.targetPrice) {
      triggered.push(
        createTriggered(
          intent.id,
          'buy-intent',
          intent.ticker,
          intent.targetPrice,
          current,
          `Preco-alvo da intencao de compra atingido para ${intent.ticker}`,
        ),
      )
    }
  }

  return triggered
}

export function buildDashboardStats(
  monitoredCount: number,
  positions: Position[],
  buyAlertsActive: number,
  sellAlertsActive: number,
  triggered: TriggeredAlert[],
  quotes: Map<string, QuoteData>,
): DashboardStats {
  const investedTotal = positions.reduce((acc, position) => acc + position.investedValue, 0)
  const marketTotal = positions.reduce((acc, position) => acc + position.marketValue, 0)
  const pnlTotal = marketTotal - investedTotal
  const pnlPercent = investedTotal > 0 ? (pnlTotal / investedTotal) * 100 : 0

  let topGainer: DashboardStats['topGainer']
  let topLoser: DashboardStats['topLoser']

  for (const quote of quotes.values()) {
    if (!topGainer || quote.changePercent > topGainer.value) {
      topGainer = { ticker: quote.ticker, value: quote.changePercent }
    }

    if (!topLoser || quote.changePercent < topLoser.value) {
      topLoser = { ticker: quote.ticker, value: quote.changePercent }
    }
  }

  return {
    monitoredCount,
    portfolioCount: positions.length,
    investedTotal,
    marketTotal,
    pnlTotal,
    pnlPercent,
    buyAlertsActive,
    sellAlertsActive,
    triggeredCount: triggered.length,
    topGainer,
    topLoser,
  }
}
