import React, { useState } from 'react';
import { MarketIndex } from '../../types';
import { MOCK_SECTORS, DEFAULT_AI_MARKET_SUMMARY } from '../../data/mockMarket';
import { fetchMarketSummary } from '../../services/aiService';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Compass } from 'lucide-react';

interface AiMarketSummaryProps {
  indices: MarketIndex[];
}

export const AiMarketSummary: React.FC<AiMarketSummaryProps> = ({ indices }) => {
  const [summaryData, setSummaryData] = useState(DEFAULT_AI_MARKET_SUMMARY);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMarketSummary(indices, MOCK_SECTORS);
      setSummaryData({
        mood: res.mood,
        leadingFactors: res.leadingFactors,
        downsideRisks: res.downsideRisks,
        interestSectors: res.interestSectors,
        keyIssues: res.keyIssues,
        analyzedAt: res.analyzedAt,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#121c33] via-[#101827] to-[#0c1322] border border-blue-500/25 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow subtle effect */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI 오늘의 시장 요약</span>
              <span className="text-xs font-normal text-blue-400">· Gemini 분석</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {summaryData.analyzedAt}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? '분석 중...' : '새로고침'}</span>
        </button>
      </div>

      {/* Main Comment Quote */}
      <div className="bg-[#0b0f19]/80 border border-slate-800/80 rounded-xl p-4 mb-4">
        <div className="text-xs text-blue-400 font-semibold mb-1 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          <span>시장 분위기: {summaryData.mood}</span>
        </div>
        <p className="text-sm text-slate-100 font-medium leading-relaxed">
          "{summaryData.keyIssues}"
        </p>
      </div>

      {/* Leading Factors & Downside Risks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Leading Factors */}
        <div className="bg-[#0b0f19]/50 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>상승 견인 동력</span>
          </div>
          <ul className="space-y-1.5 text-slate-300">
            {summaryData.leadingFactors.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">·</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Downside Risks */}
        <div className="bg-[#0b0f19]/50 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>단기 주의 요인</span>
          </div>
          <ul className="space-y-1.5 text-slate-300">
            {summaryData.downsideRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-amber-400 font-bold shrink-0">·</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interest Sectors Footer */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">AI 관심 주목 업종:</span>
        {summaryData.interestSectors.map((sector, i) => (
          <span
            key={i}
            className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
          >
            {sector}
          </span>
        ))}
      </div>
    </div>
  );
};
