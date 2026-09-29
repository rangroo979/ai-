import React, { useState } from 'react';
import { StockItem } from '../../types';
import { TermTooltip } from '../common/TermTooltip';
import { BarChart3, TrendingUp, DollarSign, Layers } from 'lucide-react';

interface FinancialsTabProps {
  stock: StockItem;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ stock }) => {
  const [metricTab, setMetricTab] = useState<'revenue' | 'operatingIncome' | 'netIncome'>('revenue');

  const years = stock.financialYears;
  const isKRW = stock.currency === 'KRW';
  const unitLabel = isKRW ? '억 원' : 'M USD';

  const maxVal = Math.max(
    ...years.map(y => Math.max(Math.abs(y.revenue), Math.abs(y.operatingIncome), Math.abs(y.netIncome)))
  ) || 1;

  return (
    <div className="space-y-6">
      {/* 1. Key Valuation / Financial Ratios Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/20 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </span>
            <span>주요 투자 지표</span>
          </h3>
          <span className="text-xs text-slate-400">
            ? 아이콘을 누르면 초보자용 설명을 볼 수 있습니다.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* PER */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="PER" label="PER" />
              <span className="text-[10px] text-slate-500">배수</span>
            </div>
            <span className="text-lg font-bold font-mono text-white">
              {stock.financialRatios.per}배
            </span>
            <span className="text-[10px] text-slate-500 mt-1">주가수익비율</span>
          </div>

          {/* PBR */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="PBR" label="PBR" />
              <span className="text-[10px] text-slate-500">배수</span>
            </div>
            <span className="text-lg font-bold font-mono text-white">
              {stock.financialRatios.pbr}배
            </span>
            <span className="text-[10px] text-slate-500 mt-1">주가순자산비율</span>
          </div>

          {/* ROE */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="ROE" label="ROE" />
              <span className="text-[10px] text-emerald-400 font-semibold">%</span>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {stock.financialRatios.roe}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1">자기자본이익률</span>
          </div>

          {/* 부채비율 */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="부채비율" label="부채비율" />
              <span className="text-[10px] text-slate-500">%</span>
            </div>
            <span className="text-lg font-bold font-mono text-white">
              {stock.financialRatios.debtRatio}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1">재무건전성</span>
          </div>

          {/* 배당수익률 */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="배당수익률" label="배당수익률" />
              <span className="text-[10px] text-blue-400 font-semibold">%</span>
            </div>
            <span className="text-lg font-bold font-mono text-blue-400">
              {stock.financialRatios.dividendYield}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1">연간 환산</span>
          </div>

          {/* EPS */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="EPS" label="EPS" />
              <span className="text-[10px] text-slate-500">{stock.currency}</span>
            </div>
            <span className="text-base font-bold font-mono text-white truncate">
              {stock.financialRatios.eps.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">주당순이익</span>
          </div>

          {/* BPS */}
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <TermTooltip termKey="BPS" label="BPS" />
              <span className="text-[10px] text-slate-500">{stock.currency}</span>
            </div>
            <span className="text-base font-bold font-mono text-white truncate">
              {stock.financialRatios.bps.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">주당순자산</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Bar Trend for Annual Performance */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>연도별 경영 실적 추이</span>
            </h4>
            <span className="text-xs text-slate-400">단위: {unitLabel}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMetricTab('revenue')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                metricTab === 'revenue' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              매출액
            </button>
            <button
              type="button"
              onClick={() => setMetricTab('operatingIncome')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                metricTab === 'operatingIncome' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              영업이익
            </button>
            <button
              type="button"
              onClick={() => setMetricTab('netIncome')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                metricTab === 'netIncome' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              당기순이익
            </button>
          </div>
        </div>

        {/* Visual Bar Comparison */}
        <div className="grid grid-cols-4 gap-4 h-48 items-end pt-4 pb-2 px-4 bg-[#0b0f19]/60 rounded-xl border border-slate-800/80">
          {years.map(y => {
            const val = y[metricTab];
            const isNegative = val < 0;
            const heightPercent = Math.min(100, Math.max(8, (Math.abs(val) / maxVal) * 100));

            return (
              <div key={y.year} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono text-slate-300 font-semibold">
                  {val.toLocaleString()}
                </span>
                <div
                  className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                    isNegative ? 'bg-blue-500' : 'bg-gradient-to-t from-blue-700 to-blue-500'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs text-slate-400 font-medium">
                  {y.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Comprehensive Financial Statement Table */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 shadow-md overflow-x-auto">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>연도별 요약 재무제표</span>
        </h4>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-[#0b0f19]/60">
              <th className="py-2.5 px-3 font-semibold">항목 (단위: {unitLabel})</th>
              {years.map(y => (
                <th key={y.year} className="py-2.5 px-3 text-right font-semibold font-mono">
                  {y.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">
                <TermTooltip termKey="매출" label="매출액" />
              </td>
              {years.map(y => (
                <td key={y.year} className="py-2.5 px-3 text-right text-slate-100 font-semibold">
                  {y.revenue.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">
                <TermTooltip termKey="영업이익" label="영업이익" />
              </td>
              {years.map(y => (
                <td
                  key={y.year}
                  className={`py-2.5 px-3 text-right font-semibold ${
                    y.operatingIncome >= 0 ? 'text-red-400' : 'text-blue-400'
                  }`}
                >
                  {y.operatingIncome.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-3 font-sans text-slate-300">
                당기순이익
              </td>
              {years.map(y => (
                <td
                  key={y.year}
                  className={`py-2.5 px-3 text-right ${
                    y.netIncome >= 0 ? 'text-slate-200' : 'text-blue-400'
                  }`}
                >
                  {y.netIncome.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-3 font-sans text-slate-400">
                자산총계
              </td>
              {years.map(y => (
                <td key={y.year} className="py-2.5 px-3 text-right text-slate-400">
                  {y.assets.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-3 font-sans text-slate-400">
                부채총계
              </td>
              {years.map(y => (
                <td key={y.year} className="py-2.5 px-3 text-right text-slate-400">
                  {y.liabilities.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-800/30 bg-[#0b0f19]/30">
              <td className="py-2.5 px-3 font-sans text-slate-300">
                순자산(자기자본)
              </td>
              {years.map(y => (
                <td key={y.year} className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                  {(y.assets - y.liabilities).toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
