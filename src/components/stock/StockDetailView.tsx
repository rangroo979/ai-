import React, { useState, useEffect } from 'react';
import { StockItem } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';
import { getStockDetailAsync } from '../../services/stockService';
import { StockChart } from '../charts/StockChart';
import { CompanyInfoTab } from './CompanyInfoTab';
import { FinancialsTab } from './FinancialsTab';
import { StockNewsTab } from './StockNewsTab';
import { AiStockAnalysisTab } from './AiStockAnalysisTab';
import { AiAskChat } from './AiAskChat';
import {
  ArrowLeft,
  Star,
  LineChart,
  Building,
  BarChart2,
  Newspaper,
  Sparkles,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Hash,
} from 'lucide-react';

interface StockDetailViewProps {
  stock: StockItem;
  onBack: () => void;
  initialTab?: 'chart' | 'company' | 'financials' | 'news' | 'ai' | 'ask';
}

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  stock: initialStock,
  onBack,
  initialTab = 'chart',
}) => {
  const [stock, setStock] = useState<StockItem>(initialStock);
  const [activeTab, setActiveTab] = useState<'chart' | 'company' | 'financials' | 'news' | 'ai' | 'ask'>(initialTab);
  const [isLoadingKrx, setIsLoadingKrx] = useState(false);
  const { isWatchlisted, toggleWatchlist } = useWatchlist();

  // Load latest KRX daily trading data asynchronously
  useEffect(() => {
    let cancelled = false;
    setStock(initialStock);

    const loadKrx = async () => {
      setIsLoadingKrx(true);
      try {
        const updated = await getStockDetailAsync(initialStock.code);
        if (!cancelled && updated) {
          setStock(updated);
        }
      } catch (err) {
        console.warn('Failed to load async KRX stock detail:', err);
      } finally {
        if (!cancelled) {
          setIsLoadingKrx(false);
        }
      }
    };

    loadKrx();

    return () => {
      cancelled = true;
    };
  }, [initialStock.code]);

  const isFavorite = isWatchlisted(stock.code);
  const isUp = stock.changeRate >= 0;

  const tabs = [
    { id: 'chart', label: '차트', icon: LineChart },
    { id: 'ai', label: 'AI 분석', icon: Sparkles, highlight: true },
    { id: 'ask', label: 'AI 질문', icon: MessageSquare },
    { id: 'financials', label: '재무정보', icon: BarChart2 },
    { id: 'company', label: '기업정보', icon: Building },
    { id: 'news', label: '뉴스', icon: Newspaper },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Navigation trail */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>종목 목록으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {stock.market} : {stock.code}
          </span>
        </div>
      </div>

      {/* Main Stock Header Card */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Name, Market, Code, Base Date */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stock.name}
            </h1>
            <span className="text-xs font-semibold text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
              {stock.code} · {stock.market}
            </span>
            {stock.isLiveKrx ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                KRX OPEN API
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                DEMO
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{stock.companyInfo.sector}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300 font-medium">{stock.baseDateFormatted || '2026.09.28 거래일 기준'}</span>
            <span aria-hidden="true">·</span>
            <span>시총 {stock.companyInfo.marketCapFormatted}</span>
          </div>
        </div>

        {/* Right: Closing Price & Change Rate & Watchlist Star */}
        <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
          <div className="text-left md:text-right">
            <div className="flex items-center md:justify-end gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                {stock.currentPrice.toLocaleString()}{' '}
                <span className="text-sm font-sans font-medium text-slate-400">
                  {stock.currency}
                </span>
              </span>
            </div>
            <div
              className={`flex items-center md:justify-end gap-1.5 text-sm font-semibold font-mono mt-0.5 ${
                isUp ? 'text-red-500' : 'text-blue-500'
              }`}
            >
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isUp ? '+' : ''}
                {stock.changeAmount.toLocaleString()} ({isUp ? '+' : ''}
                {stock.changeRate.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Watchlist toggle button */}
          <button
            type="button"
            onClick={() => toggleWatchlist(stock.code)}
            aria-label={isFavorite ? '관심종목 해제' : '관심종목 추가'}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Date & Non-realtime Notice Banner */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400 py-2.5 px-4 bg-[#101827] rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>{stock.baseDateFormatted || '2026.09.28 거래일 기준'}</strong> 일별매매정보입니다.
            (한국거래소 KRX OpenAPI 연동 규정에 따라 실시간 체결가가 아닌 거래일 확정 종가 기준 제공)
          </span>
        </div>
        {stock.isLiveKrx && (
          <span className="text-[11px] text-emerald-400 font-semibold shrink-0">
            KRX 공식 인증 데이터
          </span>
        )}
      </div>

      {/* KRX Detailed Daily Trading Stats Card */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>일별 시세 상세 통계 ({stock.baseDateFormatted || '거래일 기준'})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {stock.market} : {stock.code}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">종가 (현재가)</span>
            <span className="text-sm font-bold font-mono text-white">
              {stock.currentPrice.toLocaleString()} {stock.currency}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">전일 대비 (등락률)</span>
            <span className={`text-sm font-bold font-mono ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(stock.changeAmount).toLocaleString()} ({isUp ? '+' : ''}{stock.changeRate.toFixed(2)}%)
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">시가</span>
            <span className="text-sm font-mono text-slate-200">
              {stock.openPrice.toLocaleString()} {stock.currency}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">고가</span>
            <span className="text-sm font-mono text-red-400">
              {stock.highPrice.toLocaleString()} {stock.currency}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">저가</span>
            <span className="text-sm font-mono text-blue-400">
              {stock.lowPrice.toLocaleString()} {stock.currency}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">누적 거래량</span>
            <span className="text-sm font-mono font-semibold text-slate-200">
              {stock.volume.toLocaleString()}주
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">누적 거래대금</span>
            <span className="text-sm font-mono text-slate-200 truncate block">
              {stock.currency === 'KRW'
                ? `${Math.round(stock.tradingValue / 100000000).toLocaleString()}억 원`
                : `$${(stock.tradingValue / 1000000).toFixed(1)}M`}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 block mb-0.5">시가총액</span>
            <span className="text-sm font-mono text-slate-200 truncate block">
              {stock.companyInfo.marketCapFormatted}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800/60 col-span-2">
            <span className="text-slate-500 block mb-0.5">상장주식수</span>
            <span className="text-sm font-mono text-slate-200">
              {stock.companyInfo.sharesOutstanding}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-800 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : tab.highlight
                  ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'chart' && <StockChart stock={stock} />}
        {activeTab === 'ai' && <AiStockAnalysisTab stock={stock} />}
        {activeTab === 'ask' && <AiAskChat stock={stock} />}
        {activeTab === 'financials' && <FinancialsTab stock={stock} />}
        {activeTab === 'company' && <CompanyInfoTab stock={stock} />}
        {activeTab === 'news' && <StockNewsTab stock={stock} />}
      </div>
    </div>
  );
};
