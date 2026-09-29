export type MarketType = 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export interface PricePoint {
  date: string;
  time?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FinancialYearData {
  year: string;
  revenue: number; // 억원 or Million USD
  operatingIncome: number;
  netIncome: number;
  assets: number;
  liabilities: number;
}

export interface FinancialRatios {
  per: number;
  pbr: number;
  roe: number;
  debtRatio: number;
  dividendYield: number;
  eps: number;
  bps: number;
}

export interface CompanyInfo {
  companyName: string;
  sector: string;
  foundedDate: string;
  ceo: string;
  mainBusiness: string;
  description: string;
  headquarters?: string;
  website?: string;
  marketCap: number; // 억원 or Billion USD
  marketCapFormatted: string;
  sharesOutstanding: string;
  week52High: number;
  week52Low: number;
}

export interface StockMaster {
  symbol: string;      // e.g. "005930" or "NVDA"
  name: string;        // English name e.g. "Samsung Electronics", "NVIDIA"
  koreanName: string;  // Korean name e.g. "삼성전자", "엔비디아"
  market: MarketType;
  country: 'KR' | 'US';
  sector: string;
  aliases?: string[];  // e.g. ["삼전", "SAMSUNG", "NVDA"]
  basePrice?: number;
  changeRate?: number;
}

export interface StockItem {
  id: string;
  name: string;
  koreanName?: string;
  code: string;
  market: MarketType;
  country?: 'KR' | 'US';
  currency: 'KRW' | 'USD';
  currentPrice: number;
  changeAmount: number;
  changeRate: number; // e.g., +2.45 or -1.15
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  tradingValue: number; // 거래대금
  chartData: Record<TimeRange, PricePoint[]>;
  companyInfo: CompanyInfo;
  financialYears: FinancialYearData[];
  financialRatios: FinancialRatios;
  newsIds: string[];
  isDemo?: boolean;
  baseDateFormatted?: string; // e.g. "2026.09.28 거래일 기준"
  isLiveKrx?: boolean;
  listedShares?: number;
}

export interface MarketIndex {
  id: string;
  name: string;
  code: string;
  currentValue: number;
  changeAmount: number;
  changeRate: number;
  history: { time: string; value: number }[];
}

export interface NewsItem {
  id: string;
  title: string;
  press: string;
  publishedAt: string;
  summary: string;
  relatedStockCodes: string[];
  category: '기업' | '시장';
  aiAnalysis?: {
    coreContent: string;
    marketImpact: string;
    positiveFactors: string[];
    negativeFactors: string[];
    cautions: string;
  };
}

export interface AIAnalysisResult {
  summary: string;
  positiveFactors: string[];
  cautionFactors: string[];
  evaluation: {
    profitability: { rating: '좋음' | '보통' | '주의'; reason: string };
    growth: { rating: '좋음' | '보통' | '주의'; reason: string };
    stability: { rating: '좋음' | '보통' | '주의'; reason: string };
    valuation: { rating: '좋음' | '보통' | '주의'; reason: string };
  };
  reliability: '높음' | '보통' | '낮음';
  reliabilityReason: string;
  analyzedAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AICompareResult {
  summary: string;
  strengths: { stockCode: string; stockName: string; text: string }[];
  risks: { stockCode: string; stockName: string; text: string }[];
  financialComparison: string;
  growthComparison: string;
  conclusionNote: string;
}

export interface AIMarketSummaryResult {
  mood: string;
  leadingFactors: string[];
  downsideRisks: string[];
  interestSectors: string[];
  keyIssues: string;
  analyzedAt: string;
}

export interface GlossaryTerm {
  term: string;
  abbr?: string;
  shortDesc: string;
  fullDesc: string;
  formula?: string;
  goodRange?: string;
  beginnerTip: string;
}
