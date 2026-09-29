import React from 'react';
import { StockItem } from '../../types';
import { getStockDetail } from '../../services/stockService';
import { useWatchlist } from '../../context/WatchlistContext';
import { MiniSparkline } from '../charts/MiniSparkline';
import {
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';

interface WatchlistViewProps {
  onSelectStock: (stock: StockItem) => void;
  onNavigateAi: (stock: StockItem) => void;
  onNavigateSearch: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  onSelectStock,
  onNavigateAi,
  onNavigateSearch,
}) => {
  const { watchlistCodes, removeFromWatchlist } = useWatchlist();

  const watchlistStocks = watchlistCodes
    .map(code => getStockDetail(code))
    .filter(Boolean) as StockItem[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>내 관심종목</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            자주 확인하는 관심 기업들을 모아서 보고 원클릭으로 Gemini AI 분석을 실행합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateSearch}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-center"
        >
          <Search className="w-3.5 h-3.5" />
          <span>새로운 종목 추가하기</span>
        </button>
      </div>

      {/* Stock Cards Grid or Empty State */}
      {watchlistStocks.length === 0 ? (
        <div className="bg-[#101827] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Star className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">
              저장된 관심종목이 없습니다.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              종목 검색이나 메인 대시보드에서 <strong>★ 별표 아이콘</strong>을 누르면 언제든지 관심종목으로 등록할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateSearch}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            종목 둘러보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchlistStocks.map(stock => {
            const isUp = stock.changeRate >= 0;
            const sparklineData = (stock.chartData['1M'] || []).map(p => p.close);

            return (
              <div
                key={stock.id}
                onClick={() => onSelectStock(stock)}
                className="bg-[#101827] hover:bg-[#131e33] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md cursor-pointer group flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0">
                      {stock.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                          {stock.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-500">
                          {stock.code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {stock.market} · {stock.companyInfo.sector}
                      </span>
                    </div>
                  </div>

                  {/* Remove from watchlist */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(stock.code);
                    }}
                    title="관심종목에서 삭제"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price, Sparkline, and AI Quick Button */}
                <div className="flex items-end justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <div className="text-lg font-bold font-mono text-white">
                      {stock.currentPrice.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        {stock.currency}
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

                  <div className="flex items-center gap-3">
                    <MiniSparkline
                      data={sparklineData}
                      isPositive={isUp}
                      width={80}
                      height={28}
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateAi(stock);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI 분석</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
