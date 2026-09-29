import React from 'react';
import { StockItem, MarketIndex } from '../../types';
import { MarketOverview } from './MarketOverview';
import { AiMarketSummary } from './AiMarketSummary';
import { TopStocksList } from './TopStocksList';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Sparkles,
  TrendingUp,
  Search,
  Scale,
  Newspaper,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface DashboardViewProps {
  stocks: StockItem[];
  indices: MarketIndex[];
  onSelectStock: (stock: StockItem) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stocks,
  indices,
  onSelectStock,
  onNavigate,
}) => {
  return (
    <div className="space-y-7">
      {/* 1. Main Welcome / Hero Banner */}
      <div className="bg-gradient-to-r from-[#10192e] via-[#101827] to-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI 기반 투자 의사결정 지원 플랫폼</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            데이터로 더 현명하고 객관적인 투자 결정을
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            흩어진 재무제표, 밸류에이션 지표, 기업 공시와 뉴스를 한 화면에서 확인하고,
            Gemini AI가 균형 잡힌 시각으로 분석한 긍정 요인과 핵심 리스크를 점검하세요.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>종목 검색 시작하기</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('compare')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0b0f19] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Scale className="w-4 h-4 text-blue-400" />
              <span>종목 비교 분석</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Market Indices Overview */}
      <MarketOverview
        indices={indices}
        onSelectIndex={() => onNavigate('market')}
      />

      {/* 3. AI Market Summary (Gemini Powered) */}
      <AiMarketSummary indices={indices} />

      {/* 4. Top Spotlight Stocks List */}
      <TopStocksList
        stocks={stocks}
        onSelectStock={onSelectStock}
        onNavigateSearch={() => onNavigate('search')}
      />

      {/* 5. Quick Feature Exploration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('ai')}
          className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all shadow-md cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              AI 종목 심층 분석
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              수익성, 성장성, 안정성, 밸류에이션 4대 축을 바탕으로 기업의 강약점을 객관적으로 평가합니다.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 pt-2 border-t border-slate-800/80">
            <span>분석 보기</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('news')}
          className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all shadow-md cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Newspaper className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              AI 뉴스 핵심 요약
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              주요 금융 이슈의 핵심 내용과 기업에 미칠 잠재적 영향을 긍정·부정 요인으로 분리 요약합니다.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 pt-2 border-t border-slate-800/80">
            <span>뉴스 보기</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('compare')}
          className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all shadow-md cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              투자 지표 상대 비교
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              경쟁 기업 간 주가수익비율(PER), 부채비율, 성장성을 표와 그래프로 한눈에 비교합니다.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 pt-2 border-t border-slate-800/80">
            <span>비교하기</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 6. Legal Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
