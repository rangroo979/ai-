import React, { useState } from 'react';
import { StockItem, AIAnalysisResult } from '../../types';
import { fetchStockAnalysis } from '../../services/aiService';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  DollarSign,
  Scale,
  Info,
} from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface AiStockAnalysisTabProps {
  stock: StockItem;
}

export const AiStockAnalysisTab: React.FC<AiStockAnalysisTabProps> = ({ stock }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchStockAnalysis(stock);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingBadge = (rating: '좋음' | '보통' | '주의') => {
    switch (rating) {
      case '좋음':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">좋음</span>;
      case '보통':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">보통</span>;
      case '주의':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">주의</span>;
    }
  };

  const getReliabilityBadge = (rel: '높음' | '보통' | '낮음') => {
    switch (rel) {
      case '높음':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">신뢰도: 높음</span>;
      case '보통':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">신뢰도: 보통</span>;
      case '낮음':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">신뢰도: 낮음</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white">
              Gemini AI 종목 분석
            </h3>
            <span className="text-xs text-slate-400">
              ({stock.name} · {stock.code})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            재무제표, 밸류에이션, 성장 잠재력, 잠재 위험요인을 다각도로 종합 분석합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-98 shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI가 분석하는 중...</span>
            </>
          ) : analysis ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>AI 재분석 요청</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>AI 분석 시작</span>
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#101827] border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">
              AI가 기업 데이터를 분석하고 있습니다.
            </h4>
            <p className="text-xs text-slate-400 max-w-md">
              재무 건전성, 밸류에이션, 시장 포지셔닝 및 최근 시장 이슈를 기반으로 객관적인 투자 참고 보고서를 생성 중입니다...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-200 font-medium">{error}</p>
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>다시 시도</span>
          </button>
        </div>
      )}

      {/* Initial Empty State */}
      {!analysis && !isLoading && !error && (
        <div className="bg-[#101827] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-bold text-white">
              {stock.name} 종목의 AI 심층 분석을 확인해보세요
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              상단의 <strong>[AI 분석 시작]</strong> 버튼을 누르면 Gemini AI가 현재가, 매출·영업이익, 재무건전성, 긍정요인 및 주의요인을 일목요연하게 정리해 드립니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            지금 분석 시작하기
          </button>
        </div>
      )}

      {/* Analysis Result Display */}
      {analysis && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. AI Comprehensive Summary */}
          <div className="bg-gradient-to-br from-[#121c33] to-[#101827] border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h4 className="text-base font-bold text-white">
                  AI 종합 분석
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{analysis.analyzedAt}</span>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {analysis.summary}
            </p>
          </div>

          {/* 2. Positive vs Caution Factors (Side-by-side on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Factors */}
            <div className="bg-[#101827] border border-emerald-500/20 rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-emerald-400">
                  긍정적 요인 (기회 요인)
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 flex-1">
                {analysis.positiveFactors.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Caution Factors */}
            <div className="bg-[#101827] border border-amber-500/20 rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-amber-400">
                  주의 요인 (위험 요인)
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 flex-1">
                {analysis.cautionFactors.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. 4-Pillar Financial Health Breakdown */}
          <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  재무 지표 분석 평가
                </h4>
                <p className="text-xs text-slate-400">
                  단순 점수가 아닌 객관적 근거에 기반한 4대 핵심 영역 평가입니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 수익성 */}
              <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">수익성</span>
                  </div>
                  {getRatingBadge(analysis.evaluation.profitability.rating)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {analysis.evaluation.profitability.reason}
                </p>
              </div>

              {/* 성장성 */}
              <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">성장성</span>
                  </div>
                  {getRatingBadge(analysis.evaluation.growth.rating)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {analysis.evaluation.growth.reason}
                </p>
              </div>

              {/* 안정성 */}
              <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">안정성</span>
                  </div>
                  {getRatingBadge(analysis.evaluation.stability.rating)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {analysis.evaluation.stability.reason}
                </p>
              </div>

              {/* 밸류에이션 */}
              <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-slate-200">밸류에이션</span>
                  </div>
                  {getRatingBadge(analysis.evaluation.valuation.rating)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {analysis.evaluation.valuation.reason}
                </p>
              </div>
            </div>
          </div>

          {/* 4. AI Analysis Reliability */}
          <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              {getReliabilityBadge(analysis.reliability)}
              <span className="text-slate-300">
                {analysis.reliabilityReason}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 shrink-0">
              <Info className="w-3.5 h-3.5" />
              <span>공식 사업보고서 및 감사보고서 교차 검증 권장</span>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <DisclaimerBanner />
        </div>
      )}
    </div>
  );
};
