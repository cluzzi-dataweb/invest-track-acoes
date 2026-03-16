const STORAGE_KEYS = {
  portfolio: "b3app_portfolio",
  portfolioBackup: "b3app_portfolio_backup",
  watchlist: "b3app_watchlist",
  alerts: "b3app_alerts",
  settings: "b3app_settings",
  trailingHighs: "b3app_trailing_highs"
};

const SELL_SIGNAL_TYPES = {
  TARGET: "preco-alvo atingido",
  TRAILING: "trailing stop acionado",
  STOP_LOSS: "stop loss acionado",
  TREND: "perda de tendencia",
  RSI: "RSI extremo",
  VOLUME_DROP: "queda com volume",
  ANALYST_NEAR_TARGET: "ativo proximo do alvo dos analistas"
};

const B3_FALLBACK = [
  { ticker: "PETR4", name: "Petrobras" },
  { ticker: "PETR3", name: "Petrobras ON" },
  { ticker: "VALE3", name: "Vale" },
  { ticker: "ITUB4", name: "Itau Unibanco" },
  { ticker: "ITUB3", name: "Itau Unibanco ON" },
  { ticker: "BBDC4", name: "Bradesco" },
  { ticker: "BBDC3", name: "Bradesco ON" },
  { ticker: "BBAS3", name: "Banco do Brasil" },
  { ticker: "ABEV3", name: "Ambev" },
  { ticker: "WEGE3", name: "WEG" },
  { ticker: "RENT3", name: "Localiza Hertz" },
  { ticker: "SUZB3", name: "Suzano" },
  { ticker: "PRIO3", name: "PRIO" },
  { ticker: "JBSS3", name: "JBS" },
  { ticker: "RAIL3", name: "Rumo" },
  { ticker: "GGBR4", name: "Gerdau" },
  { ticker: "GGBR3", name: "Gerdau ON" },
  { ticker: "CMIG4", name: "Cemig" },
  { ticker: "CMIG3", name: "Cemig ON" },
  { ticker: "ELET3", name: "Eletrobras" },
  { ticker: "ELET6", name: "Eletrobras PNB" },
  { ticker: "EQTL3", name: "Equatorial Energia" },
  { ticker: "LREN3", name: "Lojas Renner" },
  { ticker: "RDOR3", name: "Rede D Or Sao Luiz" },
  { ticker: "B3SA3", name: "B3" },
  { ticker: "VBBR3", name: "Vibra Energia" },
  { ticker: "CPLE6", name: "Copel" },
  { ticker: "CPLE3", name: "Copel ON" },
  { ticker: "VIVT3", name: "Vivo Telefonica" },
  { ticker: "TOTS3", name: "Totvs" },
  { ticker: "HYPE3", name: "Hypera Pharma" },
  { ticker: "SBSP3", name: "Sabesp" },
  { ticker: "CSAN3", name: "Cosan" },
  { ticker: "RADL3", name: "Raia Drogasil" },
  { ticker: "FLRY3", name: "Fleury" },
  { ticker: "BRFS3", name: "BRF" },
  { ticker: "CSNA3", name: "CSN" },
  { ticker: "USIM5", name: "Usiminas" },
  { ticker: "SLCE3", name: "SLC Agricola" },
  { ticker: "AGRO3", name: "BrasilAgro" },
  { ticker: "MRFG3", name: "Marfrig" },
  { ticker: "BEEF3", name: "Minerva Foods" },
  { ticker: "MOVI3", name: "Movida" },
  { ticker: "MGLU3", name: "Magazine Luiza" },
  { ticker: "NTCO3", name: "Natura" },
  { ticker: "EMBR3", name: "Embraer" },
  { ticker: "KLBN11", name: "Klabin" },
  { ticker: "HAPV3", name: "Hapvida" },
  { ticker: "GNDI3", name: "Grupo Notre Dame Intermedica" },
  { ticker: "EGIE3", name: "Engie Brasil" },
  { ticker: "TAEE11", name: "Taesa" },
  { ticker: "TRPL4", name: "ISA CTEEP" },
  { ticker: "ENGI11", name: "Energisa" },
  { ticker: "CYRE3", name: "Cyrela" },
  { ticker: "EZTC3", name: "EZTEC" },
  { ticker: "MRVE3", name: "MRV Engenharia" },
  { ticker: "GFSA3", name: "Gafisa" },
  { ticker: "LWSA3", name: "Locaweb" },
  { ticker: "INTB3", name: "Intelbras" },
  { ticker: "MXRF11", name: "Maxi Renda FII" },
  { ticker: "HGLG11", name: "CSHG Logistica FII" },
  { ticker: "KNRI11", name: "Kinea Renda Imobiliaria FII" },
  { ticker: "XPML11", name: "XP Malls FII" },
  { ticker: "BCFF11", name: "BTG Pactual Fundo de CRI FII" },
  { ticker: "BBSE3", name: "BB Seguridade" },
  { ticker: "ITSA4", name: "Itausa" },
  { ticker: "ITSA3", name: "Itausa ON" },
  { ticker: "SANB11", name: "Santander Brasil" },
  { ticker: "BPAC11", name: "BTG Pactual" },
  { ticker: "SMTO3", name: "Sao Martinho" },
  { ticker: "POMO4", name: "Marcopolo" },
  { ticker: "CMIN3", name: "CSN Mineracao" },
  { ticker: "RECV3", name: "PetroReconcavo" },
  { ticker: "COGN3", name: "Cogna Educacao" },
  { ticker: "YDUQ3", name: "Yduqs Participacoes" },
  { ticker: "MULT3", name: "Multiplan" },
  { ticker: "IGTI11", name: "Iguatemi" },
  { ticker: "TEND3", name: "Construtora Tenda" },
  { ticker: "DIRR3", name: "Direcional Engenharia" }
];

function getDefaultApiBaseUrl() {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  return isLocal ? "http://localhost:3333" : "";
}

let _renderPending = false;

function isUserTyping() {
  const el = document.activeElement;
  return !!el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

const state = {
  portfolio: [],
  watchlist: [],
  alerts: [],
  settings: {
    apiBaseUrl: getDefaultApiBaseUrl(),
    autoRefreshMs: 60000,
    backendTop10Endpoint: "/api/market/top10-analysts",
    backendAnalystEndpoint: "/api/market/analyst",
    localModeAnalystMessage: "dados de analistas indisponiveis no modo local"
  },
  trailingHighs: {},
  quoteCache: new Map(),
  historicalCache: new Map(),
  analystCache: new Map(),
  marketSearchCache: new Map(),
  top10: [],
  top10Message: "",
  activeTab: "portfolio",
  refreshTimer: null,
  isUpdating: false,
  lastUpdatedAt: null
};

const dom = {
  app: document.getElementById("app")
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeTicker(ticker) {
  return String(ticker || "").trim().toUpperCase().replace(/\.SA$/, "");
}

function toYahooTicker(ticker) {
  const clean = normalizeTicker(ticker);
  return clean.endsWith(".SA") ? clean : `${clean}.SA`;
}

function parseJsonSafe(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function savePortfolio() {
  const serialized = JSON.stringify(state.portfolio);
  localStorage.setItem(STORAGE_KEYS.portfolio, serialized);
  localStorage.setItem(STORAGE_KEYS.portfolioBackup, serialized);
}

function loadPortfolio() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.portfolio) || "[]", []);
  const main = Array.isArray(parsed) ? parsed : [];

  if (main.length > 0) {
    state.portfolio = main;
    return;
  }

  const backup = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.portfolioBackup) || "[]", []);
  state.portfolio = Array.isArray(backup) ? backup : [];
}

function saveWatchlist() {
  localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(state.watchlist));
}

function loadWatchlist() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.watchlist) || "[]", []);
  state.watchlist = Array.isArray(parsed) ? parsed : [];
}

function saveAlerts() {
  localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(state.alerts));
}

function loadAlerts() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.alerts) || "[]", []);
  state.alerts = Array.isArray(parsed) ? parsed : [];
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function loadSettings() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.settings) || "{}", {});
  state.settings = {
    ...state.settings,
    ...parsed
  };
}

function saveTrailingHighs() {
  localStorage.setItem(STORAGE_KEYS.trailingHighs, JSON.stringify(state.trailingHighs));
}

function loadTrailingHighs() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.trailingHighs) || "{}", {});
  state.trailingHighs = parsed && typeof parsed === "object" ? parsed : {};
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function fmtCurrency(value) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  }).format(value);
}

function fmtNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function fmtPct(value) {
  if (!Number.isFinite(value)) return "-";
  const text = `${fmtNumber(value, 2)}%`;
  return value > 0 ? `+${text}` : text;
}

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(d);
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function debounce(fn, delayMs) {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

function createAppLayout() {
  dom.app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div>
          <h1 class="brand-title">B3 Monitor - Compra/Venda</h1>
          <p class="brand-subtitle">Carteira pessoal, recomendacoes e alertas de venda</p>
        </div>
        <div class="status-line" id="statusLine">Pronto para atualizar dados</div>
      </header>

      <section class="cards" id="summaryCards"></section>

      <nav class="tabs">
        <button class="tab-btn active" data-tab="portfolio">Minha Carteira</button>
        <button class="tab-btn" data-tab="top10">Top 10 Analistas</button>
        <button class="tab-btn" data-tab="alerts">Alertas</button>
        <button class="tab-btn" data-tab="watchlist">Watchlist</button>
        <button class="tab-btn" data-tab="settings">Configuracoes</button>
      </nav>

      <section class="panel active" id="panel-portfolio"></section>
      <section class="panel" id="panel-top10"></section>
      <section class="panel" id="panel-alerts"></section>
      <section class="panel" id="panel-watchlist"></section>
      <section class="panel" id="panel-settings"></section>
    </div>
  `;
}

function calculateSMA(data, period) {
  if (!Array.isArray(data) || data.length < period) return null;
  const closes = data.slice(-period).map((point) => toNumber(point.close));
  if (closes.some((x) => !Number.isFinite(x))) return null;
  const sum = closes.reduce((acc, n) => acc + n, 0);
  return sum / period;
}

function calculateRSI(data, period = 14) {
  if (!Array.isArray(data) || data.length <= period) return null;
  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i += 1) {
    const prev = toNumber(data[i - 1]?.close);
    const curr = toNumber(data[i]?.close);
    const change = curr - prev;
    if (change > 0) gains += change;
    if (change < 0) losses += Math.abs(change);
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function calculatePnL(asset, currentPrice) {
  const invested = toNumber(asset.quantity) * toNumber(asset.avgPrice);
  const current = toNumber(asset.quantity) * toNumber(currentPrice);
  const pnl = current - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  return { invested, current, pnl, pnlPct };
}

function calculateUpside(currentPrice, targetPrice) {
  const c = toNumber(currentPrice);
  const t = toNumber(targetPrice);
  if (c <= 0 || !Number.isFinite(t) || t <= 0) return null;
  return ((t - c) / c) * 100;
}

function checkBuyMoreSignal(asset, currentPrice) {
  const buyMorePrice = toNumber(asset.buyMorePrice);
  if (buyMorePrice <= 0 || !Number.isFinite(currentPrice)) return false;
  return currentPrice <= buyMorePrice;
}

function checkSellSignals(asset, context) {
  const currentPrice = toNumber(context.currentPrice);
  const signals = [];

  const manualTarget = toNumber(asset.sellTargetPrice);
  if (manualTarget > 0 && currentPrice >= manualTarget) {
    signals.push(SELL_SIGNAL_TYPES.TARGET);
  }

  const ticker = normalizeTicker(asset.ticker);
  const trailingStop = toNumber(asset.trailingStop);
  if (trailingStop > 0 && currentPrice > 0) {
    const prevHigh = toNumber(state.trailingHighs[ticker], currentPrice);
    const newHigh = Math.max(prevHigh, currentPrice);
    state.trailingHighs[ticker] = newHigh;
    const trigger = newHigh * (1 - trailingStop / 100);
    if (currentPrice <= trigger) {
      signals.push(SELL_SIGNAL_TYPES.TRAILING);
    }
  }

  const stopLoss = toNumber(asset.stopLoss);
  if (stopLoss > 0 && currentPrice > 0) {
    const stopPrice = toNumber(asset.avgPrice) * (1 - stopLoss / 100);
    if (currentPrice <= stopPrice) {
      signals.push(SELL_SIGNAL_TYPES.STOP_LOSS);
    }
  }

  if (Number.isFinite(context.sma50) && context.sma50 > 0 && currentPrice < context.sma50) {
    signals.push(SELL_SIGNAL_TYPES.TREND);
  }

  if (Number.isFinite(context.rsi) && context.rsi >= 75) {
    signals.push(SELL_SIGNAL_TYPES.RSI);
  }

  const dayDrop = toNumber(context.dayDropPct, 0);
  const latestVolume = toNumber(context.latestVolume, 0);
  const avgVolume = toNumber(context.avgVolume, 0);
  if (dayDrop <= -3 && avgVolume > 0 && latestVolume >= avgVolume * 1.8) {
    signals.push(SELL_SIGNAL_TYPES.VOLUME_DROP);
  }

  const analystTarget = toNumber(context.analystData?.targetMean, 0);
  if (analystTarget > 0 && currentPrice >= analystTarget * 0.97) {
    signals.push(SELL_SIGNAL_TYPES.ANALYST_NEAR_TARGET);
  }

  return [...new Set(signals)];
}

function classifyAsset(asset, indicators, analystData) {
  const currentPrice = toNumber(indicators.currentPrice);

  if (checkBuyMoreSignal(asset, currentPrice)) {
    return "COMPRAR MAIS";
  }

  const sellSignals = checkSellSignals(asset, {
    currentPrice,
    sma50: indicators.sma50,
    rsi: indicators.rsi,
    dayDropPct: indicators.dayDropPct,
    latestVolume: indicators.latestVolume,
    avgVolume: indicators.avgVolume,
    analystData
  });

  if (
    sellSignals.includes(SELL_SIGNAL_TYPES.TARGET) ||
    sellSignals.includes(SELL_SIGNAL_TYPES.TRAILING) ||
    sellSignals.includes(SELL_SIGNAL_TYPES.STOP_LOSS)
  ) {
    return "VENDER";
  }

  if (sellSignals.includes(SELL_SIGNAL_TYPES.VOLUME_DROP)) {
    return "REDUZIR";
  }

  if (
    sellSignals.includes(SELL_SIGNAL_TYPES.RSI) ||
    sellSignals.includes(SELL_SIGNAL_TYPES.ANALYST_NEAR_TARGET) ||
    sellSignals.includes(SELL_SIGNAL_TYPES.TREND)
  ) {
    return "ATENCAO";
  }

  return "MANTER";
}

function statusBadge(status) {
  const s = String(status || "MANTER");
  if (s === "COMPRAR MAIS") return '<span class="badge buy">COMPRAR MAIS</span>';
  if (s === "ATENCAO") return '<span class="badge warn">ATENCAO</span>';
  if (s === "REDUZIR") return '<span class="badge reduce">REDUZIR</span>';
  if (s === "VENDER") return '<span class="badge sell">VENDER</span>';
  return '<span class="badge hold">MANTER</span>';
}

function recommendationBadge(rec) {
  const r = String(rec || "").toLowerCase().trim();

  if (!r || r.includes("indispon") || r === "-") {
    return '<span class="badge rec-na">-</span>';
  }

  if (r === "strongbuy" || r === "strong buy" || r === "outperform" || r === "overweight" || r === "buy") {
    return '<span class="badge rec-buy">&#9650; COMPRA</span>';
  }

  if (r === "hold" || r === "neutral" || r === "equal weight" || r === "equalweight" || r === "market perform" || r === "marketperform") {
    return '<span class="badge rec-hold">&#9654; MANTER</span>';
  }

  if (r === "underperform" || r === "underweight" || r === "reduce") {
    return '<span class="badge rec-reduce">&#9660; REDUZIR</span>';
  }

  if (r === "strongsell" || r === "strong sell" || r === "sell") {
    return '<span class="badge rec-sell">&#9660; VENDA</span>';
  }

  // Unknown value — show as-is with a neutral badge
  return `<span class="badge rec-hold">${escapeHtml(rec)}</span>`;
}

function alertPriorityBadge(priority) {
  if (priority === "alta") return '<span class="badge high">ALTA</span>';
  if (priority === "media") return '<span class="badge mid">MEDIA</span>';
  return '<span class="badge low">BAIXA</span>';
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function searchMarket(query) {
  const term = String(query || "").trim();
  if (term.length < 2) {
    return [];
  }

  const key = term.toLowerCase();
  const hit = state.marketSearchCache.get(key);
  if (hit && Date.now() - hit.fetchedAt < 120000) {
    return hit.data;
  }

  const base = state.settings.apiBaseUrl.replace(/\/$/, "");
  try {
    const payload = await fetchJson(`${base}/api/market/search?q=${encodeURIComponent(term)}`);
    const results = Array.isArray(payload?.results) ? payload.results : [];
    const normalized = results
      .map((item) => ({
        ticker: normalizeTicker(item.ticker),
        name: String(item.name || "").trim()
      }))
      .filter((item) => item.ticker && item.name)
      .slice(0, 12);

    state.marketSearchCache.set(key, {
      fetchedAt: Date.now(),
      data: normalized
    });

    return normalized;
  } catch {
    return [];
  }
}

function attachStockAutocomplete(form, { nameFieldName = "name", tickerFieldName = "ticker" } = {}) {
  if (!form) return;

  const nameInput = form.querySelector(`input[name="${nameFieldName}"]`);
  const tickerInput = form.querySelector(`input[name="${tickerFieldName}"]`);
  if (!nameInput || !tickerInput) return;

  // Remove datalist remnants
  nameInput.removeAttribute("list");
  tickerInput.removeAttribute("list");
  nameInput.setAttribute("autocomplete", "off");
  tickerInput.setAttribute("autocomplete", "off");

  // Wrap name input for positioning dropdown
  let wrap = nameInput.parentElement;
  if (!wrap.classList.contains("autocomplete-wrap")) {
    const div = document.createElement("div");
    div.className = "autocomplete-wrap";
    nameInput.parentNode.insertBefore(div, nameInput);
    div.appendChild(nameInput);
    wrap = div;
  }

  // Remove previous dropdown if re-attaching
  const prev = wrap.querySelector(".autocomplete-dropdown");
  if (prev) prev.remove();

  const dropdown = document.createElement("ul");
  dropdown.className = "autocomplete-dropdown";
  wrap.appendChild(dropdown);

  let suggestions = [];
  let activeIndex = -1;

  const closeDrop = () => {
    dropdown.style.display = "none";
    activeIndex = -1;
  };

  const renderList = (items) => {
    if (!items.length) {
      closeDrop();
      return;
    }
    dropdown.innerHTML = items
      .map(
        (item, i) =>
          `<li class="autocomplete-item" data-index="${i}">
            <span class="ac-ticker">${escapeHtml(item.ticker)}</span>
            <span class="ac-name">${escapeHtml(item.name)}</span>
          </li>`
      )
      .join("");
    dropdown.style.display = "block";
  };

  const selectItem = (item) => {
    nameInput.value = item.name;
    tickerInput.value = item.ticker;
    closeDrop();
  };

  const filterFallback = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return B3_FALLBACK.filter(
      (item) =>
        item.ticker.toLowerCase().startsWith(q) ||
        item.ticker.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    ).slice(0, 10);
  };

  const searchAndRender = debounce(async (value) => {
    const term = value.trim();
    if (term.length < 2) {
      closeDrop();
      return;
    }

    // Show local fallback immediately
    const fallback = filterFallback(term);
    if (fallback.length) {
      suggestions = fallback;
      renderList(fallback);
    }

    // Then try backend and replace if got results
    const fresh = await searchMarket(term);
    if (fresh.length) {
      suggestions = fresh;
      renderList(fresh);
    }
  }, 260);

  nameInput.addEventListener("input", () => {
    activeIndex = -1;
    searchAndRender(nameInput.value);
  });

  nameInput.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll(".autocomplete-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((li, i) => li.classList.toggle("active", i === activeIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((li, i) => li.classList.toggle("active", i === activeIndex));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[activeIndex];
      if (selected) selectItem(selected);
    } else if (e.key === "Escape") {
      closeDrop();
    }
  });

  // mousedown prevents blur before click fires
  dropdown.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const li = e.target.closest(".autocomplete-item");
    if (!li) return;
    const idx = Number(li.dataset.index);
    const selected = suggestions[idx];
    if (selected) selectItem(selected);
  });

  nameInput.addEventListener("blur", () => {
    setTimeout(closeDrop, 150);
  });
}

async function fetchStockPrice(ticker) {
  const cleanTicker = normalizeTicker(ticker);
  const cache = state.quoteCache.get(cleanTicker);
  if (cache && Date.now() - cache.fetchedAt < 20000) {
    return cache.data;
  }

  const base = state.settings.apiBaseUrl.replace(/\/$/, "");

  try {
    const payload = await fetchJson(`${base}/api/market/quote/${encodeURIComponent(cleanTicker)}`);
    const data = {
      ticker: cleanTicker,
      name: payload?.quote?.name || cleanTicker,
      price: toNumber(payload?.quote?.regularMarketPrice, NaN),
      variationPct: toNumber(payload?.quote?.regularMarketChangePercent, 0),
      source: "backend"
    };
    state.quoteCache.set(cleanTicker, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    // fallback below
  }

  try {
    const payload = await fetchJson(`https://brapi.dev/api/quote/${encodeURIComponent(cleanTicker)}`);
    const item = Array.isArray(payload?.results) ? payload.results[0] : null;
    if (!item) throw new Error("sem cotacao");

    const data = {
      ticker: cleanTicker,
      name: item.longName || item.shortName || cleanTicker,
      price: toNumber(item.regularMarketPrice, NaN),
      variationPct: toNumber(item.regularMarketChangePercent, 0),
      source: "brapi"
    };
    state.quoteCache.set(cleanTicker, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return {
      ticker: cleanTicker,
      name: cleanTicker,
      price: NaN,
      variationPct: 0,
      source: "unavailable"
    };
  }
}

async function fetchHistoricalData(ticker) {
  const cleanTicker = normalizeTicker(ticker);
  const cache = state.historicalCache.get(cleanTicker);
  if (cache && Date.now() - cache.fetchedAt < 120000) {
    return cache.data;
  }

  const base = state.settings.apiBaseUrl.replace(/\/$/, "");

  try {
    const backend = await fetchJson(`${base}/api/market/history/${encodeURIComponent(cleanTicker)}?range=6mo&interval=1d`);
    const prices = Array.isArray(backend?.prices) ? backend.prices : [];
    state.historicalCache.set(cleanTicker, { data: prices, fetchedAt: Date.now() });
    return prices;
  } catch {
    // fallback below
  }

  try {
    const yahooSymbol = toYahooTicker(cleanTicker);
    const chart = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=6mo&interval=1d`);
    const result = chart?.chart?.result?.[0];
    const ts = Array.isArray(result?.timestamp) ? result.timestamp : [];
    const quotes = result?.indicators?.quote?.[0] || {};
    const closes = Array.isArray(quotes.close) ? quotes.close : [];
    const volumes = Array.isArray(quotes.volume) ? quotes.volume : [];

    const prices = ts
      .map((unix, index) => ({
        date: new Date(unix * 1000).toISOString(),
        close: toNumber(closes[index], NaN),
        volume: toNumber(volumes[index], 0)
      }))
      .filter((x) => Number.isFinite(x.close));

    state.historicalCache.set(cleanTicker, { data: prices, fetchedAt: Date.now() });
    return prices;
  } catch {
    return [];
  }
}

async function fetchAnalystData(ticker) {
  const cleanTicker = normalizeTicker(ticker);
  const cache = state.analystCache.get(cleanTicker);
  if (cache && Date.now() - cache.fetchedAt < 240000) {
    return cache.data;
  }

  const base = state.settings.apiBaseUrl.replace(/\/$/, "");

  try {
    const endpoint = `${base}${state.settings.backendAnalystEndpoint}/${encodeURIComponent(cleanTicker)}`;
    const payload = await fetchJson(endpoint);
    const data = {
      ticker: cleanTicker,
      targetMean: toNumber(payload?.targetMean, NaN),
      targetMin: toNumber(payload?.targetMin, NaN),
      targetMax: toNumber(payload?.targetMax, NaN),
      recommendation: payload?.recommendation || "-",
      analystsCount: toNumber(payload?.analystsCount, 0),
      available: true,
      source: "backend"
    };
    state.analystCache.set(cleanTicker, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    // fallback below
  }

  try {
    const summary = await fetchJson(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(toYahooTicker(cleanTicker))}?modules=financialData,recommendationTrend`
    );

    const result = summary?.quoteSummary?.result?.[0] || {};
    const financialData = result.financialData || {};
    const recommendationTrend = result.recommendationTrend?.trend?.[0] || {};
    const buy = toNumber(recommendationTrend.strongBuy, 0) + toNumber(recommendationTrend.buy, 0);
    const hold = toNumber(recommendationTrend.hold, 0);
    const sell = toNumber(recommendationTrend.sell, 0) + toNumber(recommendationTrend.strongSell, 0);

    let recommendation = "hold";
    if (buy > hold && buy > sell) recommendation = "buy";
    if (sell > buy && sell > hold) recommendation = "sell";

    const data = {
      ticker: cleanTicker,
      targetMean: toNumber(financialData.targetMeanPrice?.raw, NaN),
      targetMin: toNumber(financialData.targetLowPrice?.raw, NaN),
      targetMax: toNumber(financialData.targetHighPrice?.raw, NaN),
      recommendation,
      analystsCount: toNumber(financialData.numberOfAnalystOpinions?.raw, 0),
      available: true,
      source: "yahoo-summary"
    };

    if (!Number.isFinite(data.targetMean) && !Number.isFinite(data.targetMin) && !Number.isFinite(data.targetMax)) {
      throw new Error("analyst unavailable");
    }

    state.analystCache.set(cleanTicker, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    const unavailable = {
      ticker: cleanTicker,
      targetMean: NaN,
      targetMin: NaN,
      targetMax: NaN,
      recommendation: state.settings.localModeAnalystMessage,
      analystsCount: 0,
      available: false,
      source: "unavailable"
    };
    state.analystCache.set(cleanTicker, { data: unavailable, fetchedAt: Date.now() });
    return unavailable;
  }
}

async function fetchTop10Analysts() {
  const base = state.settings.apiBaseUrl.replace(/\/$/, "");

  try {
    const endpoint = `${base}${state.settings.backendTop10Endpoint}`;
    const payload = await fetchJson(endpoint);
    const list = Array.isArray(payload?.items) ? payload.items.slice(0, 10) : [];

    state.top10 = list.map((item, index) => ({
      rank: index + 1,
      ticker: normalizeTicker(item.ticker),
      company: item.company || normalizeTicker(item.ticker),
      currentPrice: toNumber(item.currentPrice, NaN),
      targetMean: toNumber(item.targetMean, NaN),
      targetMax: toNumber(item.targetMax, NaN),
      recommendation: item.recommendation || "-",
      analystsCount: toNumber(item.analystsCount, 0)
    }));

    state.top10Message = "";
    return;
  } catch {
    state.top10 = [];
    state.top10Message = "Top 10 de analistas indisponivel no modo local. Estrutura pronta para backend/API.";
  }
}

function addAlert({ ticker, type, message, priority = "media" }) {
  const now = Date.now();
  const lastSimilar = state.alerts.find(
    (alert) =>
      !alert.read &&
      alert.ticker === ticker &&
      alert.type === type &&
      now - new Date(alert.createdAt).getTime() < 30 * 60 * 1000
  );

  if (lastSimilar) return;

  state.alerts.unshift({
    id: uid(),
    ticker,
    type,
    message,
    priority,
    createdAt: new Date().toISOString(),
    read: false
  });

  if (state.alerts.length > 250) {
    state.alerts = state.alerts.slice(0, 250);
  }

  saveAlerts();
}

function updateStatusLine() {
  const line = document.getElementById("statusLine");
  if (!line) return;

  if (state.isUpdating) {
    line.textContent = "Atualizando dados de mercado...";
    return;
  }

  if (!state.lastUpdatedAt) {
    line.textContent = "Aguardando primeira atualizacao";
    return;
  }

  line.textContent = `Ultima atualizacao: ${fmtDate(state.lastUpdatedAt)} | refresh ${Math.round(state.settings.autoRefreshMs / 1000)}s`;
}

async function updateAllData() {
  if (state.isUpdating) return;
  state.isUpdating = true;
  updateStatusLine();

  try {
    await fetchTop10Analysts();

    const tickers = new Set();
    for (const a of state.portfolio) tickers.add(normalizeTicker(a.ticker));
    for (const w of state.watchlist) tickers.add(normalizeTicker(w.ticker));
    for (const t of state.top10) tickers.add(normalizeTicker(t.ticker));
    for (const al of state.alerts) tickers.add(normalizeTicker(al.ticker));

    const jobs = [...tickers].filter(Boolean).map(async (ticker) => {
      const [quote, historical, analyst] = await Promise.all([
        fetchStockPrice(ticker),
        fetchHistoricalData(ticker),
        fetchAnalystData(ticker)
      ]);

      const sma50 = calculateSMA(historical, 50);
      const rsi = calculateRSI(historical, 14);

      const len = historical.length;
      const latestClose = len > 0 ? toNumber(historical[len - 1].close, NaN) : NaN;
      const prevClose = len > 1 ? toNumber(historical[len - 2].close, NaN) : NaN;
      const dayDropPct = Number.isFinite(latestClose) && Number.isFinite(prevClose) && prevClose > 0
        ? ((latestClose - prevClose) / prevClose) * 100
        : 0;

      const latestVolume = len > 0 ? toNumber(historical[len - 1].volume, 0) : 0;
      const avgVolume = len > 10
        ? historical.slice(-10).reduce((acc, item) => acc + toNumber(item.volume, 0), 0) / 10
        : 0;

      const inPortfolio = state.portfolio.find((item) => normalizeTicker(item.ticker) === ticker);
      if (inPortfolio) {
        const buySignal = checkBuyMoreSignal(inPortfolio, quote.price);
        if (buySignal) {
          addAlert({
            ticker,
            type: "recompra atingida",
            message: `${ticker} atingiu sua faixa de recompra`,
            priority: "media"
          });
        }

        const sellSignals = checkSellSignals(inPortfolio, {
          currentPrice: quote.price,
          sma50,
          rsi,
          dayDropPct,
          latestVolume,
          avgVolume,
          analystData: analyst
        });

        for (const signal of sellSignals) {
          const highPriority = signal === SELL_SIGNAL_TYPES.TRAILING || signal === SELL_SIGNAL_TYPES.STOP_LOSS;
          addAlert({
            ticker,
            type: signal,
            message: `${ticker}: ${signal}`,
            priority: highPriority ? "alta" : "media"
          });
        }
      }
    });

    await Promise.allSettled(jobs);
    saveTrailingHighs();
    state.lastUpdatedAt = new Date().toISOString();
  } finally {
    state.isUpdating = false;
    updateStatusLine();
    render();
  }
}

function getComputedPortfolioRows() {
  return state.portfolio.map((asset) => {
    const ticker = normalizeTicker(asset.ticker);
    const quote = state.quoteCache.get(ticker)?.data || {};
    const historical = state.historicalCache.get(ticker)?.data || [];
    const analyst = state.analystCache.get(ticker)?.data || {
      targetMean: NaN,
      recommendation: state.settings.localModeAnalystMessage,
      available: false,
      analystsCount: 0
    };

    const currentPrice = toNumber(quote.price, NaN);
    const pnl = calculatePnL(asset, currentPrice);
    const sma50 = calculateSMA(historical, 50);
    const rsi = calculateRSI(historical, 14);
    const latestVolume = historical.length ? toNumber(historical[historical.length - 1].volume) : 0;
    const avgVolume = historical.length > 10
      ? historical.slice(-10).reduce((acc, x) => acc + toNumber(x.volume), 0) / 10
      : 0;
    const dayDropPct = historical.length > 1
      ? ((toNumber(historical[historical.length - 1].close) - toNumber(historical[historical.length - 2].close)) /
          toNumber(historical[historical.length - 2].close, 1)) * 100
      : 0;

    const status = classifyAsset(asset, {
      currentPrice,
      sma50,
      rsi,
      latestVolume,
      avgVolume,
      dayDropPct
    }, analyst);

    const upsidePct = calculateUpside(currentPrice, toNumber(analyst.targetMean, NaN));

    let technicalSellPrice = NaN;
    const options = [];

    const manualTarget = toNumber(asset.sellTargetPrice);
    if (manualTarget > 0) options.push(manualTarget);

    const trailingStop = toNumber(asset.trailingStop);
    const high = toNumber(state.trailingHighs[ticker], NaN);
    if (trailingStop > 0 && Number.isFinite(high) && high > 0) {
      options.push(high * (1 - trailingStop / 100));
    }

    const stopLoss = toNumber(asset.stopLoss);
    if (stopLoss > 0) {
      options.push(toNumber(asset.avgPrice) * (1 - stopLoss / 100));
    }

    if (Number.isFinite(sma50) && sma50 > 0) {
      options.push(sma50);
    }

    if (options.length) {
      technicalSellPrice = Math.max(...options.filter((x) => Number.isFinite(x)));
    }

    return {
      asset,
      quote,
      analyst,
      currentPrice,
      investedValue: pnl.invested,
      currentValue: pnl.current,
      pnlPct: pnl.pnlPct,
      upsidePct,
      technicalSellPrice,
      status
    };
  });
}

function getSummaryStats(rows) {
  const invested = rows.reduce((acc, row) => acc + row.investedValue, 0);
  const current = rows.reduce((acc, row) => acc + row.currentValue, 0);
  const pnl = current - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  const activeAlerts = state.alerts.filter((a) => !a.read).length;

  return {
    invested,
    current,
    pnl,
    pnlPct,
    assets: rows.length,
    activeAlerts,
    top10Count: state.top10.length
  };
}

function renderSummaryCards(rows) {
  const stats = getSummaryStats(rows);
  const container = document.getElementById("summaryCards");
  if (!container) return;

  container.innerHTML = `
    <article class="card">
      <div class="card-label">Valor Total Investido</div>
      <div class="card-value">${fmtCurrency(stats.invested)}</div>
    </article>
    <article class="card">
      <div class="card-label">Valor Atual</div>
      <div class="card-value">${fmtCurrency(stats.current)}</div>
    </article>
    <article class="card">
      <div class="card-label">Lucro/Prejuizo Total</div>
      <div class="card-value ${stats.pnl >= 0 ? "positive" : "negative"}">
        ${fmtCurrency(stats.pnl)} (${fmtPct(stats.pnlPct)})
      </div>
    </article>
    <article class="card">
      <div class="card-label">Qtd de Ativos</div>
      <div class="card-value">${stats.assets}</div>
    </article>
    <article class="card">
      <div class="card-label">Alertas Ativos</div>
      <div class="card-value">${stats.activeAlerts}</div>
    </article>
    <article class="card">
      <div class="card-label">Acoes no Top 10</div>
      <div class="card-value">${stats.top10Count}</div>
    </article>
  `;
}

function renderPortfolioPanel(rows) {
  const panel = document.getElementById("panel-portfolio");
  if (!panel) return;

  const rowsHtml = rows
    .map((row) => {
      const ticker = normalizeTicker(row.asset.ticker);
      const analystRec = row.analyst.available ? row.analyst.recommendation : "";

      return `
        <tr>
          <td class="mono">${escapeHtml(ticker)}</td>
          <td>${escapeHtml(row.asset.name || row.quote.name || ticker)}</td>
          <td>${fmtNumber(toNumber(row.asset.quantity), 0)}</td>
          <td>${fmtCurrency(toNumber(row.asset.avgPrice))}</td>
          <td>${fmtCurrency(row.currentPrice)}</td>
          <td>${fmtCurrency(row.investedValue)}</td>
          <td>${fmtCurrency(row.currentValue)}</td>
          <td class="${row.pnlPct >= 0 ? "positive" : "negative"}">${fmtPct(row.pnlPct)}</td>
          <td>${fmtCurrency(toNumber(row.asset.buyMorePrice, NaN))}</td>
          <td>${fmtCurrency(toNumber(row.analyst.targetMean, NaN))}</td>
          <td>${fmtCurrency(toNumber(row.analyst.targetMax, NaN))}</td>
          <td>${recommendationBadge(analystRec)}</td>
          <td class="${toNumber(row.upsidePct, 0) >= 0 ? "positive" : "negative"}">${fmtPct(row.upsidePct)}</td>
          <td>${fmtCurrency(row.technicalSellPrice)}</td>
          <td>${statusBadge(row.status)}</td>
          <td><button data-action="details-asset" data-id="${row.asset.id}">Detalhes</button></td>
          <td><button data-action="edit-asset" data-id="${row.asset.id}">Editar</button></td>
          <td><button class="danger" data-action="remove-asset" data-id="${row.asset.id}">Remover</button></td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Minha Carteira</h2>
    <form id="portfolioForm">
      <input type="hidden" name="id" />
      <div class="form-grid">
        <div class="field">
          <label>Ticker</label>
          <input name="ticker" required placeholder="PETR4" maxlength="12" />
        </div>
        <div class="field">
          <label>Nome</label>
          <input name="name" required placeholder="Petrobras" />
        </div>
        <div class="field">
          <label>Quantidade</label>
          <input name="quantity" type="number" min="1" step="1" required />
        </div>
        <div class="field">
          <label>Preco medio</label>
          <input name="avgPrice" type="number" min="0" step="0.01" required />
        </div>
        <div class="field">
          <label>Preco para comprar mais</label>
          <input name="buyMorePrice" type="number" min="0" step="0.01" required />
        </div>
        <div class="field">
          <label>Preco de venda desejado (opcional)</label>
          <input name="sellTargetPrice" type="number" min="0" step="0.01" />
        </div>
        <div class="field">
          <label>Trailing stop % (opcional)</label>
          <input name="trailingStop" type="number" min="0" step="0.1" />
        </div>
        <div class="field">
          <label>Stop loss % (opcional)</label>
          <input name="stopLoss" type="number" min="0" step="0.1" />
        </div>
        <div class="field span-4">
          <label>Observacoes</label>
          <textarea name="notes" placeholder="Contexto da sua estrategia"></textarea>
        </div>
      </div>
      <div class="actions">
        <button class="primary" type="submit">Salvar ativo</button>
        <button type="button" id="btnPortfolioClear">Limpar</button>
        <button type="button" id="btnUpdateNow">Atualizar agora</button>
      </div>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Empresa</th>
            <th>Quantidade</th>
            <th>Preco medio</th>
            <th>Preco atual</th>
            <th>Valor investido</th>
            <th>Valor atual</th>
            <th>Lucro/Prejuizo %</th>
            <th>Preco comprar mais</th>
            <th>Preco-alvo analistas</th>
            <th>Alvo maximo analistas</th>
            <th>Recomendacao media</th>
            <th>Upside ate alvo %</th>
            <th>Preco tecnico venda</th>
            <th>Status</th>
            <th>Detalhes</th>
            <th>Editar</th>
            <th>Remover</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="18" class="empty">Nenhum ativo cadastrado.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderTop10Panel() {
  const panel = document.getElementById("panel-top10");
  if (!panel) return;

  const rowsHtml = state.top10
    .map((item) => {
      const upside = calculateUpside(item.currentPrice, item.targetMean);
      return `
        <tr>
          <td>${item.rank}</td>
          <td class="mono">${escapeHtml(item.ticker)}</td>
          <td>${escapeHtml(item.company)}</td>
          <td>${fmtCurrency(item.currentPrice)}</td>
          <td>${fmtCurrency(item.targetMean)}</td>
          <td>${fmtCurrency(toNumber(item.targetMax, NaN))}</td>
          <td class="${toNumber(upside, 0) >= 0 ? "positive" : "negative"}">${fmtPct(upside)}</td>
          <td>${recommendationBadge(item.recommendation)}</td>
          <td>${fmtNumber(item.analystsCount, 0)}</td>
          <td><button data-action="add-top10-watchlist" data-ticker="${item.ticker}">Adicionar</button></td>
          <td><button class="primary" data-action="add-top10-portfolio" data-ticker="${item.ticker}">Adicionar</button></td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Top 10 Analistas</h2>
    <div class="toolbar">
      <div class="toolbar-note">Fonte: consenso de analistas via camada de servico (backend/API).</div>
      <button id="btnRefreshTop10">Recarregar Top 10</button>
    </div>

    ${state.top10Message ? `<p class="alert-empty">${escapeHtml(state.top10Message)}</p>` : ""}

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Ticker</th>
            <th>Empresa</th>
            <th>Preco atual</th>
            <th>Preco-alvo medio</th>
            <th>Alvo maximo</th>
            <th>Upside %</th>
            <th>Recomendacao media</th>
            <th>Numero analistas</th>
            <th>Adicionar a watchlist</th>
            <th>Adicionar a carteira</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="11" class="empty">Nenhum dado de top 10 no momento.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function alertOrientationBadge(alertType, analyst) {
  const t = String(alertType || "").toLowerCase();

  // Sell signals → always show VENDER
  if (
    t === SELL_SIGNAL_TYPES.TARGET.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.TRAILING.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.STOP_LOSS.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.VOLUME_DROP.toLowerCase()
  ) {
    return '<span class="badge sell">&#9660; VENDER</span>';
  }

  // Buy-more signal → always show COMPRAR MAIS
  if (t === "recompra atingida") {
    return '<span class="badge buy">&#9650; COMPRAR MAIS</span>';
  }

  // For technical warning signals, defer to analyst
  if (analyst?.available) {
    return recommendationBadge(analyst.recommendation);
  }

  // Attention signals without analyst data
  if (
    t === SELL_SIGNAL_TYPES.RSI.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.TREND.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.ANALYST_NEAR_TARGET.toLowerCase()
  ) {
    return '<span class="badge warn">&#9654; ATENCAO</span>';
  }

  return '<span class="badge hold">&#9654; MANTER</span>';
}

function renderAlertsPanel() {
  const panel = document.getElementById("panel-alerts");
  if (!panel) return;

  const unread = state.alerts.filter((a) => !a.read).length;

  const rowsHtml = state.alerts
    .map((alert) => {
      const ticker = normalizeTicker(alert.ticker);
      const quote = state.quoteCache.get(ticker)?.data || {};
      const analyst = state.analystCache.get(ticker)?.data || null;
      const asset = state.portfolio.find((a) => normalizeTicker(a.ticker) === ticker);

      const currentPrice = toNumber(quote.price, NaN);
      const targetMean = toNumber(analyst?.targetMean, NaN);
      const targetMax = toNumber(analyst?.targetMax, NaN);
      const upside = calculateUpside(currentPrice, targetMean);
      const recBadge = alertOrientationBadge(alert.type, analyst);
      const analystCount = analyst?.available ? toNumber(analyst.analystsCount, 0) : 0;
      const rowClass = alert.read ? "alert-row read" : "alert-row unread";

      return `
        <tr class="${rowClass}">
          <td class="mono">${escapeHtml(ticker)}</td>
          <td>${alertPriorityBadge(alert.priority)}</td>
          <td>${escapeHtml(alert.type)}</td>
          <td>${escapeHtml(alert.message)}</td>
          <td>${fmtCurrency(currentPrice)}</td>
          <td>${Number.isFinite(targetMean) ? fmtCurrency(targetMean) : "-"}</td>
          <td>${Number.isFinite(targetMax) ? fmtCurrency(targetMax) : "-"}</td>
          <td class="${toNumber(upside, 0) >= 0 ? "positive" : "negative"}">${fmtPct(upside)}</td>
          <td>${recBadge}</td>
          <td>${analystCount > 0 ? analystCount + " analistas" : "-"}</td>
          <td>${asset ? fmtCurrency(toNumber(asset.buyMorePrice, NaN)) : "-"}</td>
          <td>${fmtDate(alert.createdAt)}</td>
          <td>${alert.read ? '<span class="muted-text">Lido</span>' : '<button data-action="mark-alert-read" data-id="' + alert.id + '">Marcar como lido</button>'}</td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Alertas ${unread > 0 ? `<span class="badge high" style="font-size:0.78rem;vertical-align:middle">${unread} nao lidos</span>` : ""}</h2>
    <form id="addAlertForm">
      <div class="form-grid">
        <div class="field">
          <label>Buscar por nome</label>
          <input name="name" placeholder="Ex: Petrobras (opcional)" autocomplete="off" />
        </div>
        <div class="field">
          <label>Ticker <span style="color:var(--accent)">(obrigatorio)</span></label>
          <input name="ticker" required placeholder="Ex: PETR4" maxlength="12" style="text-transform:uppercase" autocomplete="off" />
        </div>
        <div class="field">
          <label>Tipo</label>
          <select name="type">
            <option value="alerta manual">Alerta manual</option>
            <option value="monitorar">Monitorar</option>
            <option value="recompra atingida">Recompra atingida</option>
            <option value="stop loss">Stop loss</option>
            <option value="alvo atingido">Alvo atingido</option>
          </select>
        </div>
        <div class="field">
          <label>Mensagem / Observacao</label>
          <input name="message" placeholder="Ex: acompanhar suporte em 30.00" />
        </div>
        <div class="field">
          <label>Prioridade</label>
          <select name="priority">
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>
      <div class="actions">
        <button class="primary" type="submit">+ Adicionar alerta</button>
        <button type="button" id="btnClearAlertForm">Limpar</button>
      </div>
    </form>
    <div class="actions" style="margin-top:8px">
      <button id="btnMarkAllRead">Marcar todos como lidos</button>
      <button class="danger" id="btnClearAlerts">Limpar historico</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Prioridade</th>
            <th>Tipo</th>
            <th>Mensagem</th>
            <th>Preco atual</th>
            <th>Alvo analistas</th>
            <th>Alvo maximo</th>
            <th>Upside %</th>
            <th>Orientacao</th>
            <th>Cobertura</th>
            <th>Preco comprar mais</th>
            <th>Data e hora</th>
            <th>Acao</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="13" class="empty">Nenhum alerta gerado.</td></tr>'}
        </tbody>
      </table>
    </div>
    <p class="toolbar-note" style="margin-top:10px">
      A orientacao combina o sinal tecnico do alerta com o consenso dos analistas quando disponivel.
      Dados de analistas requerem backend ativo em <code>${escapeHtml(state.settings.apiBaseUrl)}</code>.
    </p>
  `;
}

function renderWatchlistPanel() {
  const panel = document.getElementById("panel-watchlist");
  if (!panel) return;

  const rowsHtml = state.watchlist
    .map((item) => {
      const ticker = normalizeTicker(item.ticker);
      const quote = state.quoteCache.get(ticker)?.data || {};
      const analyst = state.analystCache.get(ticker)?.data || {};
      return `
        <tr>
          <td class="mono">${escapeHtml(ticker)}</td>
          <td>${escapeHtml(item.name || quote.name || ticker)}</td>
          <td>${fmtCurrency(toNumber(quote.price, NaN))}</td>
          <td>${fmtCurrency(toNumber(item.buyDesiredPrice, NaN))}</td>
          <td>${fmtCurrency(toNumber(analyst.targetMean, NaN))}</td>
          <td>${fmtCurrency(toNumber(analyst.targetMax, NaN))}</td>
          <td>${recommendationBadge(analyst.recommendation || "")}</td>
          <td>${escapeHtml(item.notes || "-")}</td>
          <td><button class="danger" data-action="remove-watch" data-id="${item.id}">Remover</button></td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Watchlist</h2>

    <form id="watchlistForm">
      <div class="form-grid">
        <div class="field">
          <label>Ticker</label>
          <input name="ticker" required placeholder="VALE3" maxlength="12" />
        </div>
        <div class="field">
          <label>Nome</label>
          <input name="name" required placeholder="Vale" />
        </div>
        <div class="field">
          <label>Preco compra desejado</label>
          <input name="buyDesiredPrice" type="number" min="0" step="0.01" required />
        </div>
        <div class="field span-2">
          <label>Observacao</label>
          <input name="notes" placeholder="Ponto de interesse" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" type="submit">Adicionar watchlist</button>
      </div>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Nome</th>
            <th>Preco atual</th>
            <th>Preco compra desejado</th>
            <th>Preco-alvo analistas</th>
            <th>Alvo maximo analistas</th>
            <th>Recomendacao</th>
            <th>Observacao</th>
            <th>Remover</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" class="empty">Nenhum item na watchlist.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderSettingsPanel() {
  const panel = document.getElementById("panel-settings");
  if (!panel) return;

  panel.innerHTML = `
    <h2 class="panel-title">Configuracoes</h2>
    <p class="toolbar-note">
      A camada de dados esta pronta para backend/API premium. Se endpoints de analistas nao estiverem disponiveis,
      a aplicacao continua funcionando sem quebrar.
    </p>

    <form id="settingsForm">
      <div class="form-grid">
        <div class="field span-2">
          <label>URL base backend/API</label>
          <input name="apiBaseUrl" required value="${escapeHtml(state.settings.apiBaseUrl)}" />
        </div>
        <div class="field">
          <label>Refresh automatico (ms)</label>
          <input name="autoRefreshMs" type="number" min="10000" step="1000" value="${toNumber(state.settings.autoRefreshMs, 60000)}" />
        </div>
        <div class="field span-2">
          <label>Endpoint Top 10 analistas</label>
          <input name="backendTop10Endpoint" value="${escapeHtml(state.settings.backendTop10Endpoint)}" />
        </div>
        <div class="field span-2">
          <label>Endpoint analistas por ticker</label>
          <input name="backendAnalystEndpoint" value="${escapeHtml(state.settings.backendAnalystEndpoint)}" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" type="submit">Salvar configuracoes</button>
      </div>
    </form>
  `;
}

function render() {
  if (isUserTyping()) {
    _renderPending = true;
    return;
  }
  _renderPending = false;
  const rows = getComputedPortfolioRows();
  renderSummaryCards(rows);
  renderPortfolioPanel(rows);
  renderTop10Panel();
  renderAlertsPanel();
  renderWatchlistPanel();
  renderSettingsPanel();
  renderActiveTab();
  bindEvents();
}

function renderActiveTab() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
  });

  const map = {
    portfolio: "panel-portfolio",
    top10: "panel-top10",
    alerts: "panel-alerts",
    watchlist: "panel-watchlist",
    settings: "panel-settings"
  };

  Object.entries(map).forEach(([tab, panelId]) => {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.toggle("active", tab === state.activeTab);
  });
}

function bindEvents() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => {
      state.activeTab = btn.dataset.tab || "portfolio";
      renderActiveTab();
    };
  });

  const portfolioForm = document.getElementById("portfolioForm");
  if (portfolioForm) {
    attachStockAutocomplete(portfolioForm, {
      nameFieldName: "name",
      tickerFieldName: "ticker"
    });

    portfolioForm.onsubmit = async (event) => {
      event.preventDefault();
      const fd = new FormData(portfolioForm);
      const id = String(fd.get("id") || "").trim();
      const ticker = normalizeTicker(fd.get("ticker"));
      const asset = {
        id: id || uid(),
        ticker,
        name: String(fd.get("name") || "").trim(),
        quantity: toNumber(fd.get("quantity"), 0),
        avgPrice: toNumber(fd.get("avgPrice"), 0),
        buyMorePrice: toNumber(fd.get("buyMorePrice"), 0),
        sellTargetPrice: toNumber(fd.get("sellTargetPrice"), NaN),
        trailingStop: toNumber(fd.get("trailingStop"), NaN),
        stopLoss: toNumber(fd.get("stopLoss"), NaN),
        notes: String(fd.get("notes") || "").trim(),
        updatedAt: new Date().toISOString()
      };

      if (!asset.ticker || !asset.name || asset.quantity <= 0 || asset.avgPrice <= 0 || asset.buyMorePrice <= 0) {
        window.alert("Preencha ticker, nome, quantidade, preco medio e preco para comprar mais.");
        return;
      }

      const existingIndex = state.portfolio.findIndex((a) => a.id === asset.id);
      if (existingIndex >= 0) {
        state.portfolio[existingIndex] = {
          ...state.portfolio[existingIndex],
          ...asset
        };
      } else {
        state.portfolio.push({
          ...asset,
          createdAt: new Date().toISOString()
        });
      }

      savePortfolio();
      portfolioForm.reset();
      render();
      await updateAllData();
    };
  }

  const btnPortfolioClear = document.getElementById("btnPortfolioClear");
  if (btnPortfolioClear && portfolioForm) {
    btnPortfolioClear.onclick = () => {
      portfolioForm.reset();
      const hidden = portfolioForm.querySelector('input[name="id"]');
      if (hidden) hidden.value = "";
    };
  }

  const btnUpdateNow = document.getElementById("btnUpdateNow");
  if (btnUpdateNow) {
    btnUpdateNow.onclick = () => updateAllData();
  }

  const watchlistForm = document.getElementById("watchlistForm");
  if (watchlistForm) {
    attachStockAutocomplete(watchlistForm, {
      nameFieldName: "name",
      tickerFieldName: "ticker"
    });

    watchlistForm.onsubmit = async (event) => {
      event.preventDefault();
      const fd = new FormData(watchlistForm);
      const ticker = normalizeTicker(fd.get("ticker"));

      if (!ticker) {
        window.alert("Ticker invalido.");
        return;
      }

      const exists = state.watchlist.some((item) => normalizeTicker(item.ticker) === ticker);
      if (exists) {
        window.alert("Ticker ja esta na watchlist.");
        return;
      }

      state.watchlist.push({
        id: uid(),
        ticker,
        name: String(fd.get("name") || "").trim(),
        buyDesiredPrice: toNumber(fd.get("buyDesiredPrice"), NaN),
        notes: String(fd.get("notes") || "").trim(),
        createdAt: new Date().toISOString()
      });

      saveWatchlist();
      watchlistForm.reset();
      render();
      await updateAllData();
    };
  }

  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.onsubmit = (event) => {
      event.preventDefault();
      const fd = new FormData(settingsForm);

      state.settings.apiBaseUrl = String(fd.get("apiBaseUrl") || state.settings.apiBaseUrl).trim();
      state.settings.autoRefreshMs = Math.max(10000, toNumber(fd.get("autoRefreshMs"), 60000));
      state.settings.backendTop10Endpoint = String(fd.get("backendTop10Endpoint") || "/api/market/top10-analysts").trim();
      state.settings.backendAnalystEndpoint = String(fd.get("backendAnalystEndpoint") || "/api/market/analyst").trim();

      saveSettings();
      resetAutoRefresh();
      updateStatusLine();
      window.alert("Configuracoes salvas.");
    };
  }

  const panelPortfolio = document.getElementById("panel-portfolio");
  if (panelPortfolio) {
    panelPortfolio.querySelectorAll("button[data-action]").forEach((button) => {
      button.onclick = async () => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        const asset = state.portfolio.find((a) => a.id === id);
        if (!asset) return;

        if (action === "remove-asset") {
          state.portfolio = state.portfolio.filter((a) => a.id !== id);
          savePortfolio();
          render();
          return;
        }

        if (action === "edit-asset") {
          const form = document.getElementById("portfolioForm");
          if (!form) return;
          form.querySelector('input[name="id"]').value = asset.id;
          form.querySelector('input[name="ticker"]').value = asset.ticker || "";
          form.querySelector('input[name="name"]').value = asset.name || "";
          form.querySelector('input[name="quantity"]').value = toNumber(asset.quantity, 0);
          form.querySelector('input[name="avgPrice"]').value = toNumber(asset.avgPrice, 0);
          form.querySelector('input[name="buyMorePrice"]').value = toNumber(asset.buyMorePrice, 0);
          form.querySelector('input[name="sellTargetPrice"]').value = Number.isFinite(toNumber(asset.sellTargetPrice, NaN)) ? toNumber(asset.sellTargetPrice, NaN) : "";
          form.querySelector('input[name="trailingStop"]').value = Number.isFinite(toNumber(asset.trailingStop, NaN)) ? toNumber(asset.trailingStop, NaN) : "";
          form.querySelector('input[name="stopLoss"]').value = Number.isFinite(toNumber(asset.stopLoss, NaN)) ? toNumber(asset.stopLoss, NaN) : "";
          form.querySelector('textarea[name="notes"]').value = asset.notes || "";
          form.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (action === "details-asset") {
          const ticker = normalizeTicker(asset.ticker);
          const quote = state.quoteCache.get(ticker)?.data || {};
          const analyst = state.analystCache.get(ticker)?.data || {};
          const historical = state.historicalCache.get(ticker)?.data || [];
          const sma50 = calculateSMA(historical, 50);
          const rsi = calculateRSI(historical, 14);
          const status = classifyAsset(asset, {
            currentPrice: quote.price,
            sma50,
            rsi,
            dayDropPct: 0,
            latestVolume: 0,
            avgVolume: 0
          }, analyst);

          window.alert(
            [
              `Ticker: ${ticker}`,
              `Preco atual: ${fmtCurrency(toNumber(quote.price, NaN))}`,
              `SMA50: ${fmtCurrency(toNumber(sma50, NaN))}`,
              `RSI14: ${fmtNumber(toNumber(rsi, NaN), 2)}`,
              `Alvo analistas: ${fmtCurrency(toNumber(analyst.targetMean, NaN))}`,
              `Recomendacao: ${analyst.available ? analyst.recommendation.toUpperCase() : "indisponivel"}`,
              `Status: ${status}`,
              `Observacoes: ${asset.notes || "-"}`
            ].join("\n")
          );
        }
      };
    });
  }

  const panelTop10 = document.getElementById("panel-top10");
  if (panelTop10) {
    const btnRefreshTop10 = document.getElementById("btnRefreshTop10");
    if (btnRefreshTop10) {
      btnRefreshTop10.onclick = () => updateAllData();
    }

    panelTop10.querySelectorAll("button[data-action]").forEach((button) => {
      button.onclick = () => {
        const action = button.dataset.action;
        const ticker = normalizeTicker(button.dataset.ticker);
        const row = state.top10.find((item) => normalizeTicker(item.ticker) === ticker);
        if (!row) return;

        if (action === "add-top10-watchlist") {
          const exists = state.watchlist.some((item) => normalizeTicker(item.ticker) === ticker);
          if (exists) return;

          state.watchlist.push({
            id: uid(),
            ticker,
            name: row.company,
            buyDesiredPrice: Number.isFinite(row.currentPrice) ? row.currentPrice * 0.97 : NaN,
            notes: "Adicionado via Top 10"
          });
          saveWatchlist();
          render();
          return;
        }

        if (action === "add-top10-portfolio") {
          const form = document.getElementById("portfolioForm");
          if (!form) return;
          state.activeTab = "portfolio";
          renderActiveTab();
          form.querySelector('input[name="ticker"]').value = ticker;
          form.querySelector('input[name="name"]').value = row.company;
          form.querySelector('input[name="quantity"]').value = "1";
          form.querySelector('input[name="avgPrice"]').value = Number.isFinite(row.currentPrice) ? row.currentPrice : "";
          form.querySelector('input[name="buyMorePrice"]').value = Number.isFinite(row.currentPrice) ? (row.currentPrice * 0.97).toFixed(2) : "";
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
    });
  }

  const panelAlerts = document.getElementById("panel-alerts");
  if (panelAlerts) {
    panelAlerts.querySelectorAll("button[data-action='mark-alert-read']").forEach((button) => {
      button.onclick = () => {
        const id = button.dataset.id;
        const found = state.alerts.find((a) => a.id === id);
        if (found) {
          found.read = true;
          saveAlerts();
          render();
        }
      };
    });

    const btnMarkAllRead = document.getElementById("btnMarkAllRead");
    if (btnMarkAllRead) {
      btnMarkAllRead.onclick = () => {
        state.alerts = state.alerts.map((a) => ({ ...a, read: true }));
        saveAlerts();
        render();
      };
    }

    const btnClearAlerts = document.getElementById("btnClearAlerts");
    if (btnClearAlerts) {
      btnClearAlerts.onclick = () => {
        state.alerts = [];
        saveAlerts();
        render();
      };
    }

    const addAlertForm = document.getElementById("addAlertForm");
    if (addAlertForm) {
      attachStockAutocomplete(addAlertForm);

      const btnClearAlertForm = document.getElementById("btnClearAlertForm");
      if (btnClearAlertForm) {
        btnClearAlertForm.onclick = () => {
          addAlertForm.reset();
        };
      }

      addAlertForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(addAlertForm);
        const ticker = (data.get("ticker") || "").toUpperCase().trim();
        const type = data.get("type") || "alerta manual";
        const message = (data.get("message") || "").trim();
        const priority = data.get("priority") || "media";
        if (!ticker) return;
        addAlert({
          ticker,
          type,
          message: message || `${ticker}: ${type}`,
          priority
        });
        addAlertForm.reset();
        render();
        // Fetch market data for this ticker immediately if not cached
        const clean = normalizeTicker(ticker);
        if (!state.quoteCache.has(clean) || !state.analystCache.has(clean)) {
          await Promise.allSettled([
            fetchStockPrice(clean),
            fetchAnalystData(clean)
          ]);
          render();
        }
      };
    }
  }

  const panelWatchlist = document.getElementById("panel-watchlist");
  if (panelWatchlist) {
    panelWatchlist.querySelectorAll("button[data-action='remove-watch']").forEach((button) => {
      button.onclick = () => {
        const id = button.dataset.id;
        state.watchlist = state.watchlist.filter((item) => item.id !== id);
        saveWatchlist();
        render();
      };
    });
  }
}

function resetAutoRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer);
  }

  state.refreshTimer = setInterval(() => {
    updateAllData();
  }, Math.max(10000, toNumber(state.settings.autoRefreshMs, 60000)));
}

async function boot() {
  loadPortfolio();
  loadWatchlist();
  loadAlerts();
  loadSettings();
  loadTrailingHighs();

  createAppLayout();
  render();
  updateStatusLine();

  // Deferred render: fires when user leaves a form field after an update was skipped
  document.addEventListener("focusout", () => {
    if (_renderPending) {
      setTimeout(() => {
        if (!isUserTyping()) {
          _renderPending = false;
          render();
        }
      }, 80);
    }
  });

  await updateAllData();
  resetAutoRefresh();
}

boot();
