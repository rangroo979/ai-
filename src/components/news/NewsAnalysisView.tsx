import React, { useState, useMemo } from 'react';
import { NewsItem, StockItem } from '../../types';
import { MOCK_NEWS } from '../../data/mockNews';
import { MOCK_STOCKS } from '../../data/mockStocks';
import {
  Newspaper,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface NewsAnalysisViewProps {
  onSelectStockByCode: (code: string) => void;
}

export const NewsAnalysisView: React.FC<NewsAnalysisViewProps> = ({ onSelectStockByCode }) => {
  const [filter, setFilter] = useState<'all' | 'corporate' | 'market' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(MOCK_NEWS[0]?.id || null);

  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(news => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        news.title.toLowerCase().includes(q) ||
        news.summary.toLowerCase().includes(q) ||
        news.press.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Filter
      if (filter === 'corporate') return news.category === '기업';
      if (filter === 'market') return news.category === '시장';
      if (filter === 'ai') return !!news.aiAnalysis;
      return true;
    });
  }, [filter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedNewsId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Newspaper className="w-6 h-6 text-blue-400" />
            <span>AI 뉴스 분석</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            증시 주요 이슈와 기업 뉴스를 Gemini AI가 팩트 기반으로 핵심만 요약해 드립니다.
          </p>
        </div>

        <div className="text-[11px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/25 self-start sm:self-center">
          모든 기사는 시뮬레이션 데모 데이터입니다
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800 self-start">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 ({MOCK_NEWS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('corporate')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'corporate'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              기업뉴스
            </button>
            <button
              type="button"
              onClick={() => setFilter('market')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'market'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              시장뉴스
            </button>
            <button
              type="button"
              onClick={() => setFilter('ai')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 요약 완료</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="뉴스 검색 (예: 반도체, AI, 테슬라)"
              className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* News Articles List */}
      <div className="space-y-4">
        {filteredNews.map(news => {
          const isExpanded = expandedNewsId === news.id;

          return (
            <div
              key={news.id}
              className="bg-[#101827] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all shadow-md"
            >
              {/* Top metadata */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-blue-400 font-semibold">{news.press}</span>
                    <span aria-hidden="true">·</span>
                    <span>{news.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {news.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {news.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {news.summary}
                  </p>

                  {/* Related Stocks Tags */}
                  {news.relatedStockCodes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500">관련 종목:</span>
                      {news.relatedStockCodes.map(code => {
                        const stock = MOCK_STOCKS.find(s => s.code === code);
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => onSelectStockByCode(code)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#0b0f19] hover:bg-slate-800 border border-slate-800 text-xs text-blue-400 font-medium transition-colors"
                          >
                            <span>{stock ? stock.name : code}</span>
                            <ArrowRight className="w-3 h-3 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AI Summary Toggle Action */}
                <button
                  type="button"
                  onClick={() => toggleExpand(news.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer self-start sm:self-center ${
                    isExpanded
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isExpanded ? '요약 닫기' : 'AI 핵심 요약'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable AI Deep Summary */}
              {isExpanded && news.aiAnalysis && (
                <div className="mt-5 pt-5 border-t border-slate-800 bg-[#0b0f19] rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Gemini AI 뉴스 심층 분석 리포트</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      투자 판단 참고용 분석
                    </span>
                  </div>

                  {/* 1. 핵심 내용 */}
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1">
                      1. 핵심 내용
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-[#101827] p-3 rounded-xl border border-slate-800/80">
                      {news.aiAnalysis.coreContent}
                    </p>
                  </div>

                  {/* 2. 시장 및 기업 영향 */}
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1">
                      2. 기업 및 시장에 미칠 가능성이 있는 영향
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-[#101827] p-3 rounded-xl border border-slate-800/80">
                      {news.aiAnalysis.marketImpact}
                    </p>
                  </div>

                  {/* 3. 긍정적 / 부정적 요소 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* 긍정 */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 block">
                        긍정적 요소
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5">
                        {news.aiAnalysis.positiveFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 부정 */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-bold text-amber-400 block">
                        부정적 요소
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5">
                        {news.aiAnalysis.negativeFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold shrink-0">⚠</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 4. 주의사항 */}
                  <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-300 block mb-0.5">투자자 주의사항:</strong>
                      <span>{news.aiAnalysis.cautions}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
