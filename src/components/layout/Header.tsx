import React from 'react';
import { DemoBadge } from '../common/DemoBadge';
import { useWatchlist } from '../../context/WatchlistContext';
import {
  TrendingUp,
  Search,
  Star,
  Settings,
  Sparkles,
  BarChart2,
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeTab }) => {
  const { watchlistCodes } = useWatchlist();

  return (
    <header className="sticky top-0 z-30 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo / Brand Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                AI 투자 분석
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              데이터로 더 현명한 투자 결정을
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DEMO MODE Badge */}
          <DemoBadge />

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => onNavigate('search')}
            aria-label="종목 검색"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#101827] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="종목 검색"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Watchlist Quick Button */}
          <button
            type="button"
            onClick={() => onNavigate('watchlist')}
            aria-label="관심종목"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-[#101827] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="관심종목 바로가기"
          >
            <Star className={`w-3.5 h-3.5 ${watchlistCodes.length > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">관심종목</span>
            {watchlistCodes.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400">
                {watchlistCodes.length}
              </span>
            )}
          </button>

          {/* Settings / Glossary Button */}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            aria-label="설정 및 용어사전"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#101827] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title="설정 및 투자용어"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
