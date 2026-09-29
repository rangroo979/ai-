import React, { useState } from 'react';
import { StockItem, AICompareResult, StockMaster } from '../../types';
import { STOCK_MASTER_LIST } from '../../data/stocksMaster';
import { getStockDetail } from '../../services/stockService';
import { fetchStockComparison } from '../../services/aiService';
import { TermTooltip } from '../common/TermTooltip';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Scale,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  BarChart2,
  Search,
} from 'lucide-react';

interface StockCompareViewProps {
  onSelectStock: (stock: StockItem) => void;
}

export const StockCompareView: React.FC<StockCompareViewProps> = ({ onSelectStock }) => {
  // Initial 2 stocks: 삼성전자 and SK하이닉스
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['005930', '000660']);
  const [comparisonResult, setComparisonResult] = useState<AICompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const selectedStocks = selectedCodes
    .map(c => getStockDetail(c))
    .filter(Boolean) as StockItem[];

  const availableMasters = STOCK_MASTER_LIST.filter(
    s => !selectedCodes.includes(s.symbol) &&
    (quickSearch === '' ||
      s.koreanName.toLowerCase().includes(quickSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
      s.symbol.toLowerCase().includes(quickSearch.toLowerCase()))
  );

  const handleAddStock = (code: string) => {
    if (selectedCodes.length < 3 && !selectedCodes.includes(code)) {
      setSelectedCodes(prev => [...prev, code]);
      setComparisonResult(null); // Reset AI comparison when set changes
    }
  };

  const handleRemoveStock = (code: string) => {
    if (selectedCodes.length > 1) {
      setSelectedCodes(prev => prev.filter(c => c !== code));
      setComparisonResult(null);
    }
  };

  const handleRunAiComparison = async () => {
    if (selectedStocks.length < 2) return;
    setIsLoading(true);
    try {
      const res = await fetchStockComparison(selectedStocks);
      setComparisonResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-blue-400" />
            <span>종목 비교 분석</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            최대 3개 종목의 주요 투자 지표와 재무 데이터를 나란히 비교하고 Gemini AI의 심층 분석을 확인합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunAiComparison}
          disabled={selectedStocks.length < 2 || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer self-start sm:self-center"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI가 비교 분석 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>AI 비교 분석 시작</span>
            </>
          )}
        </button>
      </div>

      {/* Selected Stock Chips & Selector */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            비교 대상 종목 ({selectedStocks.length}/3)
          </span>
          {selectedCodes.length < 3 && (
            <span className="text-xs text-slate-500">
              아래 목록에서 종목을 클릭하여 추가할 수 있습니다.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedStocks.map(stock => (
            <div
              key={stock.id}
              className="flex items-center gap-2 bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-medium text-white shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-bold">{stock.name}</span>
              <span className="text-slate-500 font-mono">({stock.code})</span>
              {selectedCodes.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStock(stock.code)}
                  className="text-slate-400 hover:text-red-400 ml-1 p-0.5"
                  title="제거"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Quick Add Available Stocks */}
          {selectedCodes.length < 3 && (
            <div className="flex flex-wrap items-center gap-1.5 pl-2">
              <span className="text-[11px] text-slate-500">추가 종목:</span>
              {availableMasters.slice(0, 6).map(s => (
                <button
                  key={s.symbol}
                  type="button"
                  onClick={() => handleAddStock(s.symbol)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700/60 transition-colors"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>{s.koreanName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <span>핵심 투자 지표 및 밸류에이션 비교</span>
        </h3>

        <table className="w-full text-xs text-left min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-[#0b0f19]/60">
              <th className="py-3 px-4 font-semibold w-1/4">비교 항목</th>
              {selectedStocks.map(stock => (
                <th key={stock.id} className="py-3 px-4 font-semibold text-right">
                  <div className="text-white font-bold text-sm">{stock.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {stock.code} · {stock.market}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {/* 현재가 */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                현재 주가
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-mono font-bold text-white">
                  {s.currentPrice.toLocaleString()} {s.currency}
                </td>
              ))}
            </tr>

            {/* 등락률 */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                등락률
              </td>
              {selectedStocks.map(s => (
                <td
                  key={s.id}
                  className={`py-3 px-4 text-right font-mono font-bold ${
                    s.changeRate >= 0 ? 'text-red-500' : 'text-blue-500'
                  }`}
                >
                  {s.changeRate >= 0 ? '+' : ''}
                  {s.changeRate.toFixed(2)}%
                </td>
              ))}
            </tr>

            {/* 시가총액 */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="시가총액" label="시가총액" />
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-medium text-slate-200">
                  {s.companyInfo.marketCapFormatted}
                </td>
              ))}
            </tr>

            {/* 업종 */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                업종
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right text-slate-300">
                  {s.companyInfo.sector}
                </td>
              ))}
            </tr>

            {/* PER */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="PER" label="PER (주가수익비율)" />
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-mono text-slate-100 font-semibold">
                  {s.financialRatios.per}배
                </td>
              ))}
            </tr>

            {/* PBR */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="PBR" label="PBR (주가순자산비율)" />
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-mono text-slate-100 font-semibold">
                  {s.financialRatios.pbr}배
                </td>
              ))}
            </tr>

            {/* ROE */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="ROE" label="ROE (자기자본이익률)" />
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                  {s.financialRatios.roe}%
                </td>
              ))}
            </tr>

            {/* 부채비율 */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="부채비율" label="부채비율" />
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-mono text-slate-200">
                  {s.financialRatios.debtRatio}%
                </td>
              ))}
            </tr>

            {/* 배당수익률 */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="배당수익률" label="배당수익률" />
              </td>
              {selectedStocks.map(s => (
                <td key={s.id} className="py-3 px-4 text-right font-mono text-blue-400 font-semibold">
                  {s.financialRatios.dividendYield}%
                </td>
              ))}
            </tr>

            {/* 최근 연도 매출 */}
            <tr className="hover:bg-slate-800/30 bg-[#0b0f19]/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                최근 연도 매출액
              </td>
              {selectedStocks.map(s => {
                const latest = s.financialYears[s.financialYears.length - 1];
                return (
                  <td key={s.id} className="py-3 px-4 text-right font-mono text-slate-200">
                    {latest?.revenue.toLocaleString()} {s.currency === 'KRW' ? '억 원' : 'M USD'}
                  </td>
                );
              })}
            </tr>

            {/* 최근 연도 영업이익 */}
            <tr className="hover:bg-slate-800/30 bg-[#0b0f19]/30">
              <td className="py-3 px-4 font-medium text-slate-300">
                <TermTooltip termKey="영업이익" label="최근 연도 영업이익" />
              </td>
              {selectedStocks.map(s => {
                const latest = s.financialYears[s.financialYears.length - 1];
                const isOpUp = latest ? latest.operatingIncome >= 0 : true;
                return (
                  <td
                    key={s.id}
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      isOpUp ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {latest?.operatingIncome.toLocaleString()} {s.currency === 'KRW' ? '억 원' : 'M USD'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI Comparison Results Section */}
      {comparisonResult && (
        <div className="bg-gradient-to-br from-[#121c33] via-[#101827] to-[#0c1424] border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">
                Gemini AI 다각적 종목 비교 분석
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              객관적 상대 비교 평가
            </span>
          </div>

          {/* Overall Summary */}
          <div className="bg-[#0b0f19]/80 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-bold text-blue-400 block mb-1">
              종합 비교 총평
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {comparisonResult.summary}
            </p>
          </div>

          {/* Strengths & Risks per Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-[#0b0f19]/50 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>기업별 핵심 경쟁력 & 강점</span>
              </div>
              <div className="space-y-2">
                {comparisonResult.strengths.map((item, idx) => (
                  <div key={idx} className="bg-[#101827] p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-white block mb-0.5">
                      {item.stockName} ({item.stockCode})
                    </span>
                    <span className="text-slate-300 leading-relaxed block">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="bg-[#0b0f19]/50 border border-amber-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>기업별 주요 주의 요인 & 리스크</span>
              </div>
              <div className="space-y-2">
                {comparisonResult.risks.map((item, idx) => (
                  <div key={idx} className="bg-[#101827] p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-white block mb-0.5">
                      {item.stockName} ({item.stockCode})
                    </span>
                    <span className="text-slate-300 leading-relaxed block">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial & Growth Comparison Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0b0f19]/80 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-400 block">재무 건전성 및 수익성 비교</span>
              <p className="text-slate-300 leading-relaxed">
                {comparisonResult.financialComparison}
              </p>
            </div>
            <div className="bg-[#0b0f19]/80 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="font-bold text-indigo-400 block">미래 성장성 및 산업 모멘텀</span>
              <p className="text-slate-300 leading-relaxed">
                {comparisonResult.growthComparison}
              </p>
            </div>
          </div>

          {/* Balanced Conclusion Note */}
          <div className="bg-[#080d17] border border-slate-800/80 p-3.5 rounded-xl text-xs text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{comparisonResult.conclusionNote}</span>
          </div>
        </div>
      )}

      {/* Legal Banner */}
      <DisclaimerBanner />
    </div>
  );
};
