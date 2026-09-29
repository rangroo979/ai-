import React, { useState } from 'react';
import { StockItem, NewsItem } from '../../types';
import { MOCK_NEWS } from '../../data/mockNews';
import { Sparkles, Newspaper, ChevronDown, ChevronUp, AlertCircle, ArrowUpRight } from 'lucide-react';

interface StockNewsTabProps {
  stock: StockItem;
}

export const StockNewsTab: React.FC<StockNewsTabProps> = ({ stock }) => {
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);

  const relatedNews = MOCK_NEWS.filter(
    n => n.relatedStockCodes.includes(stock.code) || stock.newsIds.includes(n.id)
  );

  const toggleExpand = (id: string) => {
    setExpandedNewsId(prev => (prev === id ? null : id));
  };

  if (relatedNews.length === 0) {
    return (
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
        <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-300">
          관련된 데모 뉴스가 아직 없습니다.
        </h4>
        <p className="text-xs text-slate-500">
          전체 뉴스 분석 탭에서 시장 전반의 AI 요약 기사를 확인해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Newspaper className="w-4 h-4 text-blue-400" />
          <span>{stock.name} 관련 주요 뉴스 ({relatedNews.length}건)</span>
        </div>
        <span className="text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          가상 시뮬레이션 데모 뉴스
        </span>
      </div>

      <div className="space-y-3">
        {relatedNews.map(news => {
          const isExpanded = expandedNewsId === news.id;
          return (
            <div
              key={news.id}
              className="bg-[#101827] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-blue-400 font-medium">{news.press}</span>
                    <span aria-hidden="true">·</span>
                    <span>{news.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[10px] text-slate-300">
                      {news.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                    {news.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {news.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(news.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shrink-0 cursor-pointer self-start sm:self-center ${
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

              {/* Expandable AI Summary Card */}
              {isExpanded && news.aiAnalysis && (
                <div className="mt-4 pt-4 border-t border-slate-800 bg-[#0b0f19] rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini AI 뉴스 심층 분석</span>
                  </div>

                  {/* Core content */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      핵심 내용
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {news.aiAnalysis.coreContent}
                    </p>
                  </div>

                  {/* Market Impact */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      기업 및 시장에 미칠 영향
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {news.aiAnalysis.marketImpact}
                    </p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-emerald-400 block mb-1">
                        긍정적 요소
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {news.aiAnalysis.positiveFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-amber-400 block mb-1">
                        부정적 요소
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {news.aiAnalysis.negativeFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-amber-400 font-bold shrink-0">⚠</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cautions */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{news.aiAnalysis.cautions}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
