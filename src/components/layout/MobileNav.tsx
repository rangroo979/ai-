import React, { useState } from 'react';
import { useWatchlist } from '../../context/WatchlistContext';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Star,
  Menu,
  X,
  Globe,
  Newspaper,
  Scale,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onNavigate }) => {
  const { watchlistCodes } = useWatchlist();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNav = [
    { id: 'home', label: '홈', icon: LayoutDashboard },
    { id: 'search', label: '검색', icon: Search },
    { id: 'ai', label: 'AI 분석', icon: Sparkles },
    { id: 'watchlist', label: '관심종목', icon: Star, count: watchlistCodes.length },
  ];

  const moreItems = [
    { id: 'market', label: '시장분석', icon: Globe },
    { id: 'news', label: '뉴스분석', icon: Newspaper },
    { id: 'compare', label: '종목비교', icon: Scale },
    { id: 'settings', label: '설정 & 용어', icon: Settings },
  ];

  const handleSelect = (tab: string) => {
    onNavigate(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Slide-up Modal */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs flex flex-col justify-end md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-[#111827] border-t border-slate-700 rounded-t-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white">전체 메뉴</span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="text-slate-400 p-1 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#0b0f19] border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0d1322]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 flex items-center justify-around md:hidden shadow-2xl">
        {mainNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer relative ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Button */}
        <button
          type="button"
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            showMoreMenu || ['market', 'news', 'compare', 'settings'].includes(activeTab)
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">더보기</span>
        </button>
      </nav>
    </>
  );
};
