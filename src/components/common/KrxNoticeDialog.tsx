import React from 'react';
import { Database, X, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useStockData } from '../../context/StockDataContext';

export const KrxNoticeDialog: React.FC = () => {
  const { isKrxNoticeOpen, closeKrxNotice, baseDateFormatted } = useStockData();

  if (!isKrxNoticeOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeKrxNotice}
    >
      <div
        className="bg-[#111827] border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                KRX 데이터 안내
              </h3>
              <span className="text-[11px] text-slate-400">
                한국거래소 공식 일별매매 데이터
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeKrxNotice}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-sm text-slate-300 leading-relaxed">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-semibold text-emerald-200">
                한국거래소(KRX)의 거래일 기준 데이터입니다.
                <br />
                장중 실시간 현재가와 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">기준 거래일</span>
              <strong className="text-white font-mono">{baseDateFormatted}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">제공 가격</span>
              <span className="text-emerald-400 font-semibold">최근 거래일 확정 종가 (TDD_CLSPRC)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">연동 API</span>
              <span className="text-slate-200 font-mono">KRX stk_bydd_trd / ksq_bydd_trd</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            본 서비스는 증권사의 실시간 틱/호가 매매용이 아니며, 한국거래소의 확정된 일별 매매데이터와 재무제표를 바탕으로 Gemini AI가 기업 가치와 위험 요인을 분석하는 투자 의사결정 지원 플랫폼입니다.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={closeKrxNotice}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
