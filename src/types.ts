export type AssetType = 'stock' | 'fii'
export type TradeSide = 'buy' | 'sell'
export type AlertDirection = 'buy' | 'sell'
export type SellAlertKind = 'stop_win' | 'realizacao_parcial' | 'aviso'

export interface FavoriteAsset {
  ticker: string
  type: AssetType
  addedAt: string
}

export interface TradeRecord {
  id: string
  side: TradeSide
  ticker: string
  type: AssetType
  quantity: number
  unitPrice: number
  date: string
  note?: string
  createdAt: string
}

export interface BuyIntent {
  id: string
  ticker: string
  targetPrice: number
  targetQuantity?: number
  note?: string
  active: boolean
  createdAt: string
}

export interface PriceAlert {
  id: string
  ticker: string
  direction: AlertDirection
  targetPrice: number
  kind: SellAlertKind | 'compra'
  note?: string
  active: boolean
  doneAt?: string
  createdAt: string
}

export interface Position {
  ticker: string
  type: AssetType
  quantity: number
  avgPrice: number
  investedValue: number
  currentPrice: number
  marketValue: number
  pnlValue: number
  pnlPercent: number
}

export interface QuoteData {
  ticker: string
  price: number
  changePercent: number
  updatedAt: string
  source: string
}

export interface AppData {
  favorites: FavoriteAsset[]
  trades: TradeRecord[]
  buyIntents: BuyIntent[]
  buyAlerts: PriceAlert[]
  sellAlerts: PriceAlert[]
}

export interface TriggeredAlert {
  id: string
  ticker: string
  targetPrice: number
  currentPrice: number
  source: 'buy-alert' | 'sell-alert' | 'buy-intent'
  message: string
}

export interface DashboardStats {
  monitoredCount: number
  portfolioCount: number
  investedTotal: number
  marketTotal: number
  pnlTotal: number
  pnlPercent: number
  buyAlertsActive: number
  sellAlertsActive: number
  triggeredCount: number
  topGainer?: { ticker: string; value: number }
  topLoser?: { ticker: string; value: number }
}
