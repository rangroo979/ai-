import React from 'react';
import { StockItem } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';
import { MiniSparkline } from '../charts/MiniSparkline';
import { Star, TrendingUp, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';

interface TopStocksListProps {
  stocks: StockItem[];
  onSelectStock: (stock: StockItem) => void;
  onNavigateSearch: () => void;
}

export const TopStocksList: React.FC<TopStocksListProps> = ({
  stocks,
  onSelectStock,
  onNavigateSearch,
}) => {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();

  // Top spotlight stocks requested by user brief: 삼성전자, NAVER, 카카오, SK하이닉스, 현대차, Apple, NVIDIA, Tesla
  const targetCodes = ['005930', '035420', '035720', '000660', '005380', 'AAPL', 'NVDA', 'TSLA'];
  const spotlightStocks = targetCodes
    .map(c => stocks.find(s => s.code === c))
    .filter(Boolean) as StockItem[];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>주요 관심종목 시세</span>
          </h3>
          <span className="text-xs text-slate-400">
            한국거래소(KRX) 공식 데이터 및 글로벌 대표 종목 현황
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateSearch}
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          <span>전체 종목 보기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {spotlightStocks.map(stock => {
          const isFav = isWatchlisted(stock.code);
          const isUp = stock.changeRate >= 0;
          const sparklineData = (stock.chartData['1M'] || []).map(p => p.close);

          return (
            <div
              key={stock.id}
              onClick={() => onSelectStock(stock)}
              className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-md group flex flex-col justify-between gap-3"
            >
              {/* Top: Name, Code, and Star */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                    {stock.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {stock.name}
                      </h4>
                      {stock.isLiveKrx && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          KRX
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {stock.code} · {stock.market}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(stock.code);
                  }}
                  aria-label="관심종목 토글"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isFav
                      ? 'text-amber-400 hover:bg-amber-400/10'
                      : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              {/* Bottom: Price, Change, and Mini Sparkline */}
              <div className="flex items-end justify-between gap-2 pt-2 border-t border-slate-800/60">
                <div>
                  <div className="text-base sm:text-lg font-bold font-mono text-white">
                    {stock.currentPrice.toLocaleString()}{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      {stock.currency === 'KRW' ? '원' : stock.currency}
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
                      {stock.changeRate.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <MiniSparkline
                  data={sparklineData.length > 0 ? sparklineData : [stock.openPrice, stock.currentPrice]}
                  isPositive={isUp}
                  width={70}
                  height={26}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
