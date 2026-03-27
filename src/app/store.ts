import { buildPositions, getAvailableQuantity } from '../modules/portfolio.ts'
import { evaluateTriggeredAlerts } from '../modules/alerts.ts'
import { loadData, saveData } from '../storage/localStore.ts'
import type { AppData, AssetType, BuyIntent, Position, PriceAlert, QuoteData, TradeRecord, TriggeredAlert } from '../types.ts'
import { normalizeTicker } from '../utils/format.ts'
import { createId } from '../utils/id.ts'

export class AppStore {
  private data: AppData
  private readonly onDataChanged?: (data: AppData) => void

  constructor(options?: { onDataChanged?: (data: AppData) => void }) {
    this.data = loadData()
    this.onDataChanged = options?.onDataChanged
  }

  snapshot(): AppData {
    return structuredClone(this.data)
  }

  hydrate(data: AppData): void {
    this.data = structuredClone(data)
    saveData(this.data)
  }

  save(): void {
    saveData(this.data)
    this.onDataChanged?.(this.snapshot())
  }

  addFavorite(tickerInput: string, type: AssetType): void {
    const ticker = normalizeTicker(tickerInput)

    if (!ticker) {
      throw new Error('Informe um ticker valido.')
    }

    const exists = this.data.favorites.some((item) => item.ticker === ticker)

    if (exists) {
      throw new Error('Esse ativo ja esta em favoritos.')
    }

    this.data.favorites.push({
      ticker,
      type,
      addedAt: new Date().toISOString(),
    })

    this.save()
  }

  removeFavorite(tickerInput: string): void {
    const ticker = normalizeTicker(tickerInput)
    this.data.favorites = this.data.favorites.filter((item) => item.ticker !== ticker)
    this.save()
  }

  addTrade(input: {
    side: 'buy' | 'sell'
    ticker: string
    type: AssetType
    quantity: number
    unitPrice: number
    date: string
    note?: string
  }): void {
    const ticker = normalizeTicker(input.ticker)

    if (!ticker || input.quantity <= 0 || input.unitPrice <= 0 || !input.date) {
      throw new Error('Preencha os dados da operacao corretamente.')
    }

    const trade: TradeRecord = {
      id: createId('trade'),
      side: input.side,
      ticker,
      type: input.type,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      date: input.date,
      note: input.note,
      createdAt: new Date().toISOString(),
    }

    const nextTrades = [...this.data.trades, trade]
    this.validateTrades(nextTrades)
    this.data.trades = this.sortTrades(nextTrades)
    this.save()
  }

  updateTrade(id: string, input: {
    ticker: string
    date: string
    quantity: number
    unitPrice: number
    note?: string
  }): void {
    const target = this.data.trades.find((trade) => trade.id === id)

    if (!target) {
      throw new Error('Operacao nao encontrada para edicao.')
    }

    const ticker = normalizeTicker(input.ticker)

    if (!ticker || input.quantity <= 0 || input.unitPrice <= 0 || !input.date) {
      throw new Error('Dados de edicao invalidos.')
    }

    const updatedTrade: TradeRecord = {
      ...target,
      ticker,
      type: ticker.endsWith('11') ? 'fii' : 'stock',
      date: input.date,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      note: input.note,
    }

    const nextTrades = this.data.trades.map((trade) => (trade.id === id ? updatedTrade : trade))
    this.validateTrades(nextTrades)
    this.data.trades = this.sortTrades(nextTrades)
    this.save()
  }

  getTradeById(id: string): TradeRecord | undefined {
    return this.data.trades.find((trade) => trade.id === id)
  }

  removeTrade(id: string): void {
    const nextTrades = this.data.trades.filter((trade) => trade.id !== id)
    this.validateTrades(nextTrades)
    this.data.trades = this.sortTrades(nextTrades)
    this.save()
  }

  addBuyIntent(input: {
    ticker: string
    targetPrice: number
    targetQuantity?: number
    note?: string
  }): void {
    const ticker = normalizeTicker(input.ticker)

    if (!ticker || input.targetPrice <= 0) {
      throw new Error('Dados da intencao de compra invalidos.')
    }

    const intent: BuyIntent = {
      id: createId('intent'),
      ticker,
      targetPrice: input.targetPrice,
      targetQuantity: input.targetQuantity,
      note: input.note,
      active: true,
      createdAt: new Date().toISOString(),
    }

    this.data.buyIntents.push(intent)
    this.save()
  }

  markBuyIntentDone(id: string): void {
    this.data.buyIntents = this.data.buyIntents.map((intent) => {
      if (intent.id !== id) {
        return intent
      }

      return { ...intent, active: false }
    })
    this.save()
  }

  removeBuyIntent(id: string): void {
    this.data.buyIntents = this.data.buyIntents.filter((intent) => intent.id !== id)
    this.save()
  }

  convertIntentToBuy(id: string, purchaseDate: string): void {
    const intent = this.data.buyIntents.find((item) => item.id === id)

    if (!intent) {
      throw new Error('Intencao nao encontrada.')
    }

    this.addTrade({
      side: 'buy',
      ticker: intent.ticker,
      type: intent.ticker.endsWith('11') ? 'fii' : 'stock',
      quantity: intent.targetQuantity ?? 1,
      unitPrice: intent.targetPrice,
      date: purchaseDate,
      note: `Compra originada da intencao ${intent.id}`,
    })

    this.markBuyIntentDone(id)
  }

  addPriceAlert(input: {
    direction: 'buy' | 'sell'
    ticker: string
    targetPrice: number
    kind: 'stop_win' | 'realizacao_parcial' | 'aviso' | 'compra'
    note?: string
  }): void {
    const ticker = normalizeTicker(input.ticker)

    if (!ticker || input.targetPrice <= 0) {
      throw new Error('Dados de alerta invalidos.')
    }

    const alert: PriceAlert = {
      id: createId(input.direction === 'buy' ? 'balert' : 'salert'),
      ticker,
      direction: input.direction,
      targetPrice: input.targetPrice,
      kind: input.kind,
      note: input.note,
      active: true,
      createdAt: new Date().toISOString(),
    }

    if (input.direction === 'buy') {
      this.data.buyAlerts.push(alert)
    } else {
      this.data.sellAlerts.push(alert)
    }

    this.save()
  }

  markAlertDone(direction: 'buy' | 'sell', id: string): void {
    const group = direction === 'buy' ? this.data.buyAlerts : this.data.sellAlerts

    const updated = group.map((alert) => {
      if (alert.id !== id) {
        return alert
      }

      return {
        ...alert,
        active: false,
        doneAt: new Date().toISOString(),
      }
    })

    if (direction === 'buy') {
      this.data.buyAlerts = updated
    } else {
      this.data.sellAlerts = updated
    }

    this.save()
  }

  removeAlert(direction: 'buy' | 'sell', id: string): void {
    if (direction === 'buy') {
      this.data.buyAlerts = this.data.buyAlerts.filter((alert) => alert.id !== id)
    } else {
      this.data.sellAlerts = this.data.sellAlerts.filter((alert) => alert.id !== id)
    }

    this.save()
  }

  buildPortfolio(quotes: Map<string, QuoteData>): Position[] {
    return buildPositions(this.data.trades, quotes)
  }

  getTrackedTickers(): string[] {
    const set = new Set<string>()

    for (const item of this.data.favorites) {
      set.add(item.ticker)
    }

    for (const trade of this.data.trades) {
      set.add(trade.ticker)
    }

    for (const intent of this.data.buyIntents) {
      set.add(intent.ticker)
    }

    for (const alert of this.data.buyAlerts) {
      set.add(alert.ticker)
    }

    for (const alert of this.data.sellAlerts) {
      set.add(alert.ticker)
    }

    return [...set]
  }

  getTriggeredAlerts(quotes: Map<string, QuoteData>): TriggeredAlert[] {
    return evaluateTriggeredAlerts(this.data.buyAlerts, this.data.sellAlerts, this.data.buyIntents, quotes)
  }

  private sortTrades(trades: TradeRecord[]): TradeRecord[] {
    return [...trades].sort((a, b) => {
      const byDate = new Date(a.date).getTime() - new Date(b.date).getTime()

      if (byDate !== 0) {
        return byDate
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }

  private validateTrades(trades: TradeRecord[]): void {
    const sorted = this.sortTrades(trades)
    const balances = new Map<string, number>()

    for (const trade of sorted) {
      const current = balances.get(trade.ticker) ?? 0

      if (trade.side === 'buy') {
        balances.set(trade.ticker, current + trade.quantity)
        continue
      }

      const next = current - trade.quantity

      if (next < 0) {
        throw new Error(`Operacao invalida: venda de ${trade.ticker} excede saldo disponivel no historico.`)
      }

      balances.set(trade.ticker, next)
    }

    for (const trade of sorted) {
      if (trade.side === 'sell') {
        const available = getAvailableQuantity(sorted, trade.ticker)

        if (available < 0) {
          throw new Error('Historico inconsistente para vendas.')
        }
      }
    }
  }
}
