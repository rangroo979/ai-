import React, { useState } from 'react';
import { GLOSSARY_TERMS } from '../../data/glossary';
import { useStockData } from '../../context/StockDataContext';
import {
  BookOpen,
  Search,
  Lightbulb,
  Sliders,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Server,
  Globe,
  Radio,
} from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const GlossaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'glossary' | 'settings'>('glossary');
  const { isKrxLive, baseDateFormatted } = useStockData();

  const termsList = Object.entries(GLOSSARY_TERMS).filter(([key, item]) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      key.toLowerCase().includes(q) ||
      item.term.toLowerCase().includes(q) ||
      item.shortDesc.toLowerCase().includes(q) ||
      (item.abbr && item.abbr.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>투자 가이드 및 설정</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            초보 투자자를 위한 핵심 지표 설명 사전과 데이터 연동 상태 및 시스템 설정을 확인하세요.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#101827] p-1 rounded-xl border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'glossary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            투자 용어 사전
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            서비스 설정 및 정보
          </button>
        </div>
      </div>

      {activeTab === 'glossary' ? (
        <div className="space-y-5">
          {/* Search Bar */}
          <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="투자 용어 검색 (예: PER, ROE, 배당수익률, 시가총액)"
                className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Glossary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {termsList.map(([key, term]) => (
              <div
                key={key}
                className="bg-[#101827] border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2.5">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{term.term}</span>
                      </h3>
                      {term.abbr && (
                        <span className="text-[11px] font-mono text-blue-400">
                          {term.abbr}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                      기초 지표
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {term.fullDesc}
                  </p>

                  {term.formula && (
                    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-lg p-2.5 text-xs mb-2">
                      <span className="text-[11px] text-slate-500 block mb-0.5">계산 공식:</span>
                      <code className="text-blue-300 font-mono font-medium text-xs">
                        {term.formula}
                      </code>
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block mb-0.5">초보 투자자 Tip:</strong>
                    <span>{term.beginnerTip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="space-y-5">
          <div className="bg-[#101827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>시스템 및 데이터 연결 상태</span>
            </h3>

            {/* 1. Data Connection Status Panel (Requested by User) */}
            <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">데이터 연결 상태 (Data Source Status)</h4>
                    <span className="text-xs text-slate-400">국내외 종목 및 시장 지수 API 연동 현황</span>
                  </div>
                </div>
                {baseDateFormatted && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto flex items-center gap-1.5">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>최근 거래일: {baseDateFormatted}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. 국내 종목 */}
                <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">국내 종목</span>
                      <span className="text-[10px] text-slate-500 font-mono">KOSPI / KOSDAQ</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      한국거래소(KRX) 공식 일별 매매정보 (2,700+ 전 종목 체결가)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {isKrxLive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        KRX 연결 정상
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        미연결 / DEMO
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. 국내 시장지수 */}
                <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">국내 시장지수</span>
                      <span className="text-[10px] text-slate-500 font-mono">KOSPI, KOSDAQ</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      KRX 지수 전용 API (현재 계정 미인가 상태 / DEMO 제공)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      <AlertCircle className="w-3.5 h-3.5" />
                      미연결
                    </span>
                  </div>
                </div>

                {/* 3. 미국 주식 */}
                <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">미국 주식</span>
                      <span className="text-[10px] text-slate-500 font-mono">NASDAQ / NYSE</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Apple, NVIDIA, Tesla 등 해외 대표 우량주
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      <Globe className="w-3.5 h-3.5" />
                      미연결 / DEMO
                    </span>
                  </div>
                </div>

                {/* 4. 미국 시장지수 */}
                <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">미국 시장지수</span>
                      <span className="text-[10px] text-slate-500 font-mono">S&P 500, NASDAQ</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      미국 주요 지수 데이터 (시뮬레이션 데모 지수)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      <Globe className="w-3.5 h-3.5" />
                      미연결 / DEMO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. System and Engine Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* KRX Integration Card */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Database className="w-4 h-4" />
                  <span>KRX OPEN API 연동 정보</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-white">data-dbg.krx.co.kr</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    AUTH_KEY 인증
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  유가증권(stk_bydd_trd) 및 코스닥(ksq_bydd_trd) 일별매매 엔드포인트를 통해 실거래 데이터를 서버에서 수신합니다.
                </p>
              </div>

              {/* AI Engine Info */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Cpu className="w-4 h-4" />
                  <span>AI 분석 엔진</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-white">Gemini 3.8 Flash</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    서버사이드 연동
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  API Key는 클라이언트에 노출되지 않고 Node.js 백엔드 프록시에서 안전하게 보호됩니다.
                </p>
              </div>
            </div>

            {/* Design Rules Summary */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                한국 주식시장 표준 디자인 가이드 적용
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span>주가 상승 (빨간색)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>주가 하락 (파란색)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#0b0f19] border border-slate-700" />
                  <span>다크모드 금융 대시보드</span>
                </div>
              </div>
            </div>
          </div>

          <DisclaimerBanner />
        </div>
      )}
    </div>
  );
};
