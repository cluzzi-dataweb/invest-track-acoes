import type { AppData, DashboardStats, Position, QuoteData, TriggeredAlert } from '../types.ts'
import { formatCurrency, formatDate, formatDateTime, formatPercent } from '../utils/format.ts'

export type TabId =
  | 'dashboard'
  | 'favoritos'
  | 'carteira'
  | 'compras'
  | 'vendas'
  | 'intencoes'
  | 'alertas-compra'
  | 'alertas-venda'

export interface AppViewModel {
  activeTab: TabId
  data: AppData
  positions: Position[]
  quotes: Map<string, QuoteData>
  triggered: TriggeredAlert[]
  stats: DashboardStats
  streamStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  themeMode: 'light' | 'dark'
  tickerSuggestions: Array<{ ticker: string; name: string }>
  editingTradeId?: string
  editingTradeSide?: 'buy' | 'sell'
  toast?: { text: string; type: 'success' | 'error' }
  authEmail?: string
  authStatus: 'authenticated' | 'anonymous'
  cloudSyncStatus: 'offline' | 'syncing' | 'synced' | 'error'
  cloudLastSyncedAt?: string
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'favoritos', label: 'Ativos Favoritos' },
  { id: 'carteira', label: 'Carteira' },
  { id: 'compras', label: 'Registro de Compras' },
  { id: 'vendas', label: 'Registro de Vendas' },
  { id: 'intencoes', label: 'Intencao de Compra' },
  { id: 'alertas-compra', label: 'Alertas de Compra' },
  { id: 'alertas-venda', label: 'Alertas de Venda' },
]

function getDirectionClass(value: number): 'status-up' | 'status-down' | 'status-neutral' {
  if (value > 0) {
    return 'status-up'
  }

  if (value < 0) {
    return 'status-down'
  }

  return 'status-neutral'
}

function getQuoteInfo(quotes: Map<string, QuoteData>, ticker: string): { text: string; directionClass: 'status-up' | 'status-down' | 'status-neutral'; badge: string } {
  const quote = quotes.get(ticker)

  if (!quote) {
    return {
      text: 'Sem cotacao',
      directionClass: 'status-neutral',
      badge: '<span class="pill quote-pill neutral">Sem variacao</span>',
    }
  }

  const directionClass = getDirectionClass(quote.changePercent)
  const sign = quote.changePercent > 0 ? '+' : ''
  const tone = directionClass === 'status-up' ? 'up' : directionClass === 'status-down' ? 'down' : 'neutral'

  return {
    text: `${formatCurrency(quote.price)} (${formatPercent(quote.changePercent)})`,
    directionClass,
    badge: `<span class="pill quote-pill ${tone}">${sign}${formatPercent(quote.changePercent)}</span>`,
  }
}

function renderTabButtons(activeTab: TabId): string {
  return tabs
    .map((tab) => `<button data-action="tab" data-tab="${tab.id}" class="tab ${activeTab === tab.id ? 'active' : ''}">${tab.label}</button>`)
    .join('')
}

function renderStatsCards(stats: DashboardStats): string {
  const pnlClass = stats.pnlTotal >= 0 ? 'status-up' : 'status-down'

  return `
    <section class="stats-grid">
      <article class="card"><h3>Monitorados</h3><strong>${stats.monitoredCount}</strong></article>
      <article class="card"><h3>Ativos em carteira</h3><strong>${stats.portfolioCount}</strong></article>
      <article class="card"><h3>Investido total</h3><strong>${formatCurrency(stats.investedTotal)}</strong></article>
      <article class="card"><h3>Valor atual</h3><strong>${formatCurrency(stats.marketTotal)}</strong></article>
      <article class="card ${pnlClass}"><h3>Lucro/Prejuizo</h3><strong>${formatCurrency(stats.pnlTotal)} (${formatPercent(stats.pnlPercent)})</strong></article>
      <article class="card"><h3>Alertas compra ativos</h3><strong>${stats.buyAlertsActive}</strong></article>
      <article class="card"><h3>Alertas venda ativos</h3><strong>${stats.sellAlertsActive}</strong></article>
      <article class="card"><h3>Alertas atingidos</h3><strong>${stats.triggeredCount}</strong></article>
    </section>
  `
}

function renderTopMovers(stats: DashboardStats): string {
  const gainerClass = stats.topGainer ? getDirectionClass(stats.topGainer.value) : 'status-neutral'
  const loserClass = stats.topLoser ? getDirectionClass(stats.topLoser.value) : 'status-neutral'

  return `
    <section class="card">
      <h3>Resumo de mercado monitorado</h3>
      <p>Maior alta: <strong class="${gainerClass}">${stats.topGainer ? `${stats.topGainer.ticker} (${formatPercent(stats.topGainer.value)})` : '--'}</strong></p>
      <p>Maior baixa: <strong class="${loserClass}">${stats.topLoser ? `${stats.topLoser.ticker} (${formatPercent(stats.topLoser.value)})` : '--'}</strong></p>
    </section>
  `
}

function renderTriggeredAlerts(triggered: TriggeredAlert[]): string {
  if (triggered.length === 0) {
    return '<section class="card"><h3>Alertas no momento</h3><p>Nenhum alerta atingido agora.</p></section>'
  }

  return `
    <section class="card">
      <h3>Alertas no momento</h3>
      <ul class="bullet-list">
        ${triggered.map((item) => `<li>${item.message} | Atual ${formatCurrency(item.currentPrice)} | Alvo ${formatCurrency(item.targetPrice)}</li>`).join('')}
      </ul>
    </section>
  `
}

function renderDashboard(view: AppViewModel): string {
  return `${renderStatsCards(view.stats)}${renderTopMovers(view.stats)}${renderTriggeredAlerts(view.triggered)}`
}

function renderFavorites(view: AppViewModel): string {
  return `
    <section class="card">
      <h3>Adicionar ativo favorito</h3>
      <form id="favorite-form" class="form-grid form-inline">
        <input name="ticker" placeholder="Ticker (ex: PETR4)" list="ticker-suggestions" data-autocomplete="ticker" autocomplete="off" required />
        <select name="type">
          <option value="stock">Acao</option>
          <option value="fii">FII</option>
        </select>
        <button type="submit">Adicionar</button>
      </form>
    </section>
    <section class="card">
      <h3>Lista de favoritos</h3>
      <table>
        <thead><tr><th>Ticker</th><th>Tipo</th><th>Cotacao</th><th>Acoes</th></tr></thead>
        <tbody>
          ${view.data.favorites.length === 0 ? '<tr><td colspan="4">Nenhum favorito adicionado.</td></tr>' : view.data.favorites.map((item) => {
            const quote = getQuoteInfo(view.quotes, item.ticker)
            return `
            <tr>
              <td>${item.ticker}</td>
              <td>${item.type === 'fii' ? 'FII' : 'Acao'}</td>
              <td><span class="${quote.directionClass}">${quote.text}</span> ${quote.badge}</td>
              <td>
                <button data-action="open-buy" data-ticker="${item.ticker}">Comprar</button>
                <button data-action="intent-from-fav" data-ticker="${item.ticker}">Intencao</button>
                <button data-action="remove-favorite" data-ticker="${item.ticker}" class="danger">Remover</button>
              </td>
            </tr>
          `
          }).join('')}
        </tbody>
      </table>
    </section>
  `
}

function renderPortfolio(view: AppViewModel): string {
  return `
    <section class="card">
      <h3>Posicao atual da carteira</h3>
      <table>
        <thead><tr><th>Ticker</th><th>Tipo</th><th>Quantidade</th><th>Preco medio</th><th>Investido</th><th>Cotacao atual</th><th>Valor atual</th><th>P/L</th><th>Acoes</th></tr></thead>
        <tbody>
          ${view.positions.length === 0 ? '<tr><td colspan="9">Sem posicoes ativas.</td></tr>' : view.positions.map((position) => {
            const quote = view.quotes.get(position.ticker)
            const change = quote?.changePercent ?? 0
            const changeClass = getDirectionClass(change)
            const sign = change > 0 ? '+' : ''
            return `
            <tr>
              <td>${position.ticker}</td>
              <td>${position.type === 'fii' ? 'FII' : 'Acao'}</td>
              <td>${position.quantity}</td>
              <td>${formatCurrency(position.avgPrice)}</td>
              <td>${formatCurrency(position.investedValue)}</td>
              <td><span class="${changeClass}">${formatCurrency(position.currentPrice)}</span> <span class="pill quote-pill ${changeClass === 'status-up' ? 'up' : changeClass === 'status-down' ? 'down' : 'neutral'}">${sign}${formatPercent(change)}</span></td>
              <td>${formatCurrency(position.marketValue)}</td>
              <td class="${position.pnlValue >= 0 ? 'status-up' : 'status-down'}">${formatCurrency(position.pnlValue)} (${formatPercent(position.pnlPercent)})</td>
              <td class="table-actions">
                <button data-action="portfolio-buy-more" data-ticker="${position.ticker}">Comprei mais</button>
                <button data-action="portfolio-sell-part" data-ticker="${position.ticker}" data-quantity="${position.quantity}" data-price="${position.currentPrice}">Vendi parte</button>
                <button data-action="portfolio-clear-position" data-ticker="${position.ticker}" data-quantity="${position.quantity}" data-price="${position.currentPrice}" class="danger">Zerar posicao</button>
              </td>
            </tr>
          `
          }).join('')}
        </tbody>
      </table>
    </section>
  `
}

function renderTradeForm(view: AppViewModel, side: 'buy' | 'sell'): string {
  const label = side === 'buy' ? 'Registrar compra' : 'Registrar venda'
  const editing = view.editingTradeId !== undefined && view.editingTradeSide === side
  const current = editing ? view.data.trades.find((item) => item.id === view.editingTradeId && item.side === side) : undefined

  return `
    <section class="card">
      <h3>${label}</h3>
      <form id="${side}-form" class="form-grid">
        <input name="tradeId" type="hidden" value="${current?.id ?? ''}" />
        <input name="ticker" placeholder="Ticker" value="${current?.ticker ?? ''}" list="ticker-suggestions" data-autocomplete="ticker" autocomplete="off" required />
        <input name="date" type="date" value="${current?.date ?? ''}" required />
        <input name="quantity" type="number" min="1" step="1" placeholder="Quantidade" value="${current?.quantity ?? ''}" required />
        <input name="unitPrice" type="number" min="0.01" step="0.01" placeholder="Valor unitario" value="${current?.unitPrice ?? ''}" required />
        <input name="note" placeholder="Observacao (opcional)" value="${current?.note ?? ''}" />
        <button type="submit">${editing ? 'Atualizar' : 'Salvar'}</button>
        ${editing ? '<button type="button" data-action="cancel-trade-edit" class="secondary">Cancelar edicao</button>' : ''}
      </form>
    </section>
  `
}

function renderTradesHistory(view: AppViewModel, side: 'buy' | 'sell'): string {
  const rows = view.data.trades.filter((item) => item.side === side)

  return `
    <section class="card">
      <h3>Historico de ${side === 'buy' ? 'compras' : 'vendas'}</h3>
      <table>
        <thead><tr><th>Data</th><th>Ticker</th><th>Qtd</th><th>Valor unitario</th><th>Total</th><th>Obs</th><th>Acoes</th></tr></thead>
        <tbody>
          ${rows.length === 0 ? '<tr><td colspan="7">Sem registros.</td></tr>' : rows.map((item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${item.ticker}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unitPrice)}</td>
              <td>${formatCurrency(item.unitPrice * item.quantity)}</td>
              <td>${item.note ?? '-'}</td>
              <td>
                <button data-action="edit-trade" data-id="${item.id}" data-side="${item.side}">Editar</button>
                <button data-action="remove-trade" data-id="${item.id}" class="danger">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `
}

function renderBuyIntents(view: AppViewModel): string {
  return `
    <section class="card">
      <h3>Nova intencao de compra</h3>
      <form id="intent-form" class="form-grid">
        <input name="ticker" placeholder="Ticker" list="ticker-suggestions" data-autocomplete="ticker" autocomplete="off" required />
        <input name="targetPrice" type="number" min="0.01" step="0.01" placeholder="Preco desejado" required />
        <input name="targetQuantity" type="number" min="1" step="1" placeholder="Qtd desejada (opcional)" />
        <input name="note" placeholder="Observacao (opcional)" />
        <button type="submit">Salvar intencao</button>
      </form>
    </section>
    <section class="card">
      <h3>Intencoes cadastradas</h3>
      <table>
        <thead><tr><th>Ticker</th><th>Alvo</th><th>Cotacao</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>
          ${view.data.buyIntents.length === 0 ? '<tr><td colspan="5">Sem intencoes.</td></tr>' : view.data.buyIntents.map((item) => {
            const current = view.quotes.get(item.ticker)?.price
            const quoteChange = view.quotes.get(item.ticker)?.changePercent ?? 0
            const quoteClass = getDirectionClass(quoteChange)
            const quoteSign = quoteChange > 0 ? '+' : ''
            const reached = current !== undefined && current <= item.targetPrice
            return `
              <tr>
                <td>${item.ticker}</td>
                <td>${formatCurrency(item.targetPrice)}</td>
                <td>${current !== undefined ? `<span class="${quoteClass}">${formatCurrency(current)}</span> <span class="pill quote-pill ${quoteClass === 'status-up' ? 'up' : quoteClass === 'status-down' ? 'down' : 'neutral'}">${quoteSign}${formatPercent(quoteChange)}</span>` : '--'}</td>
                <td class="${reached ? 'status-up' : ''}">${item.active ? reached ? 'Atingido' : 'Ativo' : 'Concluido'}</td>
                <td>
                  <button data-action="intent-buy" data-id="${item.id}">Virar compra</button>
                  <button data-action="intent-done" data-id="${item.id}">Concluir</button>
                  <button data-action="intent-remove" data-id="${item.id}" class="danger">Excluir</button>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </section>
  `
}

function renderAlerts(view: AppViewModel, direction: 'buy' | 'sell'): string {
  const isBuy = direction === 'buy'
  const alerts = isBuy ? view.data.buyAlerts : view.data.sellAlerts

  return `
    <section class="card">
      <h3>Novo alerta de ${isBuy ? 'compra' : 'venda'}</h3>
      <form id="${direction}-alert-form" class="form-grid">
        <input name="ticker" placeholder="Ticker" list="ticker-suggestions" data-autocomplete="ticker" autocomplete="off" required />
        <input name="targetPrice" type="number" min="0.01" step="0.01" placeholder="Preco alvo" required />
        ${isBuy ? '<input type="hidden" name="kind" value="compra" />' : '<select name="kind"><option value="stop_win">Stop Win</option><option value="realizacao_parcial">Realizacao parcial</option><option value="aviso">Apenas aviso</option></select>'}
        <input name="note" placeholder="Observacao (opcional)" />
        <button type="submit">Salvar alerta</button>
      </form>
    </section>
    <section class="card">
      <h3>Alertas de ${isBuy ? 'compra' : 'venda'}</h3>
      <table>
        <thead><tr><th>Ticker</th><th>Alvo</th><th>Cotacao</th><th>Tipo</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>
          ${alerts.length === 0 ? '<tr><td colspan="6">Sem alertas cadastrados.</td></tr>' : alerts.map((item) => {
            const current = view.quotes.get(item.ticker)?.price
            const quoteChange = view.quotes.get(item.ticker)?.changePercent ?? 0
            const quoteClass = getDirectionClass(quoteChange)
            const quoteSign = quoteChange > 0 ? '+' : ''
            const reached = current !== undefined && (isBuy ? current <= item.targetPrice : current >= item.targetPrice)
            return `
              <tr>
                <td>${item.ticker}</td>
                <td>${formatCurrency(item.targetPrice)}</td>
                <td>${current !== undefined ? `<span class="${quoteClass}">${formatCurrency(current)}</span> <span class="pill quote-pill ${quoteClass === 'status-up' ? 'up' : quoteClass === 'status-down' ? 'down' : 'neutral'}">${quoteSign}${formatPercent(quoteChange)}</span>` : '--'}</td>
                <td>${item.kind}</td>
                <td class="${reached ? 'status-up' : ''}">${item.active ? reached ? 'Atingido' : 'Ativo' : `Concluido em ${item.doneAt ? formatDateTime(item.doneAt) : '--'}`}</td>
                <td>
                  <button data-action="alert-done" data-direction="${direction}" data-id="${item.id}">Concluir</button>
                  <button data-action="alert-remove" data-direction="${direction}" data-id="${item.id}" class="danger">Excluir</button>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </section>
  `
}

function renderActiveTab(view: AppViewModel): string {
  switch (view.activeTab) {
    case 'dashboard':
      return renderDashboard(view)
    case 'favoritos':
      return renderFavorites(view)
    case 'carteira':
      return renderPortfolio(view)
    case 'compras':
      return `${renderTradeForm(view, 'buy')}${renderTradesHistory(view, 'buy')}`
    case 'vendas':
      return `${renderTradeForm(view, 'sell')}${renderTradesHistory(view, 'sell')}`
    case 'intencoes':
      return renderBuyIntents(view)
    case 'alertas-compra':
      return renderAlerts(view, 'buy')
    case 'alertas-venda':
      return renderAlerts(view, 'sell')
    default:
      return renderDashboard(view)
  }
}

export function renderApp(view: AppViewModel): string {
  const streamText = view.streamStatus === 'connected'
    ? 'Tempo real: conectado'
    : view.streamStatus === 'connecting'
      ? 'Tempo real: conectando'
      : view.streamStatus === 'error'
        ? 'Tempo real: erro'
        : 'Tempo real: desconectado'

  const streamClass = view.streamStatus === 'connected' ? 'status-up' : view.streamStatus === 'error' ? 'status-down' : ''
  const themeText = view.themeMode === 'dark' ? 'Tema escuro' : 'Tema claro'
  const authText = view.authStatus === 'authenticated'
    ? `Conta conectada: ${view.authEmail ?? '-'}`
    : 'Conta desconectada: entre para salvar na nuvem'
  const cloudText = view.cloudSyncStatus === 'synced'
    ? `Nuvem sincronizada${view.cloudLastSyncedAt ? ` em ${formatDateTime(view.cloudLastSyncedAt)}` : ''}`
    : view.cloudSyncStatus === 'syncing'
      ? 'Nuvem sincronizando'
      : view.cloudSyncStatus === 'error'
        ? 'Nuvem com erro de sincronizacao'
        : 'Nuvem indisponivel'
  const cloudClass = view.cloudSyncStatus === 'synced' ? 'status-up' : view.cloudSyncStatus === 'error' ? 'status-down' : ''

  return `
    <div class="container">
      <datalist id="ticker-suggestions">
        ${view.tickerSuggestions.map((item) => `<option value="${item.ticker}" label="${item.name}"></option>`).join('')}
      </datalist>

      <header class="app-header">
        <div>
          <p class="eyebrow">Controle de Investimentos</p>
          <h1>Invest Track</h1>
        </div>
        <div class="header-actions">
          <button data-action="refresh-quotes">Atualizar cotacoes</button>
          <button data-action="auth-register" class="secondary">Criar conta</button>
          <button data-action="auth-login" class="secondary">Entrar</button>
          <button data-action="auth-logout" class="secondary">Sair</button>
          <button data-action="sync-cloud" class="secondary">Sincronizar nuvem</button>
          <button data-action="toggle-theme" class="secondary">${themeText}</button>
          <p class="small ${streamClass}">${streamText}</p>
          <p class="small">${authText}</p>
          <p class="small ${cloudClass}">${cloudText}</p>
        </div>
      </header>

      <nav class="tabs">${renderTabButtons(view.activeTab)}</nav>

      ${view.toast ? `<div class="toast ${view.toast.type}">${view.toast.text}</div>` : ''}

      <main class="content-grid">
        ${renderActiveTab(view)}
      </main>
    </div>
  `
}
