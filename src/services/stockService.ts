import { StockItem, StockMaster, TimeRange, PricePoint } from '../types';
import { STOCK_MASTER_LIST } from '../data/stocksMaster';
import { MOCK_STOCKS } from '../data/mockStocks';

export interface KRXClientStock {
  date: string;
  dateFormatted: string;
  code: string;
  name: string;
  market: string;
  securityType: string;
  close: number;
  change: number;
  changeRate: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  tradingValue: number;
  marketCap: number;
  marketCapFormatted?: string;
  listedShares: number;
  isLive: boolean;
}

export interface KRXStatusResponse {
  isConfigured: boolean;
  isLive: boolean;
  baseDate: string;
  baseDateFormatted: string;
  kospiCount: number;
  kosdaqCount: number;
  totalCount: number;
}

const RECENT_SEARCHES_KEY = 'ai_invest_recent_searches';

// In-memory cache for live KRX StockItems loaded from server
const krxLiveStockCache = new Map<string, StockItem>();

// Helper to generate consistent synthetic chart data for stocks without pre-baked charts
export function generateSyntheticChartData(basePrice: number, volatility: number, trend: number): Record<TimeRange, PricePoint[]> {
  const ranges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
  const counts: Record<TimeRange, number> = {
    '1D': 30,
    '1W': 7,
    '1M': 22,
    '3M': 60,
    '1Y': 52,
    '5Y': 60,
  };

  const chartData: Partial<Record<TimeRange, PricePoint[]>> = {};

  ranges.forEach(range => {
    const points: PricePoint[] = [];
    const count = counts[range];
    let current = basePrice * (1 - trend * 0.3);
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const delta = (Math.sin(i * 0.4) * 0.5 + (Math.random() - 0.48) + trend * 0.1) * volatility * current;
      const open = Math.round(current);
      const close = Math.round(current + delta);
      const high = Math.round(Math.max(open, close) + Math.random() * volatility * 0.4 * current);
      const low = Math.round(Math.min(open, close) - Math.random() * volatility * 0.4 * current);
      const volume = Math.round(20000 + Math.random() * 150000);

      const d = new Date(now.getTime() - (count - i) * (range === '1D' ? 5 * 60 * 1000 : range === '1W' ? 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000));
      points.push({
        date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
        time: range === '1D' ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : undefined,
        open,
        high,
        low,
        close,
        volume,
      });
      current = close;
    }
    chartData[range] = points;
  });

  return chartData as Record<TimeRange, PricePoint[]>;
}

// 0. Fetch KRX status
export async function fetchKrxStatus(): Promise<KRXStatusResponse | null> {
  try {
    const res = await fetch('/api/krx/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch /api/krx/status:', err);
  }
  return null;
}

// 1. Fetch Spotlight Stocks from Server (with 100% KRX live prices for domestic stocks)
export async function fetchSpotlightStocks(): Promise<{ stocks: StockItem[]; isLive: boolean; baseDateFormatted: string }> {
  try {
    const res = await fetch('/api/krx/spotlight');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.stocks) && data.stocks.length > 0) {
        data.stocks.forEach((s: StockItem) => {
          krxLiveStockCache.set(s.code.toUpperCase(), s);
        });
        return {
          stocks: data.stocks,
          isLive: !!data.isLive,
          baseDateFormatted: data.baseDateFormatted || '거래일 기준',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch /api/krx/spotlight, using fallback:', err);
  }

  return {
    stocks: MOCK_STOCKS,
    isLive: false,
    baseDateFormatted: '2026.09.28 거래일 기준',
  };
}

// 2. Fetch Market Movers (Top Gainers, Losers, Volume) from KRX
export async function fetchMarketMovers(): Promise<{
  topGainers: StockItem[];
  topLosers: StockItem[];
  topVolume: StockItem[];
  isLive: boolean;
}> {
  try {
    const res = await fetch('/api/krx/market-movers');
    if (res.ok) {
      const data = await res.json();
      return {
        topGainers: data.topGainers || [],
        topLosers: data.topLosers || [],
        topVolume: data.topVolume || [],
        isLive: !!data.isLive,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch /api/krx/market-movers:', err);
  }

  // Fallback to MOCK_STOCKS sorting
  const gainers = [...MOCK_STOCKS].sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);
  const losers = [...MOCK_STOCKS].sort((a, b) => a.changeRate - b.changeRate).slice(0, 5);
  const volumes = [...MOCK_STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 5);

  return {
    topGainers: gainers,
    topLosers: losers,
    topVolume: volumes,
    isLive: false,
  };
}

// 3. Fetch KRX Stocks from server API
export async function fetchKrxSearch(query: string, limit = 20): Promise<{ stocks: KRXClientStock[]; baseDateFormatted: string; isLive: boolean }> {
  try {
    const res = await fetch(`/api/krx/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      return {
        stocks: data.stocks || [],
        baseDateFormatted: data.baseDateFormatted || '거래일 기준',
        isLive: !!data.isLive,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/krx/stocks/search, falling back to local master:', err);
  }

  // Fallback to local master ONLY if API fails
  const local = searchStocks(query, 'domestic');
  return {
    stocks: local.slice(0, limit).map(m => ({
      date: '20260928',
      dateFormatted: '2026.09.28 거래일 기준',
      code: m.symbol,
      name: m.koreanName,
      market: m.market,
      securityType: '주권',
      close: m.basePrice || 50000,
      change: Math.round(((m.basePrice || 50000) * (m.changeRate || 0)) / 100),
      changeRate: m.changeRate || 0,
      open: (m.basePrice || 50000) - Math.round(((m.basePrice || 50000) * (m.changeRate || 0)) / 100),
      high: Math.round((m.basePrice || 50000) * 1.015),
      low: Math.round((m.basePrice || 50000) * 0.985),
      volume: 1500000,
      tradingValue: (m.basePrice || 50000) * 1500000,
      marketCap: (m.basePrice || 50000) * 150000000,
      marketCapFormatted: `${Math.round(((m.basePrice || 50000) * 150000000) / 1000000000000)}조 원`,
      listedShares: 150000000,
      isLive: false,
    })),
    baseDateFormatted: '2026.09.28 거래일 기준',
    isLive: false,
  };
}

// 4. Fetch Single KRX Stock from server API
export async function fetchKrxStockDetail(code: string): Promise<StockItem | null> {
  try {
    const res = await fetch(`/api/krx/stocks/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.stock) {
        krxLiveStockCache.set(code.toUpperCase(), data.stock);
        return data.stock;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch /api/krx/stocks/${code}:`, err);
  }
  return null;
}

// 5. Search Stock Masters (Synchronous for fast client filtering)
export function searchStocks(
  query: string,
  filter: 'all' | 'domestic' | 'global' | 'watchlist' = 'all',
  watchlistCodes: string[] = []
): StockMaster[] {
  const trimmed = query.trim().toLowerCase();

  return STOCK_MASTER_LIST.filter(item => {
    if (filter === 'domestic' && item.country !== 'KR') return false;
    if (filter === 'global' && item.country !== 'US') return false;
    if (filter === 'watchlist' && !watchlistCodes.includes(item.symbol)) return false;

    if (!trimmed) return true;

    const matchSymbol = item.symbol.toLowerCase().includes(trimmed);
    const matchKorean = item.koreanName.toLowerCase().includes(trimmed);
    const matchEnglish = item.name.toLowerCase().includes(trimmed);
    const matchSector = item.sector.toLowerCase().includes(trimmed);
    const matchAliases = item.aliases?.some(a => a.toLowerCase().includes(trimmed));

    return matchSymbol || matchKorean || matchEnglish || matchSector || matchAliases;
  });
}

// 6. Real-time Auto-complete Suggestions (up to limit, default 8)
export function getAutocompleteSuggestions(query: string, limit = 8): StockMaster[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return STOCK_MASTER_LIST.filter(item => {
    return (
      item.symbol.toLowerCase().includes(trimmed) ||
      item.koreanName.toLowerCase().includes(trimmed) ||
      item.name.toLowerCase().includes(trimmed) ||
      item.aliases?.some(a => a.toLowerCase().includes(trimmed))
    );
  }).slice(0, limit);
}

// 7. Dynamic Stock Detail Provider (KRX Live Cache First, Demo Fallback ONLY if not found)
export function getStockDetail(symbolOrCode: string): StockItem | null {
  const norm = symbolOrCode.trim().toUpperCase();

  // Priority 1: Check in live KRX cache
  if (krxLiveStockCache.has(norm)) {
    return krxLiveStockCache.get(norm)!;
  }

  // Priority 2: Check in master database
  const master = STOCK_MASTER_LIST.find(
    s => s.symbol.toUpperCase() === norm || s.name.toUpperCase() === norm || s.koreanName === symbolOrCode
  );

  // Priority 3: Fallback check in pre-crafted MOCK_STOCKS (Only if KRX not yet loaded)
  const existing = MOCK_STOCKS.find(s => s.code.toUpperCase() === norm || s.id.toUpperCase() === norm);
  if (existing) {
    return existing;
  }

  if (!master) {
    const isUS = /^[A-Z]{1,5}$/.test(norm);
    const basePrice = isUS ? 150 : 50000;
    return generateDynamicStock(
      {
        symbol: norm,
        name: norm,
        koreanName: norm,
        market: isUS ? 'NASDAQ' : 'KOSPI',
        country: isUS ? 'US' : 'KR',
        sector: '기타 상장 기업',
        basePrice,
        changeRate: 0.5,
      }
    );
  }

  return generateDynamicStock(master);
}

// 8. Async Stock Detail Provider with Live KRX Data Priority
export async function getStockDetailAsync(symbolOrCode: string): Promise<StockItem | null> {
  const norm = symbolOrCode.trim().toUpperCase();

  // 1. Try to fetch fresh live KRX detail from server endpoint
  const liveStock = await fetchKrxStockDetail(norm);
  if (liveStock) {
    krxLiveStockCache.set(norm, liveStock);
    return liveStock;
  }

  // 2. Return cached or sync fallback
  return getStockDetail(norm);
}

// Helper to instantiate a full StockItem from a StockMaster definition
function generateDynamicStock(master: StockMaster): StockItem {
  const isKR = master.country === 'KR';
  const currency = isKR ? 'KRW' : 'USD';
  const currentPrice = master.basePrice || (isKR ? 65000 : 180);
  const changeRate = master.changeRate ?? 1.25;
  const changeAmount = isKR ? Math.round((currentPrice * changeRate) / 100) : Number(((currentPrice * changeRate) / 100).toFixed(2));
  const openPrice = isKR ? currentPrice - changeAmount : Number((currentPrice - changeAmount).toFixed(2));
  const highPrice = isKR ? Math.round(Math.max(currentPrice, openPrice) * 1.018) : Number((Math.max(currentPrice, openPrice) * 1.018).toFixed(2));
  const lowPrice = isKR ? Math.round(Math.min(currentPrice, openPrice) * 0.985) : Number((Math.min(currentPrice, openPrice) * 0.985).toFixed(2));
  const volume = Math.round(1500000 + Math.random() * 3000000);
  const tradingValue = currentPrice * volume;

  const chartData = generateSyntheticChartData(currentPrice, isKR ? 0.018 : 0.025, changeRate >= 0 ? 0.08 : -0.05);

  const marketCapFormatted = isKR
    ? `${Math.round(currentPrice * 0.08).toLocaleString()}조 원`
    : `$${(currentPrice * 0.05).toFixed(1)}B`;

  return {
    id: `stock-${master.symbol.toLowerCase()}`,
    name: master.koreanName,
    koreanName: master.koreanName,
    code: master.symbol,
    market: master.market,
    country: master.country,
    currency,
    currentPrice,
    changeAmount,
    changeRate,
    openPrice,
    highPrice,
    lowPrice,
    volume,
    tradingValue,
    chartData,
    baseDateFormatted: '거래일 기준',
    isLiveKrx: false,
    isDemo: true,
    companyInfo: {
      companyName: `${master.koreanName} (${master.name})`,
      sector: master.sector,
      foundedDate: isKR ? '1998.05.20' : '1992.08.15',
      ceo: isKR ? '전문경영인 대표이사' : 'Executive Management',
      mainBusiness: `${master.sector} 주력 비즈니스 및 파생 신사업 전개`,
      description: `${master.koreanName}(${master.symbol})은(는) ${master.market}에 상장된 ${master.sector} 부문의 대표 우량 기업입니다.`,
      marketCap: isKR ? 500000 : 250000,
      marketCapFormatted,
      sharesOutstanding: isKR ? '240,000,000주' : '1,500,000,000주',
      week52High: isKR ? Math.round(currentPrice * 1.35) : Number((currentPrice * 1.35).toFixed(1)),
      week52Low: isKR ? Math.round(currentPrice * 0.72) : Number((currentPrice * 0.72).toFixed(1)),
    },
    financialYears: [
      { year: '2021', revenue: isKR ? 54000 : 18000, operatingIncome: isKR ? 7200 : 3500, netIncome: isKR ? 5800 : 2900, assets: isKR ? 68000 : 24000, liabilities: isKR ? 22000 : 8000 },
      { year: '2022', revenue: isKR ? 62000 : 21000, operatingIncome: isKR ? 8100 : 4200, netIncome: isKR ? 6400 : 3400, assets: isKR ? 75000 : 27000, liabilities: isKR ? 24000 : 9000 },
      { year: '2023', revenue: isKR ? 69000 : 24500, operatingIncome: isKR ? 9400 : 5100, netIncome: isKR ? 7500 : 4100, assets: isKR ? 83000 : 31000, liabilities: isKR ? 26000 : 9800 },
      { year: '2024(E)', revenue: isKR ? 78000 : 29000, operatingIncome: isKR ? 11200 : 6200, netIncome: isKR ? 9100 : 5000, assets: isKR ? 92000 : 36000, liabilities: isKR ? 28000 : 10500 },
    ],
    financialRatios: {
      per: isKR ? 14.5 : 28.4,
      pbr: isKR ? 1.25 : 4.8,
      roe: isKR ? 11.8 : 19.5,
      debtRatio: isKR ? 42.5 : 38.0,
      dividendYield: isKR ? 1.85 : 0.65,
      eps: isKR ? Math.round(currentPrice / 14.5) : Number((currentPrice / 28.4).toFixed(2)),
      bps: isKR ? Math.round(currentPrice / 1.25) : Number((currentPrice / 4.8).toFixed(2)),
    },
    newsIds: [],
  };
}

// 9. Recent Searches Management (localStorage)
export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading recent searches', e);
  }
  return ['삼성전자', 'SK하이닉스', 'NVIDIA', 'Apple'];
}

export function addRecentSearch(keyword: string): string[] {
  const trimmed = keyword.trim();
  if (!trimmed) return getRecentSearches();

  const current = getRecentSearches().filter(k => k.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...current].slice(0, 10);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving recent searches', e);
  }

  return updated;
}

export function removeRecentSearch(keyword: string): string[] {
  const updated = getRecentSearches().filter(k => k !== keyword);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error removing recent search', e);
  }
  return updated;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.error('Error clearing recent searches', e);
  }
}

// 10. Popular Search Suggestions
export function getPopularStocks(): StockMaster[] {
  const popularSymbols = ['005930', '000660', 'NVDA', 'AAPL', '005380', '035420', '035720', 'TSLA', 'MSFT', 'AMD'];
  return popularSymbols
    .map(sym => STOCK_MASTER_LIST.find(s => s.symbol === sym))
    .filter(Boolean) as StockMaster[];
}
