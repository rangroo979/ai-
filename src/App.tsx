import React, { useState, useEffect } from 'react';
import { MOCK_STOCKS } from './data/mockStocks';
import { MOCK_INDICES } from './data/mockMarket';
import { STOCK_MASTER_LIST } from './data/stocksMaster';
import { StockItem } from './types';
import { getStockDetail, getStockDetailAsync } from './services/stockService';
import { WatchlistProvider } from './context/WatchlistContext';
import { StockDataProvider, useStockData } from './context/StockDataContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { StockSearchView } from './components/search/StockSearchView';
import { StockDetailView } from './components/stock/StockDetailView';
import { MarketAnalysisView } from './components/market/MarketAnalysisView';
import { NewsAnalysisView } from './components/news/NewsAnalysisView';
import { WatchlistView } from './components/watchlist/WatchlistView';
import { StockCompareView } from './components/compare/StockCompareView';
import { GlossaryView } from './components/glossary/GlossaryView';
import { AiStockAnalysisTab } from './components/stock/AiStockAnalysisTab';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { stocks, indices, isKrxLive } = useStockData();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStock, setSelectedStock] = useState<StockItem>(() => {
    return getStockDetail('005930') || MOCK_STOCKS[0];
  });
  const [initialDetailTab, setInitialDetailTab] = useState<'chart' | 'company' | 'financials' | 'news' | 'ai' | 'ask'>('chart');

  // When live KRX stocks load from server, update selectedStock if it's Samsung (or current stock)
  useEffect(() => {
    if (stocks.length > 0) {
      const liveCurrent = stocks.find(s => s.code === selectedStock.code);
      if (liveCurrent && !selectedStock.isLiveKrx) {
        setSelectedStock(liveCurrent);
      }
    }
  }, [stocks]);

  // Parse path or hash for dynamic routing: e.g. /stock/NVDA, /stock/005930, /search, etc.
  useEffect(() => {
    const handleUrlChange = async () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      // Check /stock/:symbol or #/stock/:symbol
      let stockSymbol: string | null = null;
      if (pathname.startsWith('/stock/')) {
        stockSymbol = decodeURIComponent(pathname.replace('/stock/', '').trim());
      } else if (hash.startsWith('#/stock/') || hash.startsWith('#stock/')) {
        stockSymbol = decodeURIComponent(hash.replace(/^#\/?stock\//, '').trim());
      }

      if (stockSymbol) {
        const live = await getStockDetailAsync(stockSymbol);
        const found = live || getStockDetail(stockSymbol);
        if (found) {
          setSelectedStock(found);
          setActiveTab('stock-detail');
          return;
        }
      }

      // Check regular tabs
      const rawTab = (hash.replace(/^#\/?/, '') || pathname.replace(/^\//, '')).split('/')[0];
      if (['search', 'ai', 'market', 'news', 'watchlist', 'compare', 'settings'].includes(rawTab)) {
        setActiveTab(rawTab);
      } else if (!rawTab || rawTab === '' || rawTab === 'home') {
        setActiveTab('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleSelectStock = async (stock: StockItem, tab: 'chart' | 'company' | 'financials' | 'news' | 'ai' | 'ask' = 'chart') => {
    // Ensure we have fresh live data
    const live = await getStockDetailAsync(stock.code);
    const fullStock = live || getStockDetail(stock.code) || stock;
    setSelectedStock(fullStock);
    setInitialDetailTab(tab);
    setActiveTab('stock-detail');

    try {
      window.history.pushState(null, '', `/stock/${fullStock.code}`);
    } catch {
      window.location.hash = `/stock/${fullStock.code}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    try {
      window.history.pushState(null, '', tab === 'home' ? '/' : `/${tab}`);
    } catch {
      window.location.hash = tab === 'home' ? '' : `/${tab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onNavigate={handleNavigate} activeTab={activeTab} />

      {/* Middle Body Area: Sidebar (Desktop) + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar for Desktop */}
        <Sidebar activeTab={activeTab} onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          {/* 1. Home Dashboard */}
          {activeTab === 'home' && (
            <DashboardView
              stocks={stocks}
              indices={indices}
              onSelectStock={(stock) => handleSelectStock(stock, 'chart')}
              onNavigate={handleNavigate}
            />
          )}

          {/* 2. Stock Search & List (All 50+ master stocks) */}
          {activeTab === 'search' && (
            <StockSearchView
              onSelectStock={(stock) => handleSelectStock(stock, 'chart')}
              onNavigateAi={(stock) => handleSelectStock(stock, 'ai')}
            />
          )}

          {/* 3. Stock Detail View (Dynamic for ANY stock: /stock/:symbol) */}
          {activeTab === 'stock-detail' && (
            <StockDetailView
              stock={selectedStock}
              onBack={() => handleNavigate('search')}
              initialTab={initialDetailTab}
            />
          )}

          {/* 4. Dedicated AI Analysis Hub */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <span>Gemini AI 종목 분석</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    한국거래소(KRX) 실거래가와 재무 데이터를 기반으로 Gemini AI 종합 보고서를 확인하세요.
                  </p>
                </div>

                {/* Stock selector dropdown with all master stocks */}
                <div className="flex items-center gap-2 bg-[#101827] border border-slate-700/80 rounded-xl px-3 py-2 self-start sm:self-center">
                  <span className="text-xs text-slate-400 font-medium">분석 종목:</span>
                  <select
                    value={selectedStock.code}
                    onChange={async (e) => {
                      const code = e.target.value;
                      const live = await getStockDetailAsync(code);
                      const target = live || getStockDetail(code);
                      if (target) setSelectedStock(target);
                    }}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[220px]"
                  >
                    <optgroup label="국내 주식 (KOSPI / KOSDAQ)">
                      {STOCK_MASTER_LIST.filter(s => s.country === 'KR').map(s => (
                        <option key={s.symbol} value={s.symbol} className="bg-[#101827] text-white">
                          {s.koreanName} ({s.symbol})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="미국 주식 (NASDAQ / NYSE)">
                      {STOCK_MASTER_LIST.filter(s => s.country === 'US').map(s => (
                        <option key={s.symbol} value={s.symbol} className="bg-[#101827] text-white">
                          {s.koreanName} ({s.symbol}) - {s.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Stock AI Analysis Component */}
              <AiStockAnalysisTab stock={selectedStock} />
            </div>
          )}

          {/* 5. Market Analysis View */}
          {activeTab === 'market' && (
            <MarketAnalysisView
              onSelectStock={(stock) => handleSelectStock(stock, 'chart')}
            />
          )}

          {/* 6. News Analysis View */}
          {activeTab === 'news' && (
            <NewsAnalysisView
              onSelectStockByCode={async (code) => {
                const live = await getStockDetailAsync(code);
                const s = live || getStockDetail(code);
                if (s) handleSelectStock(s, 'news');
              }}
            />
          )}

          {/* 7. Watchlist View */}
          {activeTab === 'watchlist' && (
            <WatchlistView
              onSelectStock={(stock) => handleSelectStock(stock, 'chart')}
              onNavigateAi={(stock) => handleSelectStock(stock, 'ai')}
              onNavigateSearch={() => handleNavigate('search')}
            />
          )}

          {/* 8. Stock Comparison View */}
          {activeTab === 'compare' && (
            <StockCompareView
              onSelectStock={(stock) => handleSelectStock(stock, 'chart')}
            />
          )}

          {/* 9. Settings & Glossary View */}
          {activeTab === 'settings' && <GlossaryView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <StockDataProvider>
      <WatchlistProvider>
        <AppContent />
      </WatchlistProvider>
    </StockDataProvider>
  );
}
