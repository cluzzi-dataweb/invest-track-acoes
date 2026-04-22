const STORAGE_KEYS = {
  portfolio: "b3app_portfolio",
  portfolioBackup: "b3app_portfolio_backup",
  portfolioLastGood: "b3app_portfolio_last_good",
  salesHistory: "b3app_sales_history",
  watchlist: "b3app_watchlist",
  alerts: "b3app_alerts",
  settings: "b3app_settings",
  authToken: "b3app_auth_token",
  trailingHighs: "b3app_trailing_highs",
  dismissedTickers: "b3app_dismissed_tickers",
  notifyPromptShown: "b3app_notify_prompt_shown"
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
  { ticker: "DIRR3", name: "Direcional Engenharia" },
  { ticker: "MYPK3", name: "Iochpe-Maxion" },
  { ticker: "ALPA4", name: "Alpargatas" },
  { ticker: "ALPA3", name: "Alpargatas ON" },
  { ticker: "GOLL4", name: "Gol Linhas Aereas" },
  { ticker: "AZUL4", name: "Azul Linhas Aereas" },
  { ticker: "ARZZ3", name: "Arezzo" },
  { ticker: "SOMA3", name: "Grupo Soma" },
  { ticker: "VIVA3", name: "Vivara" },
  { ticker: "TUPY3", name: "Tupy" },
  { ticker: "FRAS3", name: "Frasle Mobility" },
  { ticker: "RAIZ4", name: "Raizen" },
  { ticker: "SIMH3", name: "Simpar" },
  { ticker: "VAMO3", name: "Vamos" },
  { ticker: "PETZ3", name: "Petz" },
  { ticker: "ASAI3", name: "Assai Atacadista" },
  { ticker: "CRFB3", name: "Carrefour Brasil" },
  { ticker: "IRBR3", name: "IRB Brasil Resseguros" },
  { ticker: "QUAL3", name: "Qualicorp" },
  { ticker: "ODPV3", name: "Odontoprev" },
  { ticker: "DASA3", name: "Diagnosticos da America" },
  { ticker: "GRND3", name: "Grendene" },
  { ticker: "AURE3", name: "Auren Energia" },
  { ticker: "CPFE3", name: "CPFL Energia" },
  { ticker: "ENEV3", name: "Eneva" },
  { ticker: "ENBR3", name: "EDP Brasil" },
  { ticker: "BRAP4", name: "Bradespar" },
  { ticker: "JHSF3", name: "JHSF Participacoes" },
  { ticker: "EVEN3", name: "Even Construtora" },
  { ticker: "HBOR3", name: "Helbor" },
  { ticker: "TRIS3", name: "Trisul" },
  { ticker: "PLPL3", name: "Plano e Plano" }
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
  salesHistory: [],
  watchlist: [],
  alerts: [],
  settings: {
    apiBaseUrl: getDefaultApiBaseUrl(),
    autoRefreshMs: 60000,
    backendTop10Endpoint: "/api/market/top10-analysts",
    backendAnalystEndpoint: "/api/market/analyst",
    cloudAutoSync: true,
    notifySellTarget: true,
    opportunityMinUpsidePct: 25,
    opportunityMinAnalysts: 5,
    opportunityRequireBuy: true,
    radarMinScore: 60,
    localModeAnalystMessage: "dados de analistas indisponiveis no modo local"
  },
  trailingHighs: {},
  dismissedTickers: {},
  quoteCache: new Map(),
  historicalCache: new Map(),
  analystCache: new Map(),
  marketSearchCache: new Map(),
  top10: [],
  top10Message: "",
  activeTab: "portfolio",
  refreshTimer: null,
  isUpdating: false,
  lastUpdatedAt: null,
  isApplyingCloudSnapshot: false,
  session: {
    token: null,
    user: null,
    cloudStatus: "local",
    lastCloudSyncAt: null,
    cloudSyncTimer: null
  }
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

  // Keep a resilient recovery snapshot only when portfolio has data.
  if (Array.isArray(state.portfolio) && state.portfolio.length > 0) {
    localStorage.setItem(STORAGE_KEYS.portfolioLastGood, serialized);
  }

  scheduleLegacyCloudSync();
}

function loadPortfolio() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.portfolio) || "[]", []);
  const main = Array.isArray(parsed) ? parsed : [];

  if (main.length > 0) {
    state.portfolio = main;
    return;
  }

  const backup = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.portfolioBackup) || "[]", []);
  if (Array.isArray(backup) && backup.length > 0) {
    state.portfolio = backup;
    return;
  }

  const lastGood = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.portfolioLastGood) || "[]", []);
  state.portfolio = Array.isArray(lastGood) ? lastGood : [];
}

function saveWatchlist() {
  localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(state.watchlist));
  scheduleLegacyCloudSync();
}

function saveSalesHistory() {
  localStorage.setItem(STORAGE_KEYS.salesHistory, JSON.stringify(state.salesHistory));
  scheduleLegacyCloudSync();
}

function loadSalesHistory() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.salesHistory) || "[]", []);
  state.salesHistory = Array.isArray(parsed) ? parsed : [];
}

function loadWatchlist() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.watchlist) || "[]", []);
  state.watchlist = Array.isArray(parsed) ? parsed : [];
}

function saveAlerts() {
  localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(state.alerts));
  scheduleLegacyCloudSync();
}

function loadAlerts() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.alerts) || "[]", []);
  state.alerts = Array.isArray(parsed) ? parsed : [];
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  scheduleLegacyCloudSync();
}

function loadSettings() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.settings) || "{}", {});
  state.settings = {
    ...state.settings,
    ...parsed
  };
}

function saveAuthToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.authToken, token);
    state.session.token = token;
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.authToken);
  state.session.token = null;
}

function loadAuthToken() {
  state.session.token = localStorage.getItem(STORAGE_KEYS.authToken) || null;
}

function clearAuthSession() {
  saveAuthToken("");
  state.session.user = null;
  state.session.cloudStatus = "local";
  state.session.lastCloudSyncAt = null;
}

function getApiBase() {
  return state.settings.apiBaseUrl.replace(/\/$/, "");
}

function getCloudStatusText() {
  const accountText = state.session.user
    ? `conta ${state.session.user.email}`
    : "sem conta conectada";
  const syncText = state.session.lastCloudSyncAt
    ? `${state.session.cloudStatus} em ${fmtDate(state.session.lastCloudSyncAt)}`
    : state.session.cloudStatus;

  return `${accountText} | nuvem ${syncText}`;
}

function buildLegacyCloudPayload() {
  return {
    portfolio: state.portfolio,
    salesHistory: state.salesHistory,
    watchlist: state.watchlist,
    alerts: state.alerts,
    trailingHighs: state.trailingHighs,
    dismissedTickers: state.dismissedTickers,
    settings: {
      autoRefreshMs: state.settings.autoRefreshMs,
      backendTop10Endpoint: state.settings.backendTop10Endpoint,
      backendAnalystEndpoint: state.settings.backendAnalystEndpoint,
      cloudAutoSync: !!state.settings.cloudAutoSync,
      notifySellTarget: !!state.settings.notifySellTarget,
      opportunityMinUpsidePct: state.settings.opportunityMinUpsidePct,
      opportunityMinAnalysts: state.settings.opportunityMinAnalysts,
      opportunityRequireBuy: !!state.settings.opportunityRequireBuy,
      radarMinScore: Math.max(0, Math.min(100, toNumber(state.settings.radarMinScore, 60))),
    }
  };
}

function applyLegacyCloudPayload(payload) {
  const data = payload && typeof payload === "object" ? payload : {};
  const currentApiBaseUrl = state.settings.apiBaseUrl;

  state.isApplyingCloudSnapshot = true;
  state.portfolio = Array.isArray(data.portfolio) ? data.portfolio : [];
  state.salesHistory = Array.isArray(data.salesHistory) ? data.salesHistory : [];
  state.watchlist = Array.isArray(data.watchlist) ? data.watchlist : [];
  state.alerts = Array.isArray(data.alerts) ? data.alerts : [];
  state.trailingHighs = data.trailingHighs && typeof data.trailingHighs === "object" ? data.trailingHighs : {};
  state.dismissedTickers = data.dismissedTickers && typeof data.dismissedTickers === "object" ? data.dismissedTickers : {};
  state.settings = {
    ...state.settings,
    ...(data.settings && typeof data.settings === "object" ? data.settings : {}),
    apiBaseUrl: currentApiBaseUrl,
  };
  state.isApplyingCloudSnapshot = false;

  savePortfolio();
  saveSalesHistory();
  saveWatchlist();
  saveAlerts();
  saveTrailingHighs();
  saveDismissedTickers();
  saveSettings();
  syncPortfolioAlerts();
}

async function authJson(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (state.session.token) {
    headers.Authorization = `Bearer ${state.session.token}`;
  }

  return fetchJson(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });
}

async function registerCloudAccount(email, password) {
  const payload = await authJson("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  saveAuthToken(payload.token);
  state.session.user = payload.user;
  state.session.cloudStatus = "conectada";
  state.session.lastCloudSyncAt = null;
  return payload;
}

async function loginCloudAccount(email, password) {
  const payload = await authJson("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  saveAuthToken(payload.token);
  state.session.user = payload.user;
  state.session.cloudStatus = "conectada";
  state.session.lastCloudSyncAt = null;
  return payload;
}

async function restoreCloudSession() {
  if (!state.session.token) {
    state.session.cloudStatus = "local";
    return false;
  }

  try {
    const payload = await authJson("/api/auth/me", { method: "GET" });
    state.session.user = payload.user;
    state.session.cloudStatus = "conectada";
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
}

async function loadLegacyCloudData() {
  if (!state.session.user || !state.session.token) {
    state.session.cloudStatus = "local";
    return false;
  }

  try {
    const payload = await authJson("/api/legacy-cloud/data", { method: "GET" });
    applyLegacyCloudPayload(payload.data);
    state.session.cloudStatus = "sincronizada";
    state.session.lastCloudSyncAt = payload.updatedAt || new Date().toISOString();
    return true;
  } catch (error) {
    if (String(error?.message || "").includes("404")) {
      state.session.cloudStatus = "sem backup";
      return false;
    }

    state.session.cloudStatus = "erro";
    return false;
  }
}

async function syncLegacyCloudData(showMessage = false) {
  if (!state.session.user || !state.session.token) {
    if (showMessage) {
      window.alert("Entre com sua conta para salvar na nuvem.");
    }
    return false;
  }

  try {
    state.session.cloudStatus = "sincronizando";
    updateStatusLine();
    const payload = await authJson("/api/legacy-cloud/data", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: buildLegacyCloudPayload() })
    });
    state.session.cloudStatus = "sincronizada";
    state.session.lastCloudSyncAt = payload.updatedAt || new Date().toISOString();
    render();
    updateStatusLine();
    if (showMessage) {
      window.alert("Dados salvos na nuvem com sucesso.");
    }
    return true;
  } catch {
    state.session.cloudStatus = "erro";
    updateStatusLine();
    if (showMessage) {
      window.alert("Falha ao salvar dados na nuvem.");
    }
    return false;
  }
}

function scheduleLegacyCloudSync() {
  if (state.isApplyingCloudSnapshot || !state.settings.cloudAutoSync || !state.session.user || !state.session.token) {
    return;
  }

  if (state.session.cloudSyncTimer) {
    clearTimeout(state.session.cloudSyncTimer);
  }

  state.session.cloudStatus = "pendente";
  updateStatusLine();
  state.session.cloudSyncTimer = setTimeout(() => {
    syncLegacyCloudData(false);
  }, 1000);
}

function saveTrailingHighs() {
  localStorage.setItem(STORAGE_KEYS.trailingHighs, JSON.stringify(state.trailingHighs));
  scheduleLegacyCloudSync();
}

function loadTrailingHighs() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.trailingHighs) || "{}", {});
  state.trailingHighs = parsed && typeof parsed === "object" ? parsed : {};
}

function saveDismissedTickers() {
  localStorage.setItem(STORAGE_KEYS.dismissedTickers, JSON.stringify(state.dismissedTickers));
  scheduleLegacyCloudSync();
}

function loadDismissedTickers() {
  const parsed = parseJsonSafe(localStorage.getItem(STORAGE_KEYS.dismissedTickers) || "{}", {});
  state.dismissedTickers = parsed && typeof parsed === "object" ? parsed : {};
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
        <button class="tab-btn" data-tab="sales">Vendas</button>
        <button class="tab-btn" data-tab="top10">Top 10 Analistas</button>
        <button class="tab-btn" data-tab="alerts">Alertas</button>
        <button class="tab-btn" data-tab="watchlist">Watchlist</button>
        <button class="tab-btn" data-tab="settings">Configuracoes</button>
      </nav>

      <section class="panel active" id="panel-portfolio"></section>
      <section class="panel" id="panel-sales"></section>
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

function normalizeAnalystRecommendation(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || normalized === "-" || normalized.includes("indispon")) {
    return null;
  }

  if (
    normalized === "strong buy" ||
    normalized === "strongbuy" ||
    normalized === "buy" ||
    normalized === "outperform" ||
    normalized === "overweight" ||
    normalized === "compra forte" ||
    normalized === "compra"
  ) {
    return "COMPRAR";
  }

  if (
    normalized === "hold" ||
    normalized === "neutral" ||
    normalized === "market perform" ||
    normalized === "marketperform" ||
    normalized === "equal weight" ||
    normalized === "equalweight" ||
    normalized === "manter" ||
    normalized === "neutro" ||
    normalized === "neutra"
  ) {
    return "MANTER";
  }

  if (
    normalized === "reduce" ||
    normalized === "underweight" ||
    normalized === "reduzir"
  ) {
    return "REDUZIR";
  }

  if (
    normalized === "sell" ||
    normalized === "strong sell" ||
    normalized === "strongsell" ||
    normalized === "underperform" ||
    normalized === "venda" ||
    normalized === "vender"
  ) {
    return "VENDER";
  }

  return null;
}

function getFinalSignal(asset) {
  const recommendation = normalizeAnalystRecommendation(
    asset?.analystRecommendation ?? asset?.analyst?.recommendation ?? asset?.recommendation
  );
  const upsidePct = toNumber(asset?.upsidePct, NaN);
  const pnlPct = toNumber(asset?.pnlPct, NaN);
  const technicalSellPrice = toNumber(asset?.technicalSellPrice, NaN);
  const currentPrice = toNumber(asset?.currentPrice, NaN);
  const status = String(asset?.status || "").toUpperCase();

  const hasStrongExitStatus = status === "VENDER";
  const hasAttentionStatus = status === "ATENCAO";
  const isNearTechnicalSell =
    Number.isFinite(currentPrice) &&
    Number.isFinite(technicalSellPrice) &&
    technicalSellPrice > 0 &&
    currentPrice >= technicalSellPrice * 0.985;

  const upsideNonPositive = Number.isFinite(upsidePct) && upsidePct <= 0;
  const upsideVeryLowWithProfit = Number.isFinite(upsidePct) && upsidePct <= 5 && Number.isFinite(pnlPct) && pnlPct >= 12;
  const lowUpsideWithProfit = Number.isFinite(upsidePct) && upsidePct <= 10 && Number.isFinite(pnlPct) && pnlPct >= 15;

  if (
    hasStrongExitStatus ||
    recommendation === "VENDER" ||
    upsideNonPositive ||
    upsideVeryLowWithProfit ||
    (isNearTechnicalSell && Number.isFinite(pnlPct) && pnlPct >= 8) ||
    (hasAttentionStatus && recommendation === "REDUZIR" && Number.isFinite(upsidePct) && upsidePct <= 8)
  ) {
    return "VENDER";
  }

  if (
    status === "REDUZIR" ||
    lowUpsideWithProfit ||
    (hasAttentionStatus && Number.isFinite(pnlPct) && pnlPct >= 10) ||
    recommendation === "REDUZIR"
  ) {
    return "REDUZIR";
  }

  const attractiveUpside = Number.isFinite(upsidePct) && upsidePct > 15;
  const hasStrongAlert = hasAttentionStatus || status === "REDUZIR" || status === "VENDER";
  if (recommendation === "COMPRAR" && attractiveUpside && !hasStrongAlert && !isNearTechnicalSell) {
    return "COMPRAR";
  }

  return "MANTER";
}

function getFinalSignalReason(asset) {
  const signal = getFinalSignal(asset);

  if (signal === "COMPRAR") {
    return "Upside atrativo com consenso positivo";
  }

  if (signal === "REDUZIR") {
    return "Lucro relevante com upside remanescente limitado";
  }

  if (signal === "VENDER") {
    return "Baixa assimetria e sinal de saida mais forte";
  }

  return "Sem gatilho claro de compra adicional ou saida";
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

function finalSignalBadge(signal, reason = "") {
  const s = String(signal || "MANTER").toUpperCase();
  const cls = s === "COMPRAR" ? "buy" : s === "REDUZIR" ? "reduce" : s === "VENDER" ? "sell" : "hold";
  const title = escapeHtml(reason);
  return `<span class="badge ${cls}" title="${title}">${s}</span>`;
}

function recommendationBadge(rec) {
  const raw = String(rec || "").trim();
  const normalizedRaw = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedRaw || normalizedRaw.includes("indispon") || normalizedRaw === "-") {
    return '<span class="badge rec-na">-</span>';
  }

  if (normalizedRaw === "strong buy" || normalizedRaw === "strongbuy" || normalizedRaw === "compra forte") {
    return '<span class="badge rec-strong-buy">&#9650; COMPRA FORTE</span>';
  }

  const normalizedClass = normalizeAnalystRecommendation(raw);

  if (normalizedClass === "COMPRAR") {
    return '<span class="badge rec-buy">&#9650; COMPRA</span>';
  }

  if (normalizedClass === "MANTER") {
    return '<span class="badge rec-hold">&#9654; MANTER</span>';
  }

  if (normalizedClass === "REDUZIR") {
    return '<span class="badge rec-reduce">&#9660; REDUZIR</span>';
  }

  if (normalizedClass === "VENDER") {
    return '<span class="badge rec-sell">&#9660; VENDA</span>';
  }

  // Unknown value — show as-is with a neutral badge
  return `<span class="badge rec-hold">${escapeHtml(raw)}</span>`;
}

function alertPriorityBadge(priority) {
  if (priority === "alta") return '<span class="badge high">ALTA</span>';
  if (priority === "media") return '<span class="badge mid">MEDIA</span>';
  return '<span class="badge low">BAIXA</span>';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function promptNumber(message, defaultValue = "") {
  const raw = window.prompt(message, defaultValue);
  if (raw === null) return null;
  const normalized = String(raw).trim().replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }
  return parsed;
}

function buildAgentDecision(row) {
  const reasons = [];
  let buyScore = 0;
  let sellScore = 0;
  const finalSignal = getFinalSignal(row);
  const finalSignalReason = getFinalSignalReason(row);

  if (row.status === "COMPRAR MAIS") {
    buyScore += 30;
    reasons.push("Preco entrou na faixa de recompra definida na sua estrategia.");
  }

  if (row.status === "VENDER") {
    sellScore += 34;
    reasons.push("Sinais tecnicos de protecao indicam realizacao parcial.");
  } else if (row.status === "REDUZIR") {
    sellScore += 22;
    reasons.push("Mercado indica enfraquecimento no curto prazo.");
  } else if (row.status === "ATENCAO") {
    sellScore += 14;
    reasons.push("Momento pede monitoramento mais proximo.");
  }

  if (Number.isFinite(row.upsidePct)) {
    if (row.upsidePct >= 20) {
      buyScore += 18;
      reasons.push("Upside estimado acima de 20% reforca potencial de compra.");
    } else if (row.upsidePct <= 5) {
      sellScore += 12;
      reasons.push("Upside baixo reduz margem de seguranca para novas compras.");
    }
  }

  if (row.pnlPct >= 18) {
    sellScore += 14;
    reasons.push("Lucro acumulado relevante pode justificar realizacao parcial.");
  } else if (row.pnlPct <= -10) {
    buyScore += 8;
    reasons.push("Queda relevante; avaliar aporte gradual se fundamentos estiverem intactos.");
  }

  const rec = String(row.analyst?.recommendation || "").toLowerCase();
  if (rec.includes("strong buy") || rec.includes("buy") || rec.includes("outperform") || rec.includes("overweight")) {
    buyScore += 12;
    reasons.push("Consenso de analistas segue favoravel para compra.");
  }

  if (rec.includes("sell") || rec.includes("underperform") || rec.includes("underweight") || rec.includes("reduce")) {
    sellScore += 14;
    reasons.push("Consenso de analistas aponta viés mais defensivo.");
  }

  if (finalSignal === "COMPRAR") {
    buyScore += 16;
    reasons.unshift(finalSignalReason);
  } else if (finalSignal === "REDUZIR") {
    sellScore += 14;
    reasons.unshift(finalSignalReason);
  } else if (finalSignal === "VENDER") {
    sellScore += 22;
    reasons.unshift(finalSignalReason);
  } else {
    reasons.unshift(finalSignalReason);
  }

  const diff = buyScore - sellScore;
  const action = finalSignal;

  const confidence = Math.round(clamp(52 + Math.abs(diff) * 1.35, 55, 95));
  const riskLevel = sellScore >= 35 ? "alto" : sellScore >= 20 ? "medio" : "baixo";

  return {
    assetId: row.asset.id,
    ticker: normalizeTicker(row.asset.ticker),
    action,
    finalSignal,
    finalSignalReason,
    confidence,
    riskLevel,
    reasons: reasons.slice(0, 3),
    buyScore,
    sellScore
  };
}

function buildAgentSnapshot(rows) {
  const decisions = rows.map((row) => ({ row, decision: buildAgentDecision(row) }));

  const buyCandidates = decisions
    .filter((item) => item.decision.finalSignal === "COMPRAR")
    .sort((a, b) => b.decision.confidence - a.decision.confidence);

  const reduceCandidates = decisions
    .filter((item) => item.decision.finalSignal === "REDUZIR")
    .sort((a, b) => b.decision.confidence - a.decision.confidence);

  const sellCandidates = decisions
    .filter((item) => item.decision.finalSignal === "VENDER")
    .sort((a, b) => b.decision.confidence - a.decision.confidence);

  const bestBuy = buyCandidates[0] || null;
  const bestReduce = reduceCandidates[0] || null;
  const bestSell = sellCandidates[0] || null;
  const riskHighlights = decisions
    .filter((item) => item.decision.finalSignal === "VENDER" || item.decision.finalSignal === "REDUZIR" || item.decision.sellScore >= 20)
    .sort((a, b) => b.decision.sellScore - a.decision.sellScore)
    .slice(0, 3)
    .map((item) => ({
      ticker: item.decision.ticker,
      confidence: item.decision.confidence,
      reasons: item.decision.reasons.slice(0, 2)
    }));

  const todayBuy = decisions
    .filter((item) => item.decision.finalSignal === "COMPRAR")
    .sort((a, b) => b.decision.confidence - a.decision.confidence)
    .slice(0, 4)
    .map((item) => ({
      ticker: item.decision.ticker,
      confidence: item.decision.confidence,
      note: item.decision.finalSignalReason || item.decision.reasons[0] || "Upside atrativo com consenso positivo"
    }));

  const todaySell = decisions
    .filter((item) => item.decision.finalSignal === "VENDER")
    .sort((a, b) => b.decision.confidence - a.decision.confidence)
    .slice(0, 4)
    .map((item) => ({
      ticker: item.decision.ticker,
      confidence: item.decision.confidence,
      note: item.decision.finalSignalReason || item.decision.reasons[0] || "Baixa assimetria e sinal de saida mais forte"
    }));

  const todayReduce = decisions
    .filter((item) => item.decision.finalSignal === "REDUZIR")
    .sort((a, b) => b.decision.sellScore - a.decision.sellScore)
    .slice(0, 4)
    .map((item) => ({
      ticker: item.decision.ticker,
      confidence: item.decision.confidence,
      note: item.decision.finalSignalReason || item.decision.reasons[0] || "Lucro relevante com upside remanescente limitado"
    }));

  const todayHold = decisions
    .filter((item) => item.decision.finalSignal === "MANTER")
    .sort((a, b) => b.decision.confidence - a.decision.confidence)
    .slice(0, 4)
    .map((item) => ({
      ticker: item.decision.ticker,
      confidence: item.decision.confidence,
      note: item.decision.finalSignalReason || item.decision.reasons[0] || "Sem gatilho claro de compra adicional ou saida"
    }));

  const avgConfidence = decisions.length
    ? decisions.reduce((acc, item) => acc + item.decision.confidence, 0) / decisions.length
    : 0;
  const xp = Math.round(clamp((rows.length * 11) + avgConfidence * 0.55, 0, 100));
  const level = Math.max(1, Math.floor(xp / 20) + 1);

  let mood = "steady";
  let headline = "Mercado em equilibrio. Vamos seguir o plano.";

  if (bestSell && bestSell.decision.confidence >= 78) {
    mood = "alert";
    headline = "Detectei riscos relevantes. Hora de proteger lucro.";
  } else if (bestBuy && bestBuy.decision.confidence >= 76) {
    mood = "excited";
    headline = "Boas oportunidades no radar. Momento de montar posicao com criterio.";
  }

  return {
    decisions,
    bestBuy,
    bestReduce,
    bestSell,
    riskHighlights,
    todaySummary: {
      buy: todayBuy,
      sell: todaySell,
      reduce: todayReduce,
      hold: todayHold
    },
    avgConfidence: Math.round(avgConfidence || 0),
    xp,
    level,
    mood,
    headline
  };
}

function buildOpportunityRadar(rows) {
  const items = [];
  const inPortfolio = new Set();

  for (const row of rows) {
    const ticker = normalizeTicker(row.asset.ticker);
    inPortfolio.add(ticker);
    const upsidePct = toNumber(row.upsidePct, NaN);
    const analystsCount = toNumber(row.analyst?.analystsCount, 0);
    const recommendation = String(row.analyst?.recommendation || "");

    let score = 50;
    if (Number.isFinite(upsidePct)) {
      score += clamp((upsidePct - 10) * 0.9, -20, 35);
    } else {
      score -= 22;
    }

    if (isPositiveAnalystRecommendation(recommendation)) {
      score += 10;
    } else if (recommendation.toLowerCase().includes("sell") || recommendation.toLowerCase().includes("under")) {
      score -= 12;
    }

    if (analystsCount >= 10) {
      score += 14;
    } else if (analystsCount >= 5) {
      score += 9;
    } else {
      score -= 6;
    }

    const finalSignal = getFinalSignal(row);
    const finalSignalReason = getFinalSignalReason(row);

    if (finalSignal === "COMPRAR") {
      score += 12;
    }

    if (finalSignal === "REDUZIR") {
      score -= 12;
    }

    if (finalSignal === "VENDER") {
      score -= 18;
    }

    score = Math.round(clamp(score, 0, 100));

    items.push({
      ticker,
      name: row.asset.name || row.quote?.name || ticker,
      source: "carteira",
      currentPrice: toNumber(row.currentPrice, NaN),
      targetMean: toNumber(row.analyst?.targetMean, NaN),
      upsidePct,
      analystsCount,
      recommendation,
      status: row.status,
      finalSignal,
      finalSignalReason,
      score,
      actionLabel: finalSignal === "COMPRAR"
        ? "Compra guiada"
        : finalSignal === "REDUZIR"
          ? "Venda parcial / realizacao"
          : finalSignal === "VENDER"
            ? "Venda guiada / zerar"
            : "Acompanhar sem CTA agressivo"
    });
  }

  for (const watch of state.watchlist) {
    const ticker = normalizeTicker(watch.ticker);
    if (!ticker || inPortfolio.has(ticker)) {
      continue;
    }

    const quote = state.quoteCache.get(ticker)?.data || {};
    const analyst = state.analystCache.get(ticker)?.data || {};
    const upsidePct = calculateUpside(toNumber(quote.price, NaN), toNumber(analyst.targetMean, NaN));
    const analystsCount = toNumber(analyst.analystsCount, 0);
    const recommendation = String(analyst.recommendation || "");
    const finalSignal = getFinalSignal({
      recommendation,
      upsidePct,
      currentPrice: toNumber(quote.price, NaN),
      technicalSellPrice: NaN,
      status: "WATCHLIST"
    });
    const finalSignalReason = getFinalSignalReason({
      recommendation,
      upsidePct,
      currentPrice: toNumber(quote.price, NaN),
      technicalSellPrice: NaN,
      status: "WATCHLIST"
    });

    let score = 46;
    if (Number.isFinite(upsidePct)) {
      score += clamp((upsidePct - 12) * 0.95, -18, 38);
    } else {
      score -= 16;
    }

    if (isPositiveAnalystRecommendation(recommendation)) {
      score += 12;
    } else if (recommendation.toLowerCase().includes("sell") || recommendation.toLowerCase().includes("under")) {
      score -= 10;
    }

    if (analystsCount >= 10) {
      score += 14;
    } else if (analystsCount >= 5) {
      score += 8;
    } else {
      score -= 4;
    }

    score = Math.round(clamp(score, 0, 100));

    items.push({
      ticker,
      name: watch.name || quote.name || ticker,
      source: "watchlist",
      currentPrice: toNumber(quote.price, NaN),
      targetMean: toNumber(analyst.targetMean, NaN),
      upsidePct,
      analystsCount,
      recommendation,
      status: "WATCHLIST",
      finalSignal,
      finalSignalReason,
      score,
      actionLabel: finalSignal === "COMPRAR"
        ? "Entrada com gestao"
        : finalSignal === "MANTER"
          ? "Monitorar"
          : finalSignal === "REDUZIR"
            ? "Entrada parcial"
            : "Evitar entrada"
    });
  }

  return items
    .filter((item) => Number.isFinite(item.currentPrice))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function renderOpportunityRadar(rows) {
  const radar = buildOpportunityRadar(rows);
  const minScore = Math.round(clamp(toNumber(state.settings.radarMinScore, 60), 0, 100));
  const filtered = radar.filter((item) => item.score >= minScore);

  if (!radar.length) {
    return `
      <section class="agent-radar">
        <h4>Radar de oportunidade</h4>
        <p class="muted-text">Sem dados suficientes no momento para montar o ranking.</p>
      </section>
    `;
  }

  const controlsHtml = `
    <div class="agent-radar-controls">
      <span class="muted-text">Score minimo:</span>
      ${[0, 50, 60, 70, 80].map((score) => `
        <button
          type="button"
          class="btn ${minScore === score ? 'primary' : ''}"
          data-action="agent-radar-score"
          data-score="${score}">
          ${score === 0 ? 'Todos' : score}
        </button>
      `).join("")}
    </div>
  `;

  if (!filtered.length) {
    return `
      <section class="agent-radar">
        <h4>Radar de oportunidade</h4>
        ${controlsHtml}
        <p class="muted-text">Nenhum ativo atingiu o score minimo ${minScore} agora. Tente reduzir o filtro.</p>
      </section>
    `;
  }

  const rowsHtml = filtered.map((item) => {
    const scoreClass = item.score >= 75 ? "positive" : item.score >= 55 ? "warn-text" : "negative";
    const upsideClass = toNumber(item.upsidePct, 0) >= 0 ? "positive" : "negative";
    return `
      <tr>
        <td class="mono">${escapeHtml(item.ticker)}</td>
        <td>${item.source === "carteira" ? "Carteira" : "Watchlist"}</td>
        <td>${fmtCurrency(item.currentPrice)}</td>
        <td>${fmtCurrency(item.targetMean)}</td>
        <td class="${upsideClass}">${fmtPct(item.upsidePct)}</td>
        <td>${fmtNumber(item.analystsCount, 0)}</td>
        <td class="${scoreClass}"><strong>${item.score}</strong></td>
        <td>${finalSignalBadge(item.finalSignal || "MANTER", item.finalSignalReason || "")}</td>
        <td>${escapeHtml(item.actionLabel)}</td>
      </tr>
    `;
  }).join("");

  return `
    <section class="agent-radar">
      <h4>Radar de oportunidade</h4>
      ${controlsHtml}
      <div class="table-wrap agent-radar-table">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Origem</th>
              <th>Preco atual</th>
              <th>Alvo medio</th>
              <th>Upside %</th>
              <th>Analistas</th>
              <th>Score</th>
              <th>Sinal</th>
              <th>Acao sugerida</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDecisionAgent(rows) {
  if (!rows.length) {
    return `
      <section class="agent-card">
        <div class="agent-avatar mood-steady" aria-hidden="true">
          <div class="agent-face"><span class="eye"></span><span class="eye"></span><span class="mouth"></span></div>
        </div>
        <div>
          <h3 class="agent-title">Agente Orion</h3>
          <p class="muted-text">Cadastre ativos para eu comecar as recomendacoes de compra e venda.</p>
        </div>
      </section>
    `;
  }

  const snapshot = buildAgentSnapshot(rows);
  const buyMission = snapshot.bestBuy
    ? `<li><strong>Missao compra:</strong> ${escapeHtml(snapshot.bestBuy.decision.ticker)} (${snapshot.bestBuy.decision.confidence}% confianca)
         <button class="btn primary" data-action="agent-buy-more" data-id="${snapshot.bestBuy.decision.assetId}">Executar compra guiada</button></li>`
    : "<li><strong>Missao compra:</strong> nenhuma oportunidade forte no momento.</li>";

  const reduceMission = snapshot.bestReduce
    ? `<li><strong>Missao reduzir:</strong> ${escapeHtml(snapshot.bestReduce.decision.ticker)} (${snapshot.bestReduce.decision.confidence}% confianca)
         <button class="btn warn" data-action="agent-sell-part" data-id="${snapshot.bestReduce.decision.assetId}">Executar venda parcial</button></li>`
    : "<li><strong>Missao reduzir:</strong> sem necessidade clara de realizacao parcial agora.</li>";

  const sellMission = snapshot.bestSell
    ? `<li><strong>Missao protecao:</strong> ${escapeHtml(snapshot.bestSell.decision.ticker)} (${snapshot.bestSell.decision.confidence}% confianca)
         <button class="btn warn" data-action="agent-sell-part" data-id="${snapshot.bestSell.decision.assetId}">Executar venda guiada</button>
         <button class="btn danger" data-action="agent-sell-all" data-id="${snapshot.bestSell.decision.assetId}">Zerar posicao</button></li>`
    : "<li><strong>Missao protecao:</strong> risco controlado na carteira por enquanto.</li>";

  const risksHtml = snapshot.riskHighlights.length
    ? `
      <div class="agent-risks">
        <p class="muted-text"><strong>Riscos detectados agora:</strong></p>
        <ul>
          ${snapshot.riskHighlights.map((item) => `<li><strong>${escapeHtml(item.ticker)}</strong> (${item.confidence}%): ${escapeHtml(item.reasons.join(' '))}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  const renderSummaryItems = (items) => {
    if (!items.length) {
      return "<li class=\"agent-summary-empty\">Sem destaque agora.</li>";
    }

    return items
      .map((item) => `<li><strong>${escapeHtml(item.ticker)}</strong> (${item.confidence}%) - ${escapeHtml(item.note)}</li>`)
      .join("");
  };

  const summaryHtml = `
    <section class="agent-summary">
      <h4>Resumo automatico de hoje</h4>
      <div class="agent-summary-grid">
        <article>
          <h5>Comprar</h5>
          <ul>${renderSummaryItems(snapshot.todaySummary.buy)}</ul>
        </article>
        <article>
          <h5>Manter</h5>
          <ul>${renderSummaryItems(snapshot.todaySummary.hold)}</ul>
        </article>
        <article>
          <h5>Reduzir</h5>
          <ul>${renderSummaryItems(snapshot.todaySummary.reduce)}</ul>
        </article>
        <article>
          <h5>Vender</h5>
          <ul>${renderSummaryItems(snapshot.todaySummary.sell)}</ul>
        </article>
      </div>
    </section>
  `;
  const radarHtml = renderOpportunityRadar(rows);

  return `
    <section class="agent-card">
      <div class="agent-avatar mood-${snapshot.mood}" aria-hidden="true">
        <div class="agent-face"><span class="eye"></span><span class="eye"></span><span class="mouth"></span></div>
      </div>
      <div class="agent-content">
        <div class="agent-header">
          <h3 class="agent-title">Agente Orion</h3>
          <span class="badge hold">Nivel ${snapshot.level} | XP ${snapshot.xp}/100</span>
        </div>
        <p class="agent-headline">${snapshot.headline}</p>
        <div class="agent-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${snapshot.avgConfidence}">
          <span style="width:${snapshot.avgConfidence}%"></span>
        </div>
        <p class="muted-text">Confianca media atual: <strong>${snapshot.avgConfidence}%</strong></p>
        ${summaryHtml}
        ${radarHtml}
        ${risksHtml}
        <ul class="agent-missions">
          ${buyMission}
          ${reduceMission}
          ${sellMission}
        </ul>
      </div>
    </section>
  `;
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

  // Also wrap ticker input for its own dropdown
  let tickerWrap = tickerInput.parentElement;
  if (!tickerWrap.classList.contains("autocomplete-wrap")) {
    const divT = document.createElement("div");
    divT.className = "autocomplete-wrap";
    tickerInput.parentNode.insertBefore(divT, tickerInput);
    divT.appendChild(tickerInput);
    tickerWrap = divT;
  }

  // Remove previous dropdowns if re-attaching
  const prev = wrap.querySelector(".autocomplete-dropdown");
  if (prev) prev.remove();
  const prevT = tickerWrap.querySelector(".autocomplete-dropdown");
  if (prevT) prevT.remove();

  const dropdown = document.createElement("ul");
  dropdown.className = "autocomplete-dropdown";
  wrap.appendChild(dropdown);

  const dropdownTicker = document.createElement("ul");
  dropdownTicker.className = "autocomplete-dropdown";
  tickerWrap.appendChild(dropdownTicker);

  let suggestions = [];
  let activeIndex = -1;

  let activeDropdown = dropdown;

  const closeDrop = () => {
    dropdown.style.display = "none";
    dropdownTicker.style.display = "none";
    activeIndex = -1;
  };

  const renderList = (items, targetDrop) => {
    const d = targetDrop || activeDropdown;
    if (d === dropdown) dropdownTicker.style.display = "none";
    else dropdown.style.display = "none";
    if (!items.length) {
      d.style.display = "none";
      return;
    }
    d.innerHTML = items
      .map(
        (item, i) =>
          `<li class="autocomplete-item" data-index="${i}">
            <span class="ac-ticker">${escapeHtml(item.ticker)}</span>
            <span class="ac-name">${escapeHtml(item.name)}</span>
          </li>`
      )
      .join("");
    d.style.display = "block";
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

  const searchAndRender = debounce(async (value, targetDrop) => {
    const term = value.trim();
    if (term.length < 2) {
      closeDrop();
      return;
    }

    // Show local fallback immediately
    const fallback = filterFallback(term);
    if (fallback.length) {
      suggestions = fallback;
      renderList(fallback, targetDrop);
    }

    // Then try backend and replace if got results
    const fresh = await searchMarket(term);
    if (fresh.length) {
      suggestions = fresh;
      renderList(fresh, targetDrop);
    }
  }, 260);

  nameInput.addEventListener("input", () => {
    activeIndex = -1;
    activeDropdown = dropdown;
    searchAndRender(nameInput.value, dropdown);
  });

  tickerInput.addEventListener("input", () => {
    activeIndex = -1;
    activeDropdown = dropdownTicker;
    searchAndRender(tickerInput.value, dropdownTicker);
  });

  const handleKeydown = (e, currentDrop) => {
    const items = currentDrop.querySelectorAll(".autocomplete-item");
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
  };

  nameInput.addEventListener("keydown", (e) => handleKeydown(e, dropdown));
  tickerInput.addEventListener("keydown", (e) => handleKeydown(e, dropdownTicker));

  const attachClick = (d) => {
    d.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const li = e.target.closest(".autocomplete-item");
      if (!li) return;
      const idx = Number(li.dataset.index);
      const selected = suggestions[idx];
      if (selected) selectItem(selected);
    });
  };
  attachClick(dropdown);
  attachClick(dropdownTicker);

  nameInput.addEventListener("blur", () => { setTimeout(closeDrop, 150); });
  tickerInput.addEventListener("blur", () => { setTimeout(closeDrop, 150); });
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
    const strongBuyVotes = toNumber(recommendationTrend.strongBuy, 0);
    const plainBuyVotes = toNumber(recommendationTrend.buy, 0);
    const buy = strongBuyVotes + plainBuyVotes;
    const hold = toNumber(recommendationTrend.hold, 0);
    const sell = toNumber(recommendationTrend.sell, 0) + toNumber(recommendationTrend.strongSell, 0);

    let recommendation = "hold";
    if (strongBuyVotes > 0 && strongBuyVotes >= plainBuyVotes && strongBuyVotes > hold && strongBuyVotes > sell) {
      recommendation = "strong buy";
    } else if (buy > hold && buy > sell) {
      recommendation = "buy";
    } else if (sell > buy && sell > hold) {
      recommendation = "sell";
    }

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
  const cleanTicker = normalizeTicker(ticker);
  if (!cleanTicker) return;
  if (state.dismissedTickers[cleanTicker]) return;

  const existingIndex = state.alerts.findIndex((alert) => normalizeTicker(alert.ticker) === cleanTicker);
  const nowIso = new Date().toISOString();

  if (existingIndex >= 0) {
    const prev = state.alerts[existingIndex];
    const updated = {
      ...prev,
      type,
      message,
      priority,
      createdAt: nowIso,
      read: false
    };
    state.alerts.splice(existingIndex, 1);
    state.alerts.unshift(updated);
    maybeNotifySellTarget(updated);
    saveAlerts();
    return;
  }

  state.alerts.unshift({
    id: uid(),
    ticker: cleanTicker,
    type,
    message,
    priority,
    createdAt: nowIso,
    read: false
  });

  if (state.alerts.length > 250) {
    state.alerts = state.alerts.slice(0, 250);
  }

  saveAlerts();
  maybeNotifySellTarget(state.alerts[0]);
}

function maybeNotifySellTarget(alert) {
  if (!state.settings.notifySellTarget) return;
  if (typeof Notification === "undefined") return;

  const type = String(alert?.type || "").toLowerCase();
  if (type !== SELL_SIGNAL_TYPES.TARGET.toLowerCase()) return;
  if (Notification.permission !== "granted") return;

  const ticker = normalizeTicker(alert?.ticker);
  const quote = state.quoteCache.get(ticker)?.data || {};
  const currentPrice = fmtCurrency(toNumber(quote.price, NaN));

  new Notification(`Alerta de venda: ${ticker}`, {
    body: `${alert.message} | Preco atual: ${currentPrice}`,
    tag: `sell-target-${ticker}`
  });
}

async function ensureNotificationPermissionPrompt() {
  if (!state.settings.notifySellTarget) return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "default") return;

  const alreadyPrompted = localStorage.getItem(STORAGE_KEYS.notifyPromptShown) === "1";
  if (alreadyPrompted) return;

  const wants = window.confirm(
    "Deseja ativar notificacoes do navegador para avisos de venda?\n\n" +
    "Ao aceitar, o app vai pedir permissao de notificacao no Windows/navegador."
  );

  localStorage.setItem(STORAGE_KEYS.notifyPromptShown, "1");
  if (!wants) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      window.alert(
        "Notificacoes nao foram ativadas. Para receber avisos, libere notificacoes para este site no navegador e no Windows."
      );
    }
  } catch {
    // ignore permission errors
  }
}

function ensureTickerAlert(ticker) {
  const cleanTicker = normalizeTicker(ticker);
  if (!cleanTicker) return;
  const exists = state.alerts.some((alert) => normalizeTicker(alert.ticker) === cleanTicker);
  if (exists) return;
  addAlert({
    ticker: cleanTicker,
    type: "monitorar",
    message: `${cleanTicker}: monitorar`,
    priority: "media"
  });
}

function isPositiveAnalystRecommendation(rec) {
  return normalizeAnalystRecommendation(rec) === "COMPRAR";
}

function getAnalystOpportunitySignal(ticker, quote, analyst) {
  const currentPrice = toNumber(quote?.price, NaN);
  const targetMean = toNumber(analyst?.targetMean, NaN);
  const analystsCount = toNumber(analyst?.analystsCount, 0);
  const upsidePct = calculateUpside(currentPrice, targetMean);

  const minUpsidePct = Math.max(5, toNumber(state.settings.opportunityMinUpsidePct, 25));
  const minAnalysts = Math.max(1, toNumber(state.settings.opportunityMinAnalysts, 5));
  const requireBuy = !!state.settings.opportunityRequireBuy;
  const recOk = !requireBuy || isPositiveAnalystRecommendation(analyst?.recommendation);

  if (!Number.isFinite(upsidePct) || !Number.isFinite(currentPrice) || !Number.isFinite(targetMean)) return null;
  if (!analyst?.available) return null;
  if (!recOk) return null;
  if (upsidePct < minUpsidePct) return null;
  if (analystsCount < minAnalysts) return null;

  return {
    ticker,
    type: "oportunidade analistas",
    message: `${ticker}: upside ${fmtPct(upsidePct)} | ${analystsCount} analistas`,
    priority: "alta"
  };
}

function syncPortfolioAlerts() {
  const tickers = [...new Set(state.portfolio.map((a) => normalizeTicker(a.ticker)).filter(Boolean))];
  const tickerSet = new Set(tickers);
  let dismissedChanged = false;
  let alertsChanged = false;

  const firstAlertByTicker = new Map();
  for (const alert of state.alerts) {
    const ticker = normalizeTicker(alert.ticker);
    if (!tickerSet.has(ticker)) {
      alertsChanged = true;
      continue;
    }
    if (!firstAlertByTicker.has(ticker)) {
      firstAlertByTicker.set(ticker, {
        ...alert,
        ticker
      });
    } else {
      // duplicate ticker alert dropped by design
      alertsChanged = true;
    }
  }

  const syncedAlerts = tickers.map((ticker) => {
    const existing = firstAlertByTicker.get(ticker);
    if (existing) return existing;
    alertsChanged = true;
    return {
      id: uid(),
      ticker,
      type: "monitorar",
      message: `${ticker}: monitorar`,
      priority: "media",
      createdAt: new Date().toISOString(),
      read: false
    };
  });

  if (alertsChanged || syncedAlerts.length !== state.alerts.length) {
    state.alerts = syncedAlerts;
    saveAlerts();
  }

  for (const ticker of tickers) {
    if (state.dismissedTickers[ticker]) {
      delete state.dismissedTickers[ticker];
      dismissedChanged = true;
    }
  }

  if (dismissedChanged) {
    saveDismissedTickers();
  }
}

function updateStatusLine() {
  const line = document.getElementById("statusLine");
  if (!line) return;

  if (state.isUpdating) {
    line.textContent = `Atualizando dados de mercado... | ${getCloudStatusText()}`;
    return;
  }

  if (!state.lastUpdatedAt) {
    line.textContent = `Aguardando primeira atualizacao | ${getCloudStatusText()}`;
    return;
  }

  line.textContent = `Ultima atualizacao: ${fmtDate(state.lastUpdatedAt)} | refresh ${Math.round(state.settings.autoRefreshMs / 1000)}s | ${getCloudStatusText()}`;
}

async function updateAllData() {
  if (state.isUpdating) return;
  state.isUpdating = true;
  updateStatusLine();

  try {
    syncPortfolioAlerts();
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
        const opportunitySignal = getAnalystOpportunitySignal(ticker, quote, analyst);
        if (opportunitySignal) {
          addAlert(opportunitySignal);
        }

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

    const finalSignal = getFinalSignal({
      status,
      upsidePct,
      pnlPct: pnl.pnlPct,
      technicalSellPrice,
      currentPrice,
      analystRecommendation: analyst.recommendation,
      analyst
    });

    const finalSignalReason = getFinalSignalReason({
      status,
      upsidePct,
      pnlPct: pnl.pnlPct,
      technicalSellPrice,
      currentPrice,
      analystRecommendation: analyst.recommendation,
      analyst
    });

    return {
      asset,
      quote,
      analyst,
      currentPrice,
      investedValue: pnl.invested,
      currentValue: pnl.current,
      pnlValue: pnl.pnl,
      pnlPct: pnl.pnlPct,
      upsidePct,
      technicalSellPrice,
      status,
      finalSignal,
      finalSignalReason
    };
  });
}

function getSummaryStats(rows) {
  const invested = rows.reduce((acc, row) => acc + row.investedValue, 0);
  const current = rows.reduce((acc, row) => acc + row.currentValue, 0);
  const pnl = current - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  const activeAlerts = state.alerts.length;

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
      const tone = row.finalSignal === "VENDER"
        ? "sell"
        : row.finalSignal === "COMPRAR"
          ? "buy"
          : row.finalSignal === "REDUZIR"
            ? "warn"
            : "hold";

      const buyMorePrice = toNumber(row.asset.buyMorePrice, NaN);
      const currentPriceClass = Number.isFinite(row.currentPrice) && Number.isFinite(buyMorePrice) && row.currentPrice <= buyMorePrice
        ? "positive"
        : "";
      const targetMean = toNumber(row.analyst.targetMean, NaN);
      const targetMeanClass = Number.isFinite(row.currentPrice) && Number.isFinite(targetMean)
        ? (targetMean > row.currentPrice ? "positive" : "negative")
        : "";
      const technicalSellClass = Number.isFinite(row.currentPrice) && Number.isFinite(row.technicalSellPrice)
        ? (row.currentPrice >= row.technicalSellPrice ? "warn-text" : "")
        : "";

      return `
        <tr class="portfolio-row tone-${tone}">
          <td class="mono">${escapeHtml(ticker)}</td>
          <td>${escapeHtml(row.asset.name || row.quote.name || ticker)}</td>
          <td>${fmtNumber(toNumber(row.asset.quantity), 0)}</td>
          <td>${fmtCurrency(toNumber(row.asset.avgPrice))}</td>
          <td class="${currentPriceClass}">${fmtCurrency(row.currentPrice)}</td>
          <td>${fmtCurrency(row.investedValue)}</td>
          <td>${fmtCurrency(row.currentValue)}</td>
          <td class="${row.pnlValue >= 0 ? "positive" : "negative"}">${fmtCurrency(row.pnlValue)}</td>
          <td class="${row.pnlPct >= 0 ? "positive" : "negative"}">${fmtPct(row.pnlPct)}</td>
          <td class="${currentPriceClass}">${fmtCurrency(toNumber(row.asset.buyMorePrice, NaN))}</td>
          <td class="${targetMeanClass}">${fmtCurrency(toNumber(row.analyst.targetMean, NaN))}</td>
          <td>${fmtCurrency(toNumber(row.analyst.targetMax, NaN))}</td>
          <td>${recommendationBadge(analystRec)}</td>
          <td class="${toNumber(row.upsidePct, 0) >= 0 ? "positive" : "negative"}">${fmtPct(row.upsidePct)}</td>
          <td class="${technicalSellClass}">${fmtCurrency(row.technicalSellPrice)}</td>
          <td>${statusBadge(row.status)}</td>
          <td>${finalSignalBadge(row.finalSignal, row.finalSignalReason)}</td>
          <td><button data-action="agent-explain-asset" data-id="${row.asset.id}">Agente</button></td>
          <td><button data-action="details-asset" data-id="${row.asset.id}">Detalhes</button></td>
          <td><button data-action="edit-asset" data-id="${row.asset.id}">Editar</button></td>
          <td><button class="danger" data-action="remove-asset" data-id="${row.asset.id}">Remover</button></td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Minha Carteira</h2>
    ${renderDecisionAgent(rows)}
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
            <th>Lucro/Prejuizo R$</th>
            <th>Lucro/Prejuizo %</th>
            <th>Preco comprar mais</th>
            <th>Preco-alvo analistas</th>
            <th>Alvo maximo analistas</th>
            <th>Recomendacao media</th>
            <th>Upside ate alvo %</th>
            <th>Preco tecnico venda</th>
            <th>Status</th>
            <th>Sinal final</th>
            <th>Agente</th>
            <th>Detalhes</th>
            <th>Editar</th>
            <th>Remover</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="21" class="empty">Nenhum ativo cadastrado.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function buildTop10AgentInsights() {
  return state.top10
    .map((item) => {
      const ticker = normalizeTicker(item.ticker);
      const quotePrice = toNumber(state.quoteCache.get(ticker)?.data?.price, NaN);
      const currentPrice = Number.isFinite(quotePrice) ? quotePrice : toNumber(item.currentPrice, NaN);
      const cachedAnalyst = state.analystCache.get(ticker)?.data || {};
      const targetMean = Number.isFinite(toNumber(cachedAnalyst.targetMean, NaN))
        ? toNumber(cachedAnalyst.targetMean, NaN)
        : toNumber(item.targetMean, NaN);
      const recommendation = String(cachedAnalyst.recommendation || item.recommendation || "").toLowerCase();
      const analystsCount = Math.max(toNumber(cachedAnalyst.analystsCount, 0), toNumber(item.analystsCount, 0));
      const upsidePct = calculateUpside(currentPrice, targetMean);
      const reasons = [];

      let score = 48;

      if (Number.isFinite(upsidePct)) {
        score += clamp((upsidePct - 8) * 1.05, -18, 42);
      } else {
        score -= 16;
        reasons.push("Upside indisponivel no momento.");
      }

      if (analystsCount >= 15) {
        score += 14;
        reasons.push("Cobertura forte de analistas para este ativo.");
      } else if (analystsCount >= 8) {
        score += 8;
        reasons.push("Cobertura razoavel de analistas.");
      } else {
        score -= 5;
        reasons.push("Poucos analistas cobrindo o ativo.");
      }

      if (recommendation.includes("strong buy")) {
        score += 18;
        reasons.push("Consenso de analistas em compra forte.");
      } else if (isPositiveAnalystRecommendation(recommendation)) {
        score += 12;
        reasons.push("Consenso de analistas com viés comprador.");
      } else if (recommendation.includes("sell") || recommendation.includes("under")) {
        score -= 14;
        reasons.push("Consenso atual indica cautela para compra.");
      } else if (recommendation.includes("hold")) {
        reasons.push("Analistas sugerem manutencao no curto prazo.");
      }

      if (Number.isFinite(currentPrice) && Number.isFinite(targetMean) && currentPrice > targetMean) {
        score -= 12;
        reasons.push("Preco atual acima do alvo medio reduz atratividade.");
      }

      score = Math.round(clamp(score, 0, 100));

      let action = "OBSERVAR";
      if (score >= 75) {
        action = "COMPRAR";
      } else if (score >= 60) {
        action = "MONITORAR COMPRA";
      } else if (score < 45) {
        action = "EVITAR ENTRADA";
      }

      return {
        ticker,
        company: item.company,
        currentPrice,
        targetMean,
        upsidePct,
        analystsCount,
        recommendation,
        score,
        action,
        reasons: reasons.slice(0, 3)
      };
    })
    .sort((a, b) => b.score - a.score);
}

function renderTop10AgentWidget() {
  const insights = buildTop10AgentInsights();

  if (!insights.length) {
    return `
      <section class="top10-agent">
        <h3>Agente Orion | Top 10</h3>
        <p class="muted-text">Sem dados suficientes para gerar recomendacoes no momento.</p>
      </section>
    `;
  }

  const buyCandidates = insights.filter((item) => item.action === "COMPRAR" || item.action === "MONITORAR COMPRA").slice(0, 3);
  const lead = buyCandidates[0] || insights[0];
  const leadReason = lead.reasons[0] || "Sinal tecnico e fundamental equilibrado para observacao.";

  const listHtml = buyCandidates.length
    ? buyCandidates.map((item) => `
        <li>
          <strong>${escapeHtml(item.ticker)}</strong> | Score ${item.score} | ${item.action}
          <div class="muted-text">${escapeHtml(item.reasons[0] || "Motivo nao disponivel")}</div>
        </li>
      `).join("")
    : '<li class="muted-text">Nenhum ticker com compra forte agora; manter monitoramento.</li>';

  return `
    <section class="top10-agent">
      <div class="top10-agent-head">
        <h3>Agente Orion | Top 10</h3>
        <span class="badge hold">Foco em entrada</span>
      </div>
      <p class="top10-agent-headline">Sugestao principal: <strong>${escapeHtml(lead.ticker)}</strong> (${lead.action}) | score ${lead.score}</p>
      <p class="muted-text">Motivo-chave: ${escapeHtml(leadReason)}</p>
      <ul class="top10-agent-list">${listHtml}</ul>
    </section>
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
          <td><button data-action="top10-agent-explain" data-ticker="${item.ticker}">Agente</button></td>
          <td><button data-action="add-top10-watchlist" data-ticker="${item.ticker}">Adicionar</button></td>
          <td><button class="primary" data-action="add-top10-portfolio" data-ticker="${item.ticker}">Adicionar</button></td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Top 10 Analistas</h2>
    ${renderTop10AgentWidget()}
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
            <th>Agente</th>
            <th>Adicionar a watchlist</th>
            <th>Adicionar a carteira</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="12" class="empty">Nenhum dado de top 10 no momento.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function registerSaleFromPortfolio(assetIdOrTicker, quantityInput, salePriceInput, options = {}) {
  const quantity = Math.floor(toNumber(quantityInput, 0));
  const salePrice = toNumber(salePriceInput, NaN);
  const tickerOrId = String(assetIdOrTicker || "").trim();

  const asset = state.portfolio.find((item) => item.id === tickerOrId)
    || state.portfolio.find((item) => normalizeTicker(item.ticker) === normalizeTicker(tickerOrId));

  if (!asset) {
    throw new Error("Ativo nao encontrado na carteira para registrar venda.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantidade de venda invalida.");
  }

  const currentQty = Math.floor(toNumber(asset.quantity, 0));
  if (quantity > currentQty) {
    throw new Error("Quantidade de venda maior que a posicao disponivel.");
  }

  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    throw new Error("Preco de venda invalido.");
  }

  const avgCost = toNumber(asset.avgPrice, 0);
  const proceeds = quantity * salePrice;
  const costBasis = quantity * avgCost;
  const pnlValue = proceeds - costBasis;
  const pnlPct = costBasis > 0 ? (pnlValue / costBasis) * 100 : 0;
  const date = String(options.date || new Date().toISOString().slice(0, 10));

  state.salesHistory.unshift({
    id: uid(),
    ticker: normalizeTicker(asset.ticker),
    assetName: asset.name || normalizeTicker(asset.ticker),
    quantity,
    salePrice,
    avgCost,
    proceeds,
    costBasis,
    pnlValue,
    pnlPct,
    date,
    note: String(options.note || "").trim(),
    source: options.source || "manual",
    createdAt: new Date().toISOString()
  });

  if (state.salesHistory.length > 500) {
    state.salesHistory = state.salesHistory.slice(0, 500);
  }

  const nextQty = currentQty - quantity;
  if (nextQty <= 0) {
    state.portfolio = state.portfolio.filter((item) => item.id !== asset.id);
  } else {
    asset.quantity = nextQty;
    asset.updatedAt = new Date().toISOString();
  }

  syncPortfolioAlerts();
  savePortfolio();
  saveSalesHistory();
}

function renderSalesPanel() {
  const panel = document.getElementById("panel-sales");
  if (!panel) return;

  const options = state.portfolio
    .slice()
    .sort((a, b) => normalizeTicker(a.ticker).localeCompare(normalizeTicker(b.ticker)))
    .map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(normalizeTicker(asset.ticker))} - ${escapeHtml(asset.name || "Sem nome")} (Qtd ${fmtNumber(toNumber(asset.quantity), 0)})</option>`)
    .join("");

  const totalPnl = state.salesHistory.reduce((acc, item) => acc + toNumber(item.pnlValue, 0), 0);
  const totalProceeds = state.salesHistory.reduce((acc, item) => acc + toNumber(item.proceeds, 0), 0);
  const totalCost = state.salesHistory.reduce((acc, item) => acc + toNumber(item.costBasis, 0), 0);

  const rowsHtml = state.salesHistory
    .map((sale) => `
      <tr>
        <td>${fmtDate(sale.date)}</td>
        <td class="mono">${escapeHtml(sale.ticker)}</td>
        <td>${fmtNumber(toNumber(sale.quantity), 0)}</td>
        <td>${fmtCurrency(toNumber(sale.avgCost, NaN))}</td>
        <td>${fmtCurrency(toNumber(sale.salePrice, NaN))}</td>
        <td>${fmtCurrency(toNumber(sale.costBasis, NaN))}</td>
        <td>${fmtCurrency(toNumber(sale.proceeds, NaN))}</td>
        <td class="${toNumber(sale.pnlValue, 0) >= 0 ? "positive" : "negative"}">${fmtCurrency(toNumber(sale.pnlValue, NaN))}</td>
        <td class="${toNumber(sale.pnlPct, 0) >= 0 ? "positive" : "negative"}">${fmtPct(toNumber(sale.pnlPct, NaN))}</td>
        <td>${escapeHtml(sale.note || "-")}</td>
        <td><button class="danger" data-action="remove-sale-record" data-id="${sale.id}">Remover</button></td>
      </tr>
    `)
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Vendas</h2>

    <section class="cards" style="margin-top:0;margin-bottom:10px">
      <article class="card">
        <div class="card-label">Total vendido</div>
        <div class="card-value">${fmtCurrency(totalProceeds)}</div>
      </article>
      <article class="card">
        <div class="card-label">Custo das vendas</div>
        <div class="card-value">${fmtCurrency(totalCost)}</div>
      </article>
      <article class="card">
        <div class="card-label">Resultado realizado</div>
        <div class="card-value ${totalPnl >= 0 ? "positive" : "negative"}">${fmtCurrency(totalPnl)}</div>
      </article>
      <article class="card">
        <div class="card-label">Qtd de vendas</div>
        <div class="card-value">${fmtNumber(state.salesHistory.length, 0)}</div>
      </article>
    </section>

    <form id="salesForm">
      <div class="form-grid">
        <div class="field span-2">
          <label>Ativo em carteira</label>
          <select name="assetId" required>
            <option value="">Selecione...</option>
            ${options}
          </select>
        </div>
        <div class="field">
          <label>Data da venda</label>
          <input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required />
        </div>
        <div class="field">
          <label>Quantidade vendida</label>
          <input name="quantity" type="number" min="1" step="1" required />
        </div>
        <div class="field">
          <label>Preco de venda</label>
          <input name="salePrice" type="number" min="0.01" step="0.01" required />
        </div>
        <div class="field span-2">
          <label>Observacao (opcional)</label>
          <input name="note" placeholder="Ex: realizacao parcial apos alvo" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" type="submit">Registrar venda</button>
      </div>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Ticker</th>
            <th>Qtd</th>
            <th>Custo medio</th>
            <th>Preco venda</th>
            <th>Custo total</th>
            <th>Valor venda</th>
            <th>Lucro/Prejuizo R$</th>
            <th>Lucro/Prejuizo %</th>
            <th>Obs</th>
            <th>Acao</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="11" class="empty">Nenhuma venda registrada.</td></tr>'}
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

function alertTone(type) {
  const t = String(type || "").toLowerCase();

  if (
    t === SELL_SIGNAL_TYPES.TARGET.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.TRAILING.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.STOP_LOSS.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.VOLUME_DROP.toLowerCase()
  ) return "sell";

  if (t === "recompra atingida" || t === "oportunidade analistas") return "buy";

  if (
    t === SELL_SIGNAL_TYPES.RSI.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.TREND.toLowerCase() ||
    t === SELL_SIGNAL_TYPES.ANALYST_NEAR_TARGET.toLowerCase()
  ) return "warn";

  return "hold";
}

function getSignalMeaning(type) {
  const t = String(type || "").toLowerCase();

  if (t === SELL_SIGNAL_TYPES.RSI.toLowerCase()) {
    return "RSI extremo: o ativo pode estar esticado no curto prazo, com chance maior de correcao ou consolidacao.";
  }

  if (t === SELL_SIGNAL_TYPES.TREND.toLowerCase()) {
    return "Perda de tendencia: o preco perdeu forca da tendencia principal (ex.: abaixo da media), exigindo mais cautela.";
  }

  if (t === SELL_SIGNAL_TYPES.TARGET.toLowerCase()) {
    return "Preco-alvo atingido: o preco chegou no alvo de venda definido para a posicao.";
  }

  if (t === SELL_SIGNAL_TYPES.TRAILING.toLowerCase()) {
    return "Trailing stop acionado: apos uma maxima, o preco recuou alem do limite de protecao configurado.";
  }

  if (t === SELL_SIGNAL_TYPES.STOP_LOSS.toLowerCase()) {
    return "Stop loss acionado: o preco caiu abaixo do limite de perda definido para proteger o capital.";
  }

  if (t === SELL_SIGNAL_TYPES.VOLUME_DROP.toLowerCase()) {
    return "Queda com volume: o ativo caiu com volume acima da media, sugerindo pressao vendedora mais forte.";
  }

  if (t === SELL_SIGNAL_TYPES.ANALYST_NEAR_TARGET.toLowerCase()) {
    return "Proximo do alvo dos analistas: preco atual perto do alvo medio, com potencial de alta mais limitado.";
  }

  if (t === "recompra atingida") {
    return "Recompra atingida: o preco chegou na faixa que voce definiu para aumentar posicao.";
  }

  if (t === "oportunidade analistas") {
    return "Oportunidade analistas: upside atrativo com cobertura de analistas e recomendacao favoravel.";
  }

  if (t === "monitorar") {
    return "Monitorar: ticker acompanhado sem gatilho critico no momento.";
  }

  return "Sinal de monitoramento do agente para apoiar sua decisao.";
}

function alertTypeBadge(type) {
  const tone = alertTone(type);
  const cls = tone === "sell" ? "sell" : tone === "buy" ? "buy" : tone === "warn" ? "warn" : "hold";
  const meaning = getSignalMeaning(type);
  return `<span class="badge ${cls}" title="${escapeHtml(meaning)}">${escapeHtml(type || "-")}</span>`;
}

function renderAlertsPanel() {
  const panel = document.getElementById("panel-alerts");
  if (!panel) return;

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
      const buyMorePrice = asset ? toNumber(asset.buyMorePrice, NaN) : NaN;
      const tone = alertTone(alert.type);

      const buyOpportunity = Number.isFinite(currentPrice) && Number.isFinite(buyMorePrice) && currentPrice <= buyMorePrice;
      const targetReached = Number.isFinite(currentPrice) && Number.isFinite(targetMean) && currentPrice >= targetMean;
      const currentPriceClass = buyOpportunity ? "positive" : targetReached ? "warn-text" : "";
      const targetMeanClass = Number.isFinite(currentPrice) && Number.isFinite(targetMean)
        ? (targetMean > currentPrice ? "positive" : "negative")
        : "";

      return `
        <tr class="alert-row tone-${tone}">
          <td class="mono">${escapeHtml(ticker)}</td>
          <td>${alertPriorityBadge(alert.priority)}</td>
          <td>${alertTypeBadge(alert.type)}</td>
          <td>${escapeHtml(alert.message)}</td>
          <td class="${currentPriceClass}">${fmtCurrency(currentPrice)}</td>
          <td class="${targetMeanClass}">${Number.isFinite(targetMean) ? fmtCurrency(targetMean) : "-"}</td>
          <td>${Number.isFinite(targetMax) ? fmtCurrency(targetMax) : "-"}</td>
          <td class="${toNumber(upside, 0) >= 0 ? "positive" : "negative"}">${fmtPct(upside)}</td>
          <td>${recBadge}</td>
          <td>${analystCount > 0 ? analystCount + " analistas" : "-"}</td>
          <td class="${buyOpportunity ? "positive" : ""}">${Number.isFinite(buyMorePrice) ? fmtCurrency(buyMorePrice) : "-"}</td>
          <td>${fmtDate(alert.createdAt)}</td>
          <td>
            <button class="danger" data-action="remove-alert-ticker" data-ticker="${escapeHtml(ticker)}">Remover acao</button>
          </td>
        </tr>
      `;
    })
    .join("");

  panel.innerHTML = `
    <h2 class="panel-title">Alertas</h2>
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
    <div class="legend-box" style="margin-top:10px">
      <strong style="display:block;margin-bottom:6px">Legenda dos sinais</strong>
      <div class="toolbar-note">RSI extremo: indicador em faixa de sobrecompra/sobrevenda, sugerindo movimento esticado.</div>
      <div class="toolbar-note">Perda de tendencia: preco perdeu forca da tendencia principal (ex.: abaixo da media).</div>
      <div class="toolbar-note">Preco-alvo atingido: preco atual chegou no alvo de venda definido.</div>
      <div class="toolbar-note">Trailing stop acionado: preco recuou mais que o limite apos renovar maxima.</div>
      <div class="toolbar-note">Stop loss acionado: preco caiu abaixo do limite de protecao.</div>
      <div class="toolbar-note">Queda com volume: queda relevante com volume acima da media recente.</div>
      <div class="toolbar-note">Recompra atingida: preco chegou na faixa para comprar mais definida na carteira.</div>
      <div class="toolbar-note">Oportunidade analistas: alto upside com cobertura/recomendacao favoravel de analistas.</div>
      <div class="toolbar-note">Monitorar: alerta de acompanhamento geral do ticker.</div>
    </div>
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

  const cloudStatus = escapeHtml(getCloudStatusText());
  const accountEmail = escapeHtml(state.session.user?.email || "");

  panel.innerHTML = `
    <h2 class="panel-title">Configuracoes</h2>
    <p class="toolbar-note">
      A camada de dados esta pronta para backend/API premium. Se endpoints de analistas nao estiverem disponiveis,
      a aplicacao continua funcionando sem quebrar.
    </p>

    <div class="panel-section">
      <h3>Conta e nuvem</h3>
      <p class="toolbar-note">Use a mesma conta em outra maquina para puxar os mesmos dados salvos no banco em nuvem.</p>
      <p class="toolbar-note">Status atual: ${cloudStatus}</p>
      <form id="cloudAuthForm">
        <div class="form-grid">
          <div class="field span-2">
            <label>E-mail da conta</label>
            <input name="cloudEmail" type="email" placeholder="voce@exemplo.com" value="${accountEmail}" />
          </div>
          <div class="field span-2">
            <label>Senha</label>
            <input name="cloudPassword" type="password" placeholder="Sua senha da conta" />
          </div>
          <div class="field span-2">
            <label style="display:flex;align-items:center;gap:8px">
              <input name="cloudAutoSync" type="checkbox" ${state.settings.cloudAutoSync ? "checked" : ""} />
              Sincronizar automaticamente apos alteracoes locais
            </label>
          </div>
        </div>
        <div class="actions">
          <button class="primary" type="button" id="btnCloudRegister">Criar conta</button>
          <button type="button" id="btnCloudLogin">Entrar</button>
          <button type="button" id="btnCloudLogout">Sair</button>
          <button type="button" id="btnCloudSyncNow">Sincronizar agora</button>
        </div>
      </form>
    </div>

    <form id="settingsForm">
      <div class="form-grid">
        <div class="field span-2">
          <label>URL base backend/API</label>
          <input name="apiBaseUrl" placeholder="Vazio = mesma URL do site publicado" value="${escapeHtml(state.settings.apiBaseUrl)}" />
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
        <div class="field span-2">
          <label style="display:flex;align-items:center;gap:8px">
            <input name="notifySellTarget" type="checkbox" ${state.settings.notifySellTarget ? "checked" : ""} />
            Notificar quando atingir preco esperado de venda
          </label>
        </div>
        <div class="field">
          <label>Upside minimo para oportunidade (%)</label>
          <input name="opportunityMinUpsidePct" type="number" min="5" step="1" value="${toNumber(state.settings.opportunityMinUpsidePct, 25)}" />
        </div>
        <div class="field">
          <label>Minimo de analistas</label>
          <input name="opportunityMinAnalysts" type="number" min="1" step="1" value="${toNumber(state.settings.opportunityMinAnalysts, 5)}" />
        </div>
        <div class="field span-2">
          <label style="display:flex;align-items:center;gap:8px">
            <input name="opportunityRequireBuy" type="checkbox" ${state.settings.opportunityRequireBuy ? "checked" : ""} />
            Exigir recomendacao favoravel (compra/outperform)
          </label>
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
  renderSalesPanel();
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
    sales: "panel-sales",
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

      delete state.dismissedTickers[ticker];
      saveDismissedTickers();
      ensureTickerAlert(ticker);

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

      delete state.dismissedTickers[ticker];
      saveDismissedTickers();

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
      state.settings.cloudAutoSync = fd.get("cloudAutoSync") === "on" ? true : state.settings.cloudAutoSync;
      state.settings.notifySellTarget = fd.get("notifySellTarget") === "on";
      state.settings.opportunityMinUpsidePct = Math.max(5, toNumber(fd.get("opportunityMinUpsidePct"), 25));
      state.settings.opportunityMinAnalysts = Math.max(1, toNumber(fd.get("opportunityMinAnalysts"), 5));
      state.settings.opportunityRequireBuy = fd.get("opportunityRequireBuy") === "on";

      if (state.settings.notifySellTarget && typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }

      saveSettings();
      resetAutoRefresh();
      updateStatusLine();
      window.alert("Configuracoes salvas.");
    };
  }

  const cloudAuthForm = document.getElementById("cloudAuthForm");
  if (cloudAuthForm) {
    const cloudAutoSyncInput = cloudAuthForm.querySelector('input[name="cloudAutoSync"]');
    if (cloudAutoSyncInput) {
      cloudAutoSyncInput.onchange = () => {
        state.settings.cloudAutoSync = cloudAutoSyncInput.checked;
        saveSettings();
        updateStatusLine();
      };
    }

    const getCredentials = () => {
      const fd = new FormData(cloudAuthForm);
      const email = String(fd.get("cloudEmail") || "").trim();
      const password = String(fd.get("cloudPassword") || "").trim();
      state.settings.cloudAutoSync = fd.get("cloudAutoSync") === "on";
      saveSettings();
      return { email, password };
    };

    const btnCloudRegister = document.getElementById("btnCloudRegister");
    if (btnCloudRegister) {
      btnCloudRegister.onclick = async () => {
        const { email, password } = getCredentials();

        if (!email || !password) {
          window.alert("Informe e-mail e senha para criar a conta.");
          return;
        }

        try {
          await registerCloudAccount(email, password);
          await syncLegacyCloudData(false);
          render();
          updateStatusLine();
          window.alert("Conta criada e dados locais enviados para a nuvem.");
        } catch (error) {
          window.alert(error.message || "Falha ao criar conta.");
        }
      };
    }

    const btnCloudLogin = document.getElementById("btnCloudLogin");
    if (btnCloudLogin) {
      btnCloudLogin.onclick = async () => {
        const { email, password } = getCredentials();

        if (!email || !password) {
          window.alert("Informe e-mail e senha para entrar.");
          return;
        }

        try {
          await loginCloudAccount(email, password);
          const loaded = await loadLegacyCloudData();
          if (!loaded) {
            await syncLegacyCloudData(false);
          }
          render();
          updateStatusLine();
          window.alert(loaded ? "Conta conectada e dados carregados da nuvem." : "Conta conectada. Seu backup em nuvem foi iniciado.");
        } catch (error) {
          window.alert(error.message || "Falha ao entrar.");
        }
      };
    }

    const btnCloudLogout = document.getElementById("btnCloudLogout");
    if (btnCloudLogout) {
      btnCloudLogout.onclick = () => {
        clearAuthSession();
        render();
        updateStatusLine();
        window.alert("Sessao encerrada neste navegador.");
      };
    }

    const btnCloudSyncNow = document.getElementById("btnCloudSyncNow");
    if (btnCloudSyncNow) {
      btnCloudSyncNow.onclick = () => {
        const { cloudAutoSync } = Object.fromEntries(new FormData(cloudAuthForm).entries());
        state.settings.cloudAutoSync = cloudAutoSync === "on";
        saveSettings();
        syncLegacyCloudData(true);
      };
    }
  }

  const panelPortfolio = document.getElementById("panel-portfolio");
  if (panelPortfolio) {
    panelPortfolio.querySelectorAll("button[data-action]").forEach((button) => {
      button.onclick = async () => {
        const action = button.dataset.action;

        if (action === "agent-radar-score") {
          const nextScore = Math.round(clamp(toNumber(button.dataset.score, 60), 0, 100));
          state.settings.radarMinScore = nextScore;
          saveSettings();
          render();
          return;
        }

        const id = button.dataset.id;
        const asset = state.portfolio.find((a) => a.id === id);
        if (!asset) return;

        if (action === "agent-explain-asset") {
          const row = getComputedPortfolioRows().find((item) => item.asset.id === id);
          if (!row) return;

          const decision = buildAgentDecision(row);
          const reasonsText = decision.reasons.length
            ? decision.reasons.map((reason, index) => `${index + 1}. ${reason}`).join("\n")
            : "Sem sinais fortes no momento.";

          window.alert(
            [
              `Agente Orion | ${decision.ticker}`,
              `Sinal final: ${decision.finalSignal}`,
              `Acao sugerida: ${decision.action}`,
              `Motivo chave: ${decision.finalSignalReason}`,
              `Confianca: ${decision.confidence}%`,
              `Risco atual: ${decision.riskLevel}`,
              "",
              "Principais motivos:",
              reasonsText,
              "",
              "Aviso: suporte a decisao. Confirmacao final e sempre sua."
            ].join("\n")
          );
          return;
        }

        if (action === "agent-buy-more") {
          const basePrice = state.quoteCache.get(normalizeTicker(asset.ticker))?.data?.price;
          const qty = promptNumber(`Quantidade a comprar de ${asset.ticker}:`, "1");
          if (qty === null) return;
          if (!Number.isFinite(qty) || qty <= 0) {
            window.alert("Quantidade invalida.");
            return;
          }

          const price = promptNumber("Preco unitario da compra:", Number.isFinite(basePrice) ? String(Number(basePrice).toFixed(2)) : String(toNumber(asset.avgPrice, 0)));
          if (price === null) return;
          if (!Number.isFinite(price) || price <= 0) {
            window.alert("Preco unitario invalido.");
            return;
          }

          const buyQty = Math.floor(qty);
          if (buyQty <= 0) {
            window.alert("Use quantidade inteira maior que zero.");
            return;
          }

          const currentQty = Math.floor(toNumber(asset.quantity, 0));
          const currentAvg = toNumber(asset.avgPrice, 0);
          const nextQty = currentQty + buyQty;
          const nextAvg = ((currentQty * currentAvg) + (buyQty * price)) / nextQty;

          asset.quantity = nextQty;
          asset.avgPrice = Number(nextAvg.toFixed(4));
          asset.updatedAt = new Date().toISOString();

          savePortfolio();
          render();
          await updateAllData();
          return;
        }

        if (action === "agent-sell-part") {
          const currentQty = Math.floor(toNumber(asset.quantity, 0));
          if (currentQty <= 1) {
            window.alert("Ativo com apenas 1 unidade. Use 'Zerar posicao'.");
            return;
          }

          const suggested = Math.max(1, Math.floor(currentQty / 2));
          const qty = promptNumber(`Quantidade a vender de ${asset.ticker} (maximo ${currentQty - 1}):`, String(suggested));
          if (qty === null) return;
          const sellQty = Math.floor(qty);

          if (!Number.isFinite(sellQty) || sellQty <= 0 || sellQty >= currentQty) {
            window.alert("Quantidade invalida para venda parcial.");
            return;
          }

          const quotePrice = toNumber(state.quoteCache.get(normalizeTicker(asset.ticker))?.data?.price, NaN);
          const defaultPrice = Number.isFinite(quotePrice) ? String(Number(quotePrice).toFixed(2)) : String(toNumber(asset.avgPrice, 0));
          const salePrice = promptNumber(`Preco unitario da venda de ${asset.ticker}:`, defaultPrice);
          if (salePrice === null) return;
          if (!Number.isFinite(salePrice) || salePrice <= 0) {
            window.alert("Preco de venda invalido.");
            return;
          }

          try {
            registerSaleFromPortfolio(asset.id, sellQty, salePrice, {
              note: "Venda parcial via agente",
              source: "agent"
            });
          } catch (error) {
            window.alert(error.message || "Falha ao registrar venda parcial.");
            return;
          }

          render();
          await updateAllData();
          return;
        }

        if (action === "agent-sell-all") {
          const confirmed = window.confirm(`Confirmar zeragem total de ${asset.ticker}?`);
          if (!confirmed) return;

          const quotePrice = toNumber(state.quoteCache.get(normalizeTicker(asset.ticker))?.data?.price, NaN);
          const defaultPrice = Number.isFinite(quotePrice) ? String(Number(quotePrice).toFixed(2)) : String(toNumber(asset.avgPrice, 0));
          const salePrice = promptNumber(`Preco unitario para zerar ${asset.ticker}:`, defaultPrice);
          if (salePrice === null) return;
          if (!Number.isFinite(salePrice) || salePrice <= 0) {
            window.alert("Preco de venda invalido.");
            return;
          }

          try {
            registerSaleFromPortfolio(asset.id, Math.floor(toNumber(asset.quantity, 0)), salePrice, {
              note: "Zeragem via agente",
              source: "agent"
            });
          } catch (error) {
            window.alert(error.message || "Falha ao zerar posicao.");
            return;
          }

          render();
          await updateAllData();
          return;
        }

        if (action === "remove-asset") {
          state.portfolio = state.portfolio.filter((a) => a.id !== id);
          savePortfolio();
          if (state.portfolio.length === 0) {
            localStorage.setItem(STORAGE_KEYS.portfolioLastGood, "[]");
          }
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
          const row = getComputedPortfolioRows().find((item) => item.asset.id === id);
          if (!row) return;

          const ticker = normalizeTicker(row.asset.ticker);
          const historical = state.historicalCache.get(ticker)?.data || [];
          const sma50 = calculateSMA(historical, 50);
          const rsi = calculateRSI(historical, 14);

          window.alert(
            [
              `Ticker: ${ticker}`,
              `Preco atual: ${fmtCurrency(toNumber(row.currentPrice, NaN))}`,
              `SMA50: ${fmtCurrency(toNumber(sma50, NaN))}`,
              `RSI14: ${fmtNumber(toNumber(rsi, NaN), 2)}`,
              `Alvo analistas: ${fmtCurrency(toNumber(row.analyst?.targetMean, NaN))}`,
              `Recomendacao: ${row.analyst?.available ? String(row.analyst.recommendation || "").toUpperCase() : "indisponivel"}`,
              `Status tecnico: ${row.status}`,
              `Sinal final: ${row.finalSignal}`,
              `Motivo: ${row.finalSignalReason}`,
              `Observacoes: ${row.asset.notes || "-"}`
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

        if (action === "top10-agent-explain") {
          const insight = buildTop10AgentInsights().find((item) => item.ticker === ticker);
          if (!insight) return;

          const reasonsText = insight.reasons.length
            ? insight.reasons.map((reason, index) => `${index + 1}. ${reason}`).join("\n")
            : "Sem motivos detalhados no momento.";

          window.alert(
            [
              `Agente Orion | ${insight.ticker}`,
              `Acao sugerida: ${insight.action}`,
              `Score: ${insight.score}/100`,
              `Preco atual: ${fmtCurrency(insight.currentPrice)}`,
              `Preco-alvo medio: ${fmtCurrency(insight.targetMean)}`,
              `Upside: ${fmtPct(insight.upsidePct)}`,
              `Cobertura: ${fmtNumber(insight.analystsCount, 0)} analistas`,
              "",
              "Motivos:",
              reasonsText,
              "",
              "Aviso: suporte a decisao, nao substitui sua avaliacao final."
            ].join("\n")
          );
          return;
        }

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
    panelAlerts.querySelectorAll("button[data-action='remove-alert-ticker']").forEach((button) => {
      button.onclick = () => {
        const ticker = normalizeTicker(button.dataset.ticker);
        if (!ticker) return;
        const confirmRemove = window.confirm(`Remover ${ticker} apenas dos alertas?`);
        if (!confirmRemove) return;

        state.alerts = state.alerts.filter((a) => normalizeTicker(a.ticker) !== ticker);
        state.dismissedTickers[ticker] = new Date().toISOString();

        saveAlerts();
        saveDismissedTickers();
        render();
      };
    });

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
        const clean = normalizeTicker(ticker);
        delete state.dismissedTickers[clean];
        saveDismissedTickers();
        addAlert({
          ticker: clean,
          type,
          message: message || `${clean}: ${type}`,
          priority
        });
        addAlertForm.reset();
        render();
        // Fetch market data for this ticker immediately if not cached
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

  const panelSales = document.getElementById("panel-sales");
  if (panelSales) {
    const salesForm = document.getElementById("salesForm");
    if (salesForm) {
      salesForm.onsubmit = async (event) => {
        event.preventDefault();
        const fd = new FormData(salesForm);
        const assetId = String(fd.get("assetId") || "").trim();
        const quantity = toNumber(fd.get("quantity"), 0);
        const salePrice = toNumber(fd.get("salePrice"), 0);
        const date = String(fd.get("date") || "").trim();
        const note = String(fd.get("note") || "").trim();

        try {
          registerSaleFromPortfolio(assetId, quantity, salePrice, {
            date,
            note,
            source: "manual"
          });
        } catch (error) {
          window.alert(error.message || "Falha ao registrar venda.");
          return;
        }

        salesForm.reset();
        render();
        await updateAllData();
      };
    }

    panelSales.querySelectorAll("button[data-action='remove-sale-record']").forEach((button) => {
      button.onclick = () => {
        const id = button.dataset.id;
        if (!id) return;
        if (!window.confirm("Remover este registro de venda do historico?")) return;
        state.salesHistory = state.salesHistory.filter((item) => item.id !== id);
        saveSalesHistory();
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
  loadSalesHistory();
  loadWatchlist();
  loadAlerts();
  loadSettings();
  loadAuthToken();
  loadTrailingHighs();
  loadDismissedTickers();
  syncPortfolioAlerts();

  createAppLayout();
  render();
  updateStatusLine();

  const restored = await restoreCloudSession();
  if (restored) {
    await loadLegacyCloudData();
    render();
    updateStatusLine();
  }

  await ensureNotificationPermissionPrompt();

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
