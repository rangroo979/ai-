import React, { useState } from 'react';
import { Database, Info, X, CheckCircle2, Globe, ShieldCheck, AlertCircle, Server } from 'lucide-react';
import { useStockData } from '../../context/StockDataContext';

export const DemoBadge: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { isKrxLive, baseDateFormatted } = useStockData();

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer ${
          isKrxLive
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
            : 'bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
        }`}
        title={isKrxLive ? 'KRX 거래일 데이터 연동 상태' : '데모 모드 안내 확인'}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isKrxLive ? 'bg-emerald-400' : 'bg-blue-400'
          }`}
        />
        <span>{isKrxLive ? 'KRX 거래일 데이터' : 'DEMO MODE'}</span>
        <Info className="w-3 h-3 opacity-80" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className="bg-[#111827] border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isKrxLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    데이터 연동 현황 및 출처 안내
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    국내 종목 KRX 실거래가 연동 · 시장지표 Demo 구분
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm text-slate-300 leading-relaxed">
              {/* Summary table */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">국내 종목 (KOSPI/KOSDAQ)</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    KRX 연결 정상
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">국내 시장지수 (KOSPI/KOSDAQ)</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    미연결 (DEMO)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">미국 주식 (NASDAQ/NYSE)</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    미연결 / DEMO
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">미국 시장지수 (S&P 500/NASDAQ)</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    미연결 / DEMO
                  </span>
                </div>
              </div>

              {isKrxLive ? (
                <div className="bg-[#0b0f19] border border-emerald-500/30 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>한국거래소(KRX) 공식 OPEN API 일별매매 데이터 반영</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    삼성전자, SK하이닉스, NAVER, 카카오 등 국내 2,700여 개 전 종목의 실제 체결 종가(TDD_CLSPRC), 대비, 등락률, 시가/고가/저가, 거래량/거래대금, 시가총액이 <strong>{baseDateFormatted}</strong>로 정확히 반영되어 있습니다.
                  </p>
                </div>
              ) : null}

              <div className="flex items-center gap-2 text-xs text-blue-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Gemini 3.8 Flash AI 분석 엔진은 서버사이드 프록시를 통해 안전하게 연동됩니다.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
