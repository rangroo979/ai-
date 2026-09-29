import { STOCK_MASTER_LIST } from './src/data/stocksMaster';
import { MOCK_STOCKS } from './src/data/mockStocks';
import { StockItem, TimeRange, PricePoint, MarketType } from './src/types';

export interface KRXStockItem {
  date: string;          // YYYYMMDD
  dateFormatted: string; // YYYY.MM.DD 거래일 기준
  code: string;          // ISU_CD (e.g. "005930")
  name: string;          // ISU_NM (e.g. "삼성전자")
  market: 'KOSPI' | 'KOSDAQ' | string; // MKT_NM
  securityType: string;  // SECT_TP_NM
  close: number;         // TDD_CLSPRC
  change: number;        // CMPPREVDD_PRC
  changeRate: number;    // FLUC_RT
  open: number;          // TDD_OPNPRC
  high: number;          // TDD_HGPRC
  low: number;           // TDD_LWPRC
  volume: number;        // ACC_TRDVOL
  tradingValue: number;  // ACC_TRDVAL
  marketCap: number;     // MKTCAP
  marketCapFormatted?: string;
  listedShares: number;  // LIST_SHRS
  isLive: boolean;       // whether from real KRX API
}

interface KRXRawItem {
  BAS_DD?: string;
  ISU_CD?: string;
  ISU_NM?: string;
  MKT_NM?: string;
  SECT_TP_NM?: string;
  TDD_CLSPRC?: string | number;
  CMPPREVDD_PRC?: string | number;
  FLUC_RT?: string | number;
  TDD_OPNPRC?: string | number;
  TDD_HGPRC?: string | number;
  TDD_LWPRC?: string | number;
  ACC_TRDVOL?: string | number;
  ACC_TRDVAL?: string | number;
  MKTCAP?: string | number;
  LIST_SHRS?: string | number;
}

interface KRXApiResponse {
  OutBlock_1?: KRXRawItem[];
}

export function safeNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatMarketCap(cap: number): string {
  if (!cap || cap === 0) return '0원';
  const eok = Math.floor(cap / 100000000); // 1억 = 10^8
  if (eok >= 10000) {
    const jo = Math.floor(eok / 10000); // 1조 = 10^12
    const remEok = eok % 10000;
    return remEok > 0
      ? `${jo.toLocaleString()}조 ${remEok.toLocaleString()}억 원`
      : `${jo.toLocaleString()}조 원`;
  }
  return `${eok.toLocaleString()}억 원`;
}

export function formatDateKRX(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr || '거래일 기준';
  const y = dateStr.slice(0, 4);
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  return `${y}.${m}.${d} 거래일 기준`;
}

// In-memory cache for KRX data
let latestKrxResult: {
  stocks: KRXStockItem[];
  baseDate: string;
  isLive: boolean;
  kospiCount: number;
  kosdaqCount: number;
} | null = null;

let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

// Calculate target date strings (YYYYMMDD in KST, going back up to 7 days)
export function getRecentTradingDateCandidates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstNow = new Date(utc + (9 * 3600000));

  for (let i = 0; i < 7; i++) {
    const d = new Date(kstNow.getTime() - (i * 24 * 3600000));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}${month}${day}`);
  }
  return dates;
}

function transformRawItem(raw: KRXRawItem, defaultMarket: string, isLive: boolean): KRXStockItem {
  const date = raw.BAS_DD || '';
  const market = raw.MKT_NM || defaultMarket;
  const marketCap = safeNumber(raw.MKTCAP);

  return {
    date: date,
    dateFormatted: formatDateKRX(date),
    code: String(raw.ISU_CD || '').trim(),
    name: String(raw.ISU_NM || '').trim(),
    market: market,
    securityType: String(raw.SECT_TP_NM || '').trim(),
    close: safeNumber(raw.TDD_CLSPRC),
    change: safeNumber(raw.CMPPREVDD_PRC),
    changeRate: safeNumber(raw.FLUC_RT),
    open: safeNumber(raw.TDD_OPNPRC),
    high: safeNumber(raw.TDD_HGPRC),
    low: safeNumber(raw.TDD_LWPRC),
    volume: safeNumber(raw.ACC_TRDVOL),
    tradingValue: safeNumber(raw.ACC_TRDVAL),
    marketCap: marketCap,
    marketCapFormatted: formatMarketCap(marketCap),
    listedShares: safeNumber(raw.LIST_SHRS),
    isLive: isLive,
  };
}

// 1. Fetch KOSPI Daily Trading
export async function getKospiDaily(date: string): Promise<KRXStockItem[]> {
  const apiKey = process.env.KRX_API_KEY;
  if (!apiKey || apiKey === 'MY_KRX_API_KEY') {
    return [];
  }

  console.log('KRX KOSPI request started');
  try {
    const url = `https://data-dbg.krx.co.kr/svc/apis/sto/stk_bydd_trd?basDd=${date}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        AUTH_KEY: apiKey,
        Accept: 'application/json',
      },
    });

    console.log(`KRX KOSPI response status: ${res.status}`);

    if (!res.ok) {
      console.warn(`KRX KOSPI API error: status ${res.status} for ${date}`);
      return [];
    }

    const json = (await res.json()) as KRXApiResponse;
    const rawList = json.OutBlock_1 || [];
    const count = Array.isArray(rawList) ? rawList.length : 0;
    console.log(`KRX KOSPI stocks loaded: ${count}`);

    if (count === 0) {
      return [];
    }

    return rawList.map(r => transformRawItem(r, 'KOSPI', true));
  } catch (err: any) {
    console.error(`KRX KOSPI fetch error for ${date}:`, err.message || err);
    return [];
  }
}

// 2. Fetch KOSDAQ Daily Trading
export async function getKosdaqDaily(date: string): Promise<KRXStockItem[]> {
  const apiKey = process.env.KRX_API_KEY;
  if (!apiKey || apiKey === 'MY_KRX_API_KEY') {
    return [];
  }

  console.log('KRX KOSDAQ request started');
  try {
    const url = `https://data-dbg.krx.co.kr/svc/apis/sto/ksq_bydd_trd?basDd=${date}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        AUTH_KEY: apiKey,
        Accept: 'application/json',
      },
    });

    console.log(`KRX KOSDAQ response status: ${res.status}`);

    if (!res.ok) {
      console.warn(`KRX KOSDAQ API error: status ${res.status} for ${date}`);
      return [];
    }

    const json = (await res.json()) as KRXApiResponse;
    const rawList = json.OutBlock_1 || [];
    const count = Array.isArray(rawList) ? rawList.length : 0;
    console.log(`KRX KOSDAQ stocks loaded: ${count}`);

    if (count === 0) {
      return [];
    }

    return rawList.map(r => transformRawItem(r, 'KOSDAQ', true));
  } catch (err: any) {
    console.error(`KRX KOSDAQ fetch error for ${date}:`, err.message || err);
    return [];
  }
}

// 3. Fallback generator using stock master list when KRX API is not yet available or off-market
function getFallbackAllStocks(candidateDate: string): KRXStockItem[] {
  const krMasters = STOCK_MASTER_LIST.filter(s => s.country === 'KR');
  return krMasters.map(m => {
    const basePrice = m.basePrice || 50000;
    const changeRate = m.changeRate || 0;
    const change = Math.round((basePrice * changeRate) / 100);
    const open = basePrice - change;
    const high = Math.round(Math.max(basePrice, open) * 1.015);
    const low = Math.round(Math.min(basePrice, open) * 0.985);
    const volume = Math.round(1000000 + Math.random() * 2000000);
    const tradingVal = basePrice * volume;
    const shares = 150000000;
    const marketCap = basePrice * shares;

    return {
      date: candidateDate,
      dateFormatted: formatDateKRX(candidateDate),
      code: m.symbol,
      name: m.koreanName,
      market: m.market,
      securityType: '주권',
      close: basePrice,
      change: change,
      changeRate: changeRate,
      open: open,
      high: high,
      low: low,
      volume: volume,
      tradingValue: tradingVal,
      marketCap: marketCap,
      marketCapFormatted: formatMarketCap(marketCap),
      listedShares: shares,
      isLive: false,
    };
  });
}

// 4. Combined KOSPI + KOSDAQ with automatic fallback to previous trading day
// CRITICAL: KRX actual data is ALWAYS FIRST. Demo data is fallback ONLY when API fails.
export async function getAllStocks(targetDate?: string, forceRefresh = false): Promise<{
  stocks: KRXStockItem[];
  baseDate: string;
  isLive: boolean;
  kospiCount: number;
  kosdaqCount: number;
}> {
  if (!forceRefresh && latestKrxResult && latestKrxResult.isLive && Date.now() - lastFetchTimestamp < CACHE_TTL_MS) {
    return latestKrxResult;
  }

  const candidateDates = targetDate ? [targetDate] : getRecentTradingDateCandidates();

  // Search through dates (today -> 1 day ago -> 2 days ago ... up to 7 days)
  for (const date of candidateDates) {
    const [kospi, kosdaq] = await Promise.all([
      getKospiDaily(date),
      getKosdaqDaily(date),
    ]);

    if (kospi.length > 0 || kosdaq.length > 0) {
      const all = [...kospi, ...kosdaq];
      latestKrxResult = {
        stocks: all,
        baseDate: date,
        isLive: true,
        kospiCount: kospi.length,
        kosdaqCount: kosdaq.length,
      };
      lastFetchTimestamp = Date.now();
      return latestKrxResult;
    }
  }

  // Fallback to demo stock master data ONLY if all candidate dates returned no data
  const fallbackDate = candidateDates[0] || '20260928';
  console.warn('KRX API: No live trading data found in recent 7 days, falling back to demo master data.');
  const fallbackStocks = getFallbackAllStocks(fallbackDate);
  latestKrxResult = {
    stocks: fallbackStocks,
    baseDate: fallbackDate,
    isLive: false,
    kospiCount: 0,
    kosdaqCount: 0,
  };
  return latestKrxResult;
}

// 5. Search Stocks (Name, Code, Partial match)
export async function searchKrxStocks(query: string, limit = 20): Promise<{
  stocks: KRXStockItem[];
  baseDate: string;
  isLive: boolean;
}> {
  const { stocks: all, baseDate, isLive } = await getAllStocks();
  const q = (query || '').trim().toLowerCase();

  if (!q) {
    return {
      stocks: all.slice(0, limit),
      baseDate,
      isLive,
    };
  }

  const matched = all.filter(s => {
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  }).slice(0, limit);

  return {
    stocks: matched,
    baseDate,
    isLive,
  };
}

// Synthetic chart data helper for rich chart rendering based on real KRX close price
function generateChartFromClose(basePrice: number, changeRate: number): Record<TimeRange, PricePoint[]> {
  const ranges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
  const counts: Record<TimeRange, number> = {
    '1D': 30,
    '1W': 7,
    '1M': 22,
    '3M': 60,
    '1Y': 52,
    '5Y': 60,
  };
  const trend = changeRate >= 0 ? 0.08 : -0.06;
  const volatility = 0.015;
  const chartData: Partial<Record<TimeRange, PricePoint[]>> = {};

  ranges.forEach(range => {
    const points: PricePoint[] = [];
    const count = counts[range];
    let current = basePrice * (1 - trend * 0.4);
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const delta = (Math.sin(i * 0.45) * 0.5 + (Math.random() - 0.48) + trend * 0.15) * volatility * current;
      const open = Math.round(current);
      const close = i === count - 1 ? basePrice : Math.round(current + delta);
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

// 6. Convert KRX Item to Full App StockItem
export function convertKrxToStockItem(krx: KRXStockItem): StockItem {
  const existingMock = MOCK_STOCKS.find(s => s.code === krx.code);
  const master = STOCK_MASTER_LIST.find(s => s.symbol === krx.code);
  const sector = master?.sector || existingMock?.companyInfo.sector || `${krx.market} 주요 상장기업`;

  const chartData = generateChartFromClose(krx.close, krx.changeRate);

  const baseCompanyInfo = existingMock?.companyInfo || {
    companyName: `${krx.name} (${krx.code})`,
    sector: sector,
    foundedDate: '상장기업',
    ceo: '대표이사',
    mainBusiness: `${krx.name} 주력 사업 및 제품`,
    description: `${krx.name}(${krx.code})은(는) 한국거래소 ${krx.market}에 상장된 기업입니다.`,
    headquarters: '대한민국',
    website: '',
    marketCap: Math.round(krx.marketCap / 100000000),
    marketCapFormatted: krx.marketCapFormatted || formatMarketCap(krx.marketCap),
    sharesOutstanding: `${krx.listedShares.toLocaleString()}주`,
    week52High: Math.round(krx.close * 1.3),
    week52Low: Math.round(krx.close * 0.72),
  };

  const financialYears = existingMock?.financialYears || [
    { year: '2021', revenue: Math.round(krx.close * 8), operatingIncome: Math.round(krx.close * 1.2), netIncome: Math.round(krx.close * 0.9), assets: Math.round(krx.close * 12), liabilities: Math.round(krx.close * 4) },
    { year: '2022', revenue: Math.round(krx.close * 9), operatingIncome: Math.round(krx.close * 1.4), netIncome: Math.round(krx.close * 1.1), assets: Math.round(krx.close * 14), liabilities: Math.round(krx.close * 4.5) },
    { year: '2023', revenue: Math.round(krx.close * 10), operatingIncome: Math.round(krx.close * 1.6), netIncome: Math.round(krx.close * 1.3), assets: Math.round(krx.close * 16), liabilities: Math.round(krx.close * 5) },
    { year: '2024(E)', revenue: Math.round(krx.close * 11.5), operatingIncome: Math.round(krx.close * 1.9), netIncome: Math.round(krx.close * 1.5), assets: Math.round(krx.close * 18), liabilities: Math.round(krx.close * 5.5) },
  ];

  const financialRatios = existingMock?.financialRatios || {
    per: 14.5,
    pbr: 1.25,
    roe: 11.2,
    debtRatio: 38.5,
    dividendYield: 2.1,
    eps: Math.round(krx.close / 14.5),
    bps: Math.round(krx.close / 1.25),
  };

  return {
    id: `stock-${krx.code.toLowerCase()}`,
    name: krx.name,
    koreanName: krx.name,
    code: krx.code,
    market: krx.market as MarketType,
    country: 'KR',
    currency: 'KRW',
    currentPrice: krx.close,
    changeAmount: krx.change,
    changeRate: krx.changeRate,
    openPrice: krx.open || (krx.close - krx.change),
    highPrice: krx.high || krx.close,
    lowPrice: krx.low || krx.close,
    volume: krx.volume,
    tradingValue: krx.tradingValue,
    listedShares: krx.listedShares,
    chartData: chartData,
    baseDateFormatted: krx.dateFormatted,
    isLiveKrx: krx.isLive,
    isDemo: !krx.isLive,
    companyInfo: {
      ...baseCompanyInfo,
      companyName: `${krx.name} (${krx.code})`,
      marketCap: Math.round(krx.marketCap / 100000000),
      marketCapFormatted: krx.marketCapFormatted || formatMarketCap(krx.marketCap),
      sharesOutstanding: `${krx.listedShares.toLocaleString()}주`,
    },
    financialYears: financialYears,
    financialRatios: financialRatios,
    newsIds: existingMock?.newsIds || [],
  };
}

// 7. Get Single Stock Detail by Code (KRX First, US fallback)
export async function getKrxStockByCode(code: string): Promise<StockItem | null> {
  const targetCode = String(code || '').trim().toUpperCase();
  const { stocks: all } = await getAllStocks();

  // A. Check in live KRX stocks
  const foundKrx = all.find(s => s.code.toUpperCase() === targetCode || s.name.toUpperCase() === targetCode);
  if (foundKrx) {
    return convertKrxToStockItem(foundKrx);
  }

  // B. Check in US or master stocks
  const master = STOCK_MASTER_LIST.find(
    s => s.symbol.toUpperCase() === targetCode || s.name.toUpperCase() === targetCode || s.koreanName === targetCode
  );

  if (master && master.country === 'US') {
    const existing = MOCK_STOCKS.find(s => s.code === master.symbol);
    if (existing) return existing;

    const basePrice = master.basePrice || 180;
    const changeRate = master.changeRate || 1.2;
    const changeAmount = Number(((basePrice * changeRate) / 100).toFixed(2));

    return {
      id: `stock-${master.symbol.toLowerCase()}`,
      name: master.koreanName,
      koreanName: master.koreanName,
      code: master.symbol,
      market: master.market,
      country: 'US',
      currency: 'USD',
      currentPrice: basePrice,
      changeAmount: changeAmount,
      changeRate: changeRate,
      openPrice: Number((basePrice - changeAmount).toFixed(2)),
      highPrice: Number((basePrice * 1.018).toFixed(2)),
      lowPrice: Number((basePrice * 0.985).toFixed(2)),
      volume: 4500000,
      tradingValue: Math.round(basePrice * 4500000),
      chartData: generateChartFromClose(basePrice, changeRate),
      baseDateFormatted: '글로벌 거래일 기준',
      isLiveKrx: false,
      isDemo: false,
      companyInfo: {
        companyName: `${master.koreanName} (${master.name})`,
        sector: master.sector,
        foundedDate: '1990.01.01',
        ceo: 'Executive Management',
        mainBusiness: `${master.sector} 글로벌 사업`,
        description: `${master.koreanName}(${master.symbol})은(는) ${master.market}에 상장된 글로벌 대표 기업입니다.`,
        marketCap: 250000,
        marketCapFormatted: `$${(basePrice * 0.05).toFixed(1)}B`,
        sharesOutstanding: '1,500,000,000주',
        week52High: Number((basePrice * 1.35).toFixed(1)),
        week52Low: Number((basePrice * 0.72).toFixed(1)),
      },
      financialYears: [
        { year: '2021', revenue: 18000, operatingIncome: 3500, netIncome: 2900, assets: 24000, liabilities: 8000 },
        { year: '2022', revenue: 21000, operatingIncome: 4200, netIncome: 3400, assets: 27000, liabilities: 9000 },
        { year: '2023', revenue: 24500, operatingIncome: 5100, netIncome: 4100, assets: 31000, liabilities: 9800 },
        { year: '2024(E)', revenue: 29000, operatingIncome: 6200, netIncome: 5000, assets: 36000, liabilities: 10500 },
      ],
      financialRatios: {
        per: 28.4,
        pbr: 4.8,
        roe: 19.5,
        debtRatio: 38.0,
        dividendYield: 0.65,
        eps: Number((basePrice / 28.4).toFixed(2)),
        bps: Number((basePrice / 4.8).toFixed(2)),
      },
      newsIds: [],
    };
  }

  // C. Fallback for Korean stock if KRX had error
  const existingKr = MOCK_STOCKS.find(s => s.code === targetCode);
  if (existingKr) return existingKr;

  return null;
}

// 8. Get Spotlight Stocks (User requested list: 삼성전자, NAVER, 카카오, Apple, NVIDIA, Tesla, etc.)
export async function getSpotlightStocks(): Promise<StockItem[]> {
  const targetCodes = ['005930', '035420', '035720', '000660', '005380', 'AAPL', 'NVDA', 'TSLA'];
  const items: StockItem[] = [];

  for (const code of targetCodes) {
    const item = await getKrxStockByCode(code);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

// 9. Get Real Market Movers from KRX (Top Gainers, Top Losers, Highest Volume)
export async function getMarketMovers(): Promise<{
  topGainers: StockItem[];
  topLosers: StockItem[];
  topVolume: StockItem[];
}> {
  const { stocks: all } = await getAllStocks();

  // Filter for valid stocks with volume
  const valid = all.filter(s => s.volume > 0 && s.close > 0);

  const gainers = [...valid].sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);
  const losers = [...valid].sort((a, b) => a.changeRate - b.changeRate).slice(0, 5);
  const volumes = [...valid].sort((a, b) => b.volume - a.volume).slice(0, 5);

  return {
    topGainers: gainers.map(convertKrxToStockItem),
    topLosers: losers.map(convertKrxToStockItem),
    topVolume: volumes.map(convertKrxToStockItem),
  };
}
