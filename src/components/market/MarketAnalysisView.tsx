import React, { useState } from 'react';
import { MarketIndex, StockItem } from '../../types';
import { MOCK_INDICES, MOCK_SECTORS, DEFAULT_AI_MARKET_SUMMARY } from '../../data/mockMarket';
import { MOCK_STOCKS } from '../../data/mockStocks';
import { fetchMarketSummary } from '../../services/aiService';
import { useStockData } from '../../context/StockDataContext';
import { MiniSparkline } from '../charts/MiniSparkline';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Globe,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface MarketAnalysisViewProps {
  onSelectStock: (stock: StockItem) => void;
}

export const MarketAnalysisView: React.FC<MarketAnalysisViewProps> = ({ onSelectStock }) => {
  const [aiSummary, setAiSummary] = useState(DEFAULT_AI_MARKET_SUMMARY);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { marketMovers, isKrxLive, baseDateFormatted } = useStockData();

  // Top gainers, losers, and highest volume from live KRX market movers (fallback to MOCK_STOCKS)
  const topGainers = marketMovers.topGainers.length > 0
    ? marketMovers.topGainers
    : [...MOCK_STOCKS].sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);

  const topLosers = marketMovers.topLosers.length > 0
    ? marketMovers.topLosers
    : [...MOCK_STOCKS].sort((a, b) => a.changeRate - b.changeRate).slice(0, 5);

  const topVolume = marketMovers.topVolume.length > 0
    ? marketMovers.topVolume
    : [...MOCK_STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const handleRefreshAi = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetchMarketSummary(MOCK_INDICES, MOCK_SECTORS);
      setAiSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-blue-400" />
            <span>시장 분석 및 업종 동향</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            국내 및 글로벌 지수, 주도 업종 섹터, 상승/하락 상위 종목을 Gemini AI로 분석합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshAi}
          disabled={isAiLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? 'AI 분석 중...' : 'AI 시장 분석 새로고침'}</span>
        </button>
      </div>

      {/* 1. Global / Domestic Indices Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {MOCK_INDICES.map(idx => {
          const isUp = idx.changeRate >= 0;
          const chartPoints = idx.history.map(h => h.value);

          return (
            <div
              key={idx.id}
              className="bg-[#101827] border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">
                      {idx.name}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      DEMO
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {idx.code}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    isUp ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>
                    {isUp ? '+' : ''}
                    {idx.changeRate.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 pt-1">
                <div>
                  <div className="text-xl font-extrabold font-mono text-white">
                    {idx.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[11px] font-mono ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(idx.changeAmount).toFixed(2)}
                  </div>
                </div>

                <MiniSparkline
                  data={chartPoints}
                  isPositive={isUp}
                  width={72}
                  height={28}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. AI Market Analysis Deep Card */}
      <div className="bg-gradient-to-br from-[#121c33] via-[#101827] to-[#0d1424] border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Gemini AI 시장 종합 리포트
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {aiSummary.analyzedAt}
          </span>
        </div>

        {/* Current Mood & Core Issue */}
        <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>현재 시장 분위기: {aiSummary.mood}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {aiSummary.keyIssues}
          </p>
        </div>

        {/* Upside vs Downside Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0b0f19]/60 border border-emerald-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>주요 상승 요인 (호재)</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {aiSummary.leadingFactors.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0">·</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0b0f19]/60 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>주요 하락 위험 (경계 요인)</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {aiSummary.downsideRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-400 font-bold shrink-0">·</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interest Sectors */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">AI 관심 주목 업종:</span>
          {aiSummary.interestSectors.map((sector, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Sectors Table */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>주요 업종별 등락률 현황</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_SECTORS.map((sector, idx) => {
            const isUp = sector.changeRate >= 0;
            return (
              <div
                key={idx}
                className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {sector.name}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      isUp ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {sector.changeRate.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">주도 종목: </span>
                  {sector.leaderStock}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {sector.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Top Gainers / Losers / Highest Volume Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 상승 상위 */}
        <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4" />
            <span>상승률 상위 종목</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topGainers.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => onSelectStock(s)}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/30 px-1 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-500 w-4">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {s.code}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-red-500 block">
                    +{s.changeRate.toFixed(2)}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {s.currentPrice.toLocaleString()} {s.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하락 상위 */}
        <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400 border-b border-slate-800 pb-2">
            <TrendingDown className="w-4 h-4" />
            <span>하락률 상위 종목</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topLosers.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => onSelectStock(s)}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/30 px-1 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-500 w-4">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {s.code}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-500 block">
                    {s.changeRate.toFixed(2)}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {s.currentPrice.toLocaleString()} {s.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 거래량 상위 */}
        <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span>거래량 상위 종목</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topVolume.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => onSelectStock(s)}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/30 px-1 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-500 w-4">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {s.code}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-200 block font-semibold">
                    {s.volume.toLocaleString()}주
                  </span>
                  <span className={`text-[10px] font-mono ${s.changeRate >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {s.changeRate >= 0 ? '+' : ''}{s.changeRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Banner */}
      <DisclaimerBanner />
    </div>
  );
};
