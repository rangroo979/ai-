import React from 'react';
import { MarketIndex } from '../../types';
import { MiniSparkline } from '../charts/MiniSparkline';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useStockData } from '../../context/StockDataContext';

interface MarketOverviewProps {
  indices: MarketIndex[];
  onSelectIndex?: (indexId: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ indices, onSelectIndex }) => {
  const { isKrxLive } = useStockData();

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="text-sm font-bold text-slate-300">
          오늘의 시장 현황
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          국내: KRX 최근 거래일 데이터 / 해외: Demo 데이터
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {indices.map(idx => {
          const isUp = idx.changeRate >= 0;
          const chartPoints = idx.history.map(h => h.value);

          return (
            <div
              key={idx.id}
              onClick={() => onSelectIndex && onSelectIndex(idx.id)}
              className="bg-[#101827] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-md flex flex-col justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {idx.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      DEMO
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {idx.code}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    isUp ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>
                    {isUp ? '+' : ''}
                    {idx.changeRate.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 pt-1">
                <div>
                  <div className="text-lg font-extrabold font-mono text-white tracking-tight">
                    {idx.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[11px] font-mono ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(idx.changeAmount).toFixed(2)}
                  </div>
                </div>

                <MiniSparkline
                  data={chartPoints}
                  isPositive={isUp}
                  width={68}
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
