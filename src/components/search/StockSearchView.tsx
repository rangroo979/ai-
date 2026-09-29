import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StockItem, StockMaster } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';
import {
  fetchKrxSearch,
  KRXClientStock,
  searchStocks,
  getAutocompleteSuggestions,
  getStockDetail,
  getStockDetailAsync,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  getPopularStocks,
} from '../../services/stockService';
import { STOCK_MASTER_LIST } from '../../data/stocksMaster';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Sparkles,
  X,
  Clock,
  Flame,
  ArrowRight,
  Database,
  Building,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface StockSearchViewProps {
  onSelectStock: (stock: StockItem) => void;
  onNavigateAi?: (stock: StockItem) => void;
}

export const StockSearchView: React.FC<StockSearchViewProps> = ({
  onSelectStock,
  onNavigateAi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'domestic' | 'global' | 'watchlist'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [krxResults, setKrxResults] = useState<KRXClientStock[]>([]);
  const [krxBaseDate, setKrxBaseDate] = useState<string>('2026.09.28 거래일 기준');
  const [isKrxLive, setIsKrxLive] = useState(false);
  const [isSearchingKrx, setIsSearchingKrx] = useState(false);

  const { isWatchlisted, toggleWatchlist, watchlistCodes } = useWatchlist();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch KRX data whenever search term or filter changes
  useEffect(() => {
    let cancelled = false;

    const performSearch = async () => {
      // If user is only searching global stocks, skip KRX query
      if (selectedFilter === 'global') {
        setKrxResults([]);
        return;
      }

      setIsSearchingKrx(true);
      try {
        const res = await fetchKrxSearch(searchTerm, 20);
        if (!cancelled) {
          setKrxResults(res.stocks);
          setKrxBaseDate(res.baseDateFormatted);
          setIsKrxLive(res.isLive);
        }
      } catch (err) {
        console.error('KRX search error:', err);
      } finally {
        if (!cancelled) {
          setIsSearchingKrx(false);
        }
      }
    };

    const timer = setTimeout(() => {
      performSearch();
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedFilter]);

  // Handle clicking outside to dismiss autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time autocomplete candidates (up to 8)
  const autocompleteList = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return getAutocompleteSuggestions(searchTerm, 8);
  }, [searchTerm]);

  // Global (US) stocks filtered
  const usSearchResults = useMemo(() => {
    if (selectedFilter === 'domestic') return [];
    return searchStocks(searchTerm, 'global', watchlistCodes);
  }, [searchTerm, selectedFilter, watchlistCodes]);

  const popularStocks = useMemo(() => getPopularStocks(), []);

  // When a stock is chosen
  const handleStockClick = async (symbol: string, keywordToSave?: string) => {
    if (keywordToSave) {
      const updated = addRecentSearch(keywordToSave);
      setRecentSearches(updated);
    }

    // Try live async load first, fallback to sync
    const liveStock = await getStockDetailAsync(symbol);
    if (liveStock) {
      onSelectStock(liveStock);
    } else {
      const fallback = getStockDetail(symbol);
      if (fallback) onSelectStock(fallback);
    }
  };

  const handleSelectRecent = (keyword: string) => {
    setSearchTerm(keyword);
    setShowAutocomplete(false);
    const updated = addRecentSearch(keyword);
    setRecentSearches(updated);
  };

  const handleRemoveRecent = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(keyword);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Header Title */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Search className="w-6 h-6 text-blue-400" />
            <span>종목 검색 (KRX OPEN API 연동)</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#101827] px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-300">{krxBaseDate}</span>
            {isKrxLive ? (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                KRX 공식 실거래가
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                DEMO 데이터
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          한국거래소(KRX) 유가증권(KOSPI) 및 코스닥(KOSDAQ) 일별 매매정보와 미국 주식을 종목명, 종목코드로 검색합니다.
        </p>
      </div>

      {/* Main Search Input & Auto-complete Box */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 relative">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => {
              if (searchTerm.trim()) setShowAutocomplete(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (autocompleteList.length > 0) {
                  handleStockClick(autocompleteList[0].symbol, autocompleteList[0].koreanName);
                  setShowAutocomplete(false);
                } else if (krxResults.length > 0) {
                  handleStockClick(krxResults[0].code, krxResults[0].name);
                  setShowAutocomplete(false);
                }
              }
            }}
            placeholder="종목명, 종목코드 또는 티커 검색 (예: 삼성전자, 005930, SK하이닉스, 알테오젠, NVDA, Apple)"
            className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setShowAutocomplete(false);
                searchInputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Real-time Autocomplete Dropdown */}
          {showAutocomplete && autocompleteList.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-[#0e1626] border border-slate-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800/80 animate-in fade-in duration-100">
              <div className="px-3.5 py-1.5 bg-[#090e1a] text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                <span>실시간 자동완성 추천 ({autocompleteList.length})</span>
                <span className="text-slate-500">클릭 또는 Enter 키로 즉시 이동</span>
              </div>
              {autocompleteList.map(item => {
                const isUp = (item.changeRate ?? 0) >= 0;

                return (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      setShowAutocomplete(false);
                      handleStockClick(item.symbol, item.koreanName);
                    }}
                    className="p-3 hover:bg-slate-800/80 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.koreanName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">
                            {item.koreanName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.name !== item.koreanName && `(${item.name})`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.symbol} · {item.market} · {item.sector}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white block">
                          {item.country === 'KR'
                            ? `${(item.basePrice || 50000).toLocaleString()}원`
                            : `$${(item.basePrice || 150).toLocaleString()}`}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            isUp ? 'text-red-500' : 'text-blue-500'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {(item.changeRate ?? 0).toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
                        {item.market}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>최근 검색:</span>
            </div>
            {recentSearches.map(kw => (
              <div
                key={kw}
                onClick={() => handleSelectRecent(kw)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0b0f19] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer group"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveRecent(e, kw)}
                  className="text-slate-500 hover:text-red-400 ml-0.5"
                  title="삭제"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleClearAllRecent}
              className="text-[11px] text-slate-500 hover:text-slate-300 ml-1 underline transition-colors"
            >
              전체삭제
            </button>
          </div>
        )}

        {/* Popular Stocks Section */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>인기 검색 종목:</span>
          </div>
          {popularStocks.map(stock => (
            <button
              key={stock.symbol}
              type="button"
              onClick={() => handleSelectRecent(stock.koreanName)}
              className="px-2.5 py-1 rounded-lg bg-[#0b0f19] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{stock.koreanName}</span>
              <span className="text-[10px] text-slate-500 font-mono">({stock.symbol})</span>
            </button>
          ))}
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            전체 통합 검색
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('domestic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'domestic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            국내 주식 (KRX: KOSPI/KOSDAQ)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('global')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'global'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            미국 주식 (NASDAQ/NYSE)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('watchlist')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'watchlist'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>관심종목 ({watchlistCodes.length})</span>
          </button>
        </div>
      </div>

      {/* Search Results Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>
              {searchTerm ? `"${searchTerm}" 검색 결과` : '주요 종목 목록'}
            </span>
            {isSearchingKrx && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
          </div>
          <span className="text-[11px] text-slate-500">
            {krxBaseDate}
          </span>
        </div>

        {/* Domestic KRX Results */}
        {selectedFilter !== 'global' && krxResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between px-1">
              <span>국내 주식 (KOSPI & KOSDAQ) - {krxResults.length}건</span>
              <span className="text-[11px] text-slate-500">클릭 시 /stock/:code 로 이동</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {krxResults.map(stock => {
                const isFav = isWatchlisted(stock.code);
                const isUp = stock.changeRate >= 0;

                return (
                  <div
                    key={stock.code}
                    onClick={() => handleStockClick(stock.code, stock.name)}
                    className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-md group flex flex-col justify-between gap-3.5"
                  >
                    {/* Top: Name, Code, Market, Star */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                          {stock.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                              {stock.name}
                            </h3>
                            <span className="text-xs font-mono text-slate-400 font-semibold">
                              {stock.code}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                              {stock.market}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{stock.dateFormatted || krxBaseDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Star Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.code);
                        }}
                        aria-label="관심종목 토글"
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isFav
                            ? 'text-amber-400 hover:bg-amber-400/10'
                            : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom: Price, Change Rate, Market Cap */}
                    <div className="flex items-end justify-between gap-3 pt-3 border-t border-slate-800/60">
                      <div>
                        <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5">
                          <span>{stock.close.toLocaleString()}원</span>
                          {stock.isLive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              KRX
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold font-mono ${
                            isUp ? 'text-red-500' : 'text-blue-500'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>
                            {isUp ? '+' : ''}
                            {stock.change.toLocaleString()}원 ({isUp ? '+' : ''}
                            {stock.changeRate.toFixed(2)}%)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">시가총액</span>
                        <span className="text-xs font-semibold text-slate-300 font-mono">
                          {stock.marketCapFormatted || `${Math.round(stock.marketCap / 100000000).toLocaleString()}억`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global (US) Stocks Results */}
        {selectedFilter !== 'domestic' && usSearchResults.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between px-1">
              <span>미국 주식 (NASDAQ & NYSE) - {usSearchResults.length}건</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {usSearchResults.map(stock => {
                const isFav = isWatchlisted(stock.symbol);
                const isUp = (stock.changeRate ?? 0) >= 0;

                return (
                  <div
                    key={stock.symbol}
                    onClick={() => handleStockClick(stock.symbol, stock.koreanName)}
                    className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-md group flex flex-col justify-between gap-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                          {stock.koreanName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                              {stock.koreanName}
                            </h3>
                            <span className="text-xs font-mono text-slate-400 font-semibold">
                              {stock.symbol}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                              {stock.market}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{stock.name}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.symbol);
                        }}
                        aria-label="관심종목 토글"
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isFav
                            ? 'text-amber-400 hover:bg-amber-400/10'
                            : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-3 pt-3 border-t border-slate-800/60">
                      <div>
                        <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5">
                          <span>${(stock.basePrice || 150).toLocaleString()}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
                            DEMO
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold font-mono ${
                            isUp ? 'text-red-500' : 'text-blue-500'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>
                            {isUp ? '+' : ''}
                            {(stock.changeRate ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">섹터</span>
                        <span className="text-xs font-semibold text-slate-300 truncate max-w-[140px] block">
                          {stock.sector}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty Result State */}
        {krxResults.length === 0 && usSearchResults.length === 0 && !isSearchingKrx && (
          <div className="bg-[#101827] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-200">
                일치하는 검색 결과가 없습니다.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                종목명(예: 삼성전자, 알테오젠) 또는 6자리 종목코드(예: 005930, 000660)로 다시 검색해 보세요.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {['삼성전자', 'SK하이닉스', '현대차', '알테오젠', '한화에어로스페이스', 'NVIDIA', 'Apple'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSearchTerm(s)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
