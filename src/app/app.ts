import { buildDashboardStats } from '../modules/alerts.ts'
import { LiveQuoteSocket } from '../services/liveQuoteSocket.ts'
import { MarketSearchService, type MarketSuggestion } from '../services/marketSearchService.ts'
import { quoteConfig, QuoteService } from '../services/quoteService.ts'
import type { AlertDirection, AssetType, PriceAlert, SellAlertKind, TradeSide } from '../types.ts'
import { normalizeTicker } from '../utils/format.ts'
import { AppStore } from './store.ts'
import { renderApp, type AppViewModel, type TabId } from './templates.ts'

export class InvestmentApp {
  private readonly root: HTMLElement
  private readonly store = new AppStore()
  private readonly quoteService = new QuoteService(quoteConfig)
  private readonly marketSearch = new MarketSearchService(quoteConfig.apiBaseUrl)
  private readonly liveSocket?: LiveQuoteSocket
  private activeTab: TabId = 'dashboard'
  private streamStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected'
  private themeMode: 'light' | 'dark' = 'light'
  private tickerSuggestions: MarketSuggestion[] = []
  private suggestionTimer?: number
  private editingTradeId?: string
  private editingTradeSide?: 'buy' | 'sell'
  private toast?: { text: string; type: 'success' | 'error' }
  private prefillBuyTicker = ''
  private prefillIntentTicker = ''
  private prefillIntentPrice = 0

  constructor(root: HTMLElement) {
    this.root = root

    const wsUrl = this.resolveWebSocketUrl()
    if (quoteConfig.useWebSocket && wsUrl) {
      this.liveSocket = new LiveQuoteSocket({
        url: wsUrl,
        onQuotes: (quotes) => {
          this.quoteService.mergeQuotes(quotes)
          this.renderPreservingForms()
        },
        onStatus: (status) => {
          this.streamStatus = status
          this.renderPreservingForms()
        },
      })
    }

    this.themeMode = this.loadThemeMode()
    this.applyThemeMode()

    this.root.addEventListener('click', (event) => this.onClick(event))
    this.root.addEventListener('submit', (event) => this.onSubmit(event))
    this.root.addEventListener('input', (event) => {
      void this.onInput(event)
    })
  }

  async init(): Promise<void> {
    await this.refreshQuotes()
    this.liveSocket?.connect()
    this.subscribeLiveQuotes()
    this.render()
    this.startAutoRefresh()
  }

  private startAutoRefresh(): void {
    window.setInterval(async () => {
      await this.refreshQuotes()
      this.renderPreservingForms()
    }, quoteConfig.refreshIntervalMs)
  }

  private loadThemeMode(): 'light' | 'dark' {
    const saved = localStorage.getItem('invest-track.theme')

    if (saved === 'light' || saved === 'dark') {
      return saved
    }

    const preferDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    return preferDark ? 'dark' : 'light'
  }

  private applyThemeMode(): void {
    document.documentElement.dataset.theme = this.themeMode
    localStorage.setItem('invest-track.theme', this.themeMode)
  }

  private toggleThemeMode(): void {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light'
    this.applyThemeMode()
    this.render()
  }

  private resolveWebSocketUrl(): string | undefined {
    if (quoteConfig.wsUrl) {
      return quoteConfig.wsUrl
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    return quoteConfig.apiBaseUrl.replace(/^http/, 'ws') + '/ws/quotes'
  }

  private subscribeLiveQuotes(): void {
    if (!this.liveSocket) {
      return
    }

    this.liveSocket.subscribe(this.store.getTrackedTickers())
  }

  private getViewModel(): AppViewModel {
    const data = this.store.snapshot()
    const quotes = this.quoteService.getCache()
    const positions = this.store.buildPortfolio(quotes)
    const triggered = this.store.getTriggeredAlerts(quotes)

    const stats = buildDashboardStats(
      data.favorites.length,
      positions,
      data.buyAlerts.filter((item) => item.active).length,
      data.sellAlerts.filter((item) => item.active).length,
      triggered,
      quotes,
    )

    return {
      activeTab: this.activeTab,
      data,
      positions,
      quotes,
      triggered,
      stats,
      streamStatus: this.streamStatus,
      themeMode: this.themeMode,
      tickerSuggestions: this.tickerSuggestions,
      editingTradeId: this.editingTradeId,
      editingTradeSide: this.editingTradeSide,
      toast: this.toast,
    }
  }

  private render(): void {
    this.root.innerHTML = renderApp(this.getViewModel())
    this.applyFormPrefill()
  }

  private captureFormState(): Map<string, string> {
    const state = new Map<string, string>()
    this.root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('form [name]').forEach((el) => {
      const form = el.closest('form')
      if (form?.id && el.name && el.value !== '') {
        state.set(`${form.id}__${el.name}`, el.value)
      }
    })
    return state
  }

  private restoreFormState(state: Map<string, string>): void {
    state.forEach((value, key) => {
      const sep = key.indexOf('__')
      const formId = key.slice(0, sep)
      const fieldName = key.slice(sep + 2)
      const el = this.root.querySelector<HTMLInputElement>(`#${formId} [name="${fieldName}"]`)
      if (el) {
        el.value = value
      }
    })
  }

  private renderPreservingForms(): void {
    const saved = this.captureFormState()

    // Remember which field had focus and cursor position
    const active = document.activeElement as HTMLInputElement | null
    const focusKey = (() => {
      if (!active) return null
      const form = active.closest('form')
      if (form?.id && (active as HTMLInputElement).name) {
        return `${form.id}__${(active as HTMLInputElement).name}`
      }
      return null
    })()
    const selStart = active?.selectionStart ?? null
    const selEnd = active?.selectionEnd ?? null

    this.render()
    this.restoreFormState(saved)

    // Restore focus and cursor position
    if (focusKey) {
      const sep = focusKey.indexOf('__')
      const formId = focusKey.slice(0, sep)
      const fieldName = focusKey.slice(sep + 2)
      const el = this.root.querySelector<HTMLInputElement>(`#${formId} [name="${fieldName}"]`)
      if (el) {
        el.focus()
        if (selStart !== null && selEnd !== null) {
          try { el.setSelectionRange(selStart, selEnd) } catch { /* non-text inputs */ }
        }
      }
    }
  }

  private applyFormPrefill(): void {
    if (this.prefillBuyTicker) {
      const input = this.root.querySelector<HTMLInputElement>('#buy-form input[name="ticker"]')
      if (input) {
        input.value = this.prefillBuyTicker
      }
      this.prefillBuyTicker = ''
    }

    if (this.prefillIntentTicker) {
      const tickerInput = this.root.querySelector<HTMLInputElement>('#intent-form input[name="ticker"]')
      if (tickerInput) {
        tickerInput.value = this.prefillIntentTicker
      }
      if (this.prefillIntentPrice > 0) {
        const priceInput = this.root.querySelector<HTMLInputElement>('#intent-form input[name="targetPrice"]')
        if (priceInput) {
          priceInput.value = String(this.prefillIntentPrice)
          priceInput.focus()
          priceInput.select()
        }
      }
      this.prefillIntentTicker = ''
      this.prefillIntentPrice = 0
    }
  }

  private updateSuggestionDatalist(): void {
    const datalist = this.root.querySelector<HTMLDataListElement>('#ticker-suggestions')

    if (!datalist) {
      return
    }

    datalist.innerHTML = this.tickerSuggestions
      .map((item) => `<option value="${item.ticker}" label="${item.name}"></option>`)
      .join('')
  }

  private setToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { text, type }
    this.render()
    window.setTimeout(() => {
      this.toast = undefined
      this.render()
    }, 2600)
  }

  private async refreshQuotes(): Promise<void> {
    const tickers = this.store.getTrackedTickers()
    await this.quoteService.refreshTickers(tickers)
    this.subscribeLiveQuotes()
  }

  private async onClick(event: Event): Promise<void> {
    const element = event.target as HTMLElement
    const button = element.closest<HTMLElement>('[data-action], [data-tab]')

    if (!button) {
      return
    }

    const tab = button.dataset.tab as TabId | undefined

    if (tab) {
      this.activeTab = tab
      this.render()
      return
    }

    const action = button.dataset.action

    if (!action) {
      return
    }

    try {
      switch (action) {
        case 'refresh-quotes':
          await this.refreshQuotes()
          this.setToast('Cotacoes atualizadas com sucesso.')
          return
        case 'toggle-theme':
          this.toggleThemeMode()
          return
        case 'remove-favorite': {
          const ticker = button.dataset.ticker
          if (ticker && window.confirm(`Remover ${ticker} dos favoritos?`)) {
            this.store.removeFavorite(ticker)
            await this.refreshQuotes()
            this.setToast('Favorito removido.')
          }
          return
        }
        case 'edit-trade': {
          const id = button.dataset.id
          const side = button.dataset.side as 'buy' | 'sell' | undefined

          if (id && side) {
            const trade = this.store.getTradeById(id)

            if (!trade) {
              this.setToast('Operacao nao encontrada.', 'error')
              return
            }

            this.editingTradeId = id
            this.editingTradeSide = side
            this.activeTab = side === 'buy' ? 'compras' : 'vendas'
            this.render()
          }

          return
        }
        case 'remove-trade': {
          const id = button.dataset.id

          if (id && window.confirm('Excluir operacao selecionada?')) {
            this.store.removeTrade(id)
            if (this.editingTradeId === id) {
              this.editingTradeId = undefined
              this.editingTradeSide = undefined
            }
            await this.refreshQuotes()
            this.setToast('Operacao excluida.')
          }

          return
        }
        case 'cancel-trade-edit': {
          this.editingTradeId = undefined
          this.editingTradeSide = undefined
          this.setToast('Edicao cancelada.')
          return
        }
        case 'open-buy': {
          const ticker = button.dataset.ticker
          if (ticker) {
            this.activeTab = 'compras'
            this.prefillBuyTicker = ticker
            this.render()
          }
          return
        }
        case 'intent-from-fav': {
          const ticker = button.dataset.ticker
          if (ticker) {
            this.activeTab = 'intencoes'
            this.prefillIntentTicker = ticker
            this.prefillIntentPrice = this.quoteService.getCache().get(ticker)?.price ?? 0
            this.render()
          }
          return
        }
        case 'intent-buy': {
          const id = button.dataset.id
          if (id) {
            const today = new Date().toISOString().slice(0, 10)
            this.store.convertIntentToBuy(id, today)
            await this.refreshQuotes()
            this.setToast('Intencao convertida em compra.')
          }
          return
        }
        case 'intent-done': {
          const id = button.dataset.id
          if (id) {
            this.store.markBuyIntentDone(id)
            this.setToast('Intencao marcada como concluida.')
          }
          return
        }
        case 'intent-remove': {
          const id = button.dataset.id
          if (id && window.confirm('Excluir intencao de compra?')) {
            this.store.removeBuyIntent(id)
            this.setToast('Intencao removida.')
          }
          return
        }
        case 'alert-done': {
          const id = button.dataset.id
          const direction = button.dataset.direction as AlertDirection | undefined
          if (id && direction) {
            this.store.markAlertDone(direction, id)
            this.setToast('Alerta concluido.')
          }
          return
        }
        case 'alert-remove': {
          const id = button.dataset.id
          const direction = button.dataset.direction as AlertDirection | undefined
          if (id && direction && window.confirm('Excluir alerta?')) {
            this.store.removeAlert(direction, id)
            this.setToast('Alerta removido.')
          }
          return
        }
        default:
          return
      }
    } catch (error) {
      this.setToast(error instanceof Error ? error.message : 'Falha na acao solicitada.', 'error')
    }
  }

  private async onSubmit(event: Event): Promise<void> {
    const target = event.target as HTMLFormElement

    if (!target || target.tagName !== 'FORM') {
      return
    }

    event.preventDefault()

    try {
      switch (target.id) {
        case 'favorite-form':
          this.handleFavoriteSubmit(target)
          await this.refreshQuotes()
          this.setToast('Ativo favorito adicionado.')
          return
        case 'buy-form':
          {
            const wasEditing = this.editingTradeSide === 'buy'
            this.handleTradeSubmit(target, 'buy')
            await this.refreshQuotes()
            this.setToast(wasEditing ? 'Compra atualizada com sucesso.' : 'Compra registrada com sucesso.')
          }
          return
        case 'sell-form':
          {
            const wasEditing = this.editingTradeSide === 'sell'
            this.handleTradeSubmit(target, 'sell')
            await this.refreshQuotes()
            this.setToast(wasEditing ? 'Venda atualizada com sucesso.' : 'Venda registrada com sucesso.')
          }
          return
        case 'intent-form':
          this.handleIntentSubmit(target)
          await this.refreshQuotes()
          this.setToast('Intencao de compra registrada.')
          return
        case 'buy-alert-form':
          this.handleAlertSubmit(target, 'buy')
          await this.refreshQuotes()
          this.setToast('Alerta de compra criado.')
          return
        case 'sell-alert-form':
          this.handleAlertSubmit(target, 'sell')
          await this.refreshQuotes()
          this.setToast('Alerta de venda criado.')
          return
        default:
          return
      }
    } catch (error) {
      this.setToast(error instanceof Error ? error.message : 'Falha ao salvar dados.', 'error')
    }
  }

  private async onInput(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement

    if (!target || target.dataset.autocomplete !== 'ticker') {
      return
    }

    const query = target.value.trim()

    if (this.suggestionTimer) {
      window.clearTimeout(this.suggestionTimer)
    }

    if (query.length < 2) {
      this.tickerSuggestions = []
      this.updateSuggestionDatalist()
      return
    }

    this.suggestionTimer = window.setTimeout(async () => {
      const remote = await this.marketSearch.search(query)
      const localTickers = this.store.getTrackedTickers()
      const local = localTickers
        .filter((ticker) => ticker.includes(query.toUpperCase()))
        .map((ticker) => ({ ticker, name: 'Ativo monitorado', type: ticker.endsWith('11') ? 'fii' as const : 'stock' as const }))

      const map = new Map<string, MarketSuggestion>()

      for (const item of [...remote, ...local]) {
        if (!item.ticker) {
          continue
        }

        map.set(item.ticker, item)
      }

      this.tickerSuggestions = [...map.values()].slice(0, 12)
      this.updateSuggestionDatalist()
    }, 220)
  }

  private handleFavoriteSubmit(form: HTMLFormElement): void {
    const data = new FormData(form)
    const ticker = normalizeTicker(String(data.get('ticker') ?? ''))
    const type = String(data.get('type') ?? 'stock') as AssetType

    this.store.addFavorite(ticker, type)
    form.reset()
  }

  private handleTradeSubmit(form: HTMLFormElement, side: TradeSide): void {
    const data = new FormData(form)
    const ticker = normalizeTicker(String(data.get('ticker') ?? ''))
    const type: AssetType = ticker.endsWith('11') ? 'fii' : 'stock'
    const tradeId = String(data.get('tradeId') ?? '').trim()

    if (tradeId) {
      this.store.updateTrade(tradeId, {
        ticker,
        date: String(data.get('date') ?? ''),
        quantity: Number(data.get('quantity') ?? 0),
        unitPrice: Number(data.get('unitPrice') ?? 0),
        note: String(data.get('note') ?? '').trim() || undefined,
      })
      this.editingTradeId = undefined
      this.editingTradeSide = undefined
    } else {
      this.store.addTrade({
        side,
        ticker,
        type,
        date: String(data.get('date') ?? ''),
        quantity: Number(data.get('quantity') ?? 0),
        unitPrice: Number(data.get('unitPrice') ?? 0),
        note: String(data.get('note') ?? '').trim() || undefined,
      })
    }

    form.reset()
  }

  private handleIntentSubmit(form: HTMLFormElement): void {
    const data = new FormData(form)

    this.store.addBuyIntent({
      ticker: String(data.get('ticker') ?? ''),
      targetPrice: Number(data.get('targetPrice') ?? 0),
      targetQuantity: Number(data.get('targetQuantity') ?? 0) || undefined,
      note: String(data.get('note') ?? '').trim() || undefined,
    })

    form.reset()
  }

  private handleAlertSubmit(form: HTMLFormElement, direction: AlertDirection): void {
    const data = new FormData(form)

    this.store.addPriceAlert({
      direction,
      ticker: String(data.get('ticker') ?? ''),
      targetPrice: Number(data.get('targetPrice') ?? 0),
      kind: String(data.get('kind') ?? 'aviso') as PriceAlert['kind'] | SellAlertKind,
      note: String(data.get('note') ?? '').trim() || undefined,
    })

    form.reset()
  }
}
