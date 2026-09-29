import React from 'react';
import { useWatchlist } from '../../context/WatchlistContext';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Globe,
  Newspaper,
  Star,
  Scale,
  Settings,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const { watchlistCodes } = useWatchlist();

  const menuItems = [
    { id: 'home', label: '홈', icon: LayoutDashboard },
    { id: 'search', label: '종목검색', icon: Search },
    { id: 'ai', label: 'AI 분석', icon: Sparkles, badge: 'AI' },
    { id: 'market', label: '시장분석', icon: Globe },
    { id: 'news', label: '뉴스분석', icon: Newspaper },
    { id: 'watchlist', label: '관심종목', icon: Star, count: watchlistCodes.length },
    { id: 'compare', label: '종목비교', icon: Scale },
    { id: 'settings', label: '설정 & 용어', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col justify-between py-6 px-3 bg-[#0d1322] border-r border-slate-800/80 min-h-[calc(100vh-61px)]">
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          메뉴
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {item.badge}
                </span>
              )}

              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Information Card */}
      <div className="bg-[#101827] border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>투자 결정 유의사항</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          AI 분석은 투자 판단 참고용이며 수익을 보장하지 않습니다.
        </p>
      </div>
    </aside>
  );
};
