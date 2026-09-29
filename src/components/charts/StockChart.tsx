import React, { useState, useMemo, useRef } from 'react';
import { StockItem, TimeRange, PricePoint } from '../../types';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';
import { TermTooltip } from '../common/TermTooltip';

interface StockChartProps {
  stock: StockItem;
  className?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ stock, className = '' }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [showMA, setShowMA] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const rawData: PricePoint[] = useMemo(() => {
    return stock.chartData[selectedRange] || [];
  }, [stock, selectedRange]);

  // Calculate Moving Averages (MA5, MA20)
  const chartDataWithMA = useMemo(() => {
    return rawData.map((point, index, array) => {
      let ma5: number | null = null;
      let ma20: number | null = null;

      if (index >= 4) {
        const slice5 = array.slice(index - 4, index + 1);
        ma5 = slice5.reduce((sum, p) => sum + p.close, 0) / 5;
      }
      if (index >= 19) {
        const slice20 = array.slice(index - 19, index + 1);
        ma20 = slice20.reduce((sum, p) => sum + p.close, 0) / 20;
      }
      return {
        ...point,
        ma5,
        ma20,
      };
    });
  }, [rawData]);

  // Min and Max for price
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (rawData.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    let min = Infinity;
    let max = -Infinity;
    let volMax = 0;

    rawData.forEach(p => {
      if (p.low < min) min = p.low;
      if (p.high > max) max = p.high;
      if (p.volume > volMax) volMax = p.volume;
    });

    const padding = (max - min) * 0.05 || 10;
    return {
      minPrice: Math.floor(min - padding),
      maxPrice: Math.ceil(max + padding),
      maxVolume: volMax,
    };
  }, [rawData]);

  const activePoint = hoverIndex !== null && chartDataWithMA[hoverIndex]
    ? chartDataWithMA[hoverIndex]
    : chartDataWithMA[chartDataWithMA.length - 1];

  // SVG dimensions
  const svgWidth = 720;
  const priceSvgHeight = 260;
  const volumeSvgHeight = 70;
  const priceRange = maxPrice - minPrice || 1;

  const getPriceY = (price: number) => {
    return priceSvgHeight - ((price - minPrice) / priceRange) * (priceSvgHeight - 20) - 10;
  };

  const getVolumeY = (vol: number) => {
    return volumeSvgHeight - (vol / (maxVolume || 1)) * (volumeSvgHeight - 10);
  };

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '1일', value: '1D' },
    { label: '1주', value: '1W' },
    { label: '1개월', value: '1M' },
    { label: '3개월', value: '3M' },
    { label: '1년', value: '1Y' },
    { label: '5년', value: '5Y' },
  ];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(ratio * (chartDataWithMA.length - 1));
    if (index >= 0 && index < chartDataWithMA.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Line path
  const linePoints = chartDataWithMA.map((p, i) => {
    const x = (i / Math.max(1, chartDataWithMA.length - 1)) * svgWidth;
    const y = getPriceY(p.close);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePathD = `M ${linePoints.join(' L ')}`;
  const areaPathD = `${linePathD} L ${svgWidth},${priceSvgHeight} L 0,${priceSvgHeight} Z`;

  // MA5 and MA20 paths
  const ma5Points = chartDataWithMA
    .map((p, i) => {
      if (p.ma5 === null) return null;
      const x = (i / Math.max(1, chartDataWithMA.length - 1)) * svgWidth;
      const y = getPriceY(p.ma5);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean);
  const ma5PathD = ma5Points.length > 1 ? `M ${ma5Points.join(' L ')}` : '';

  const ma20Points = chartDataWithMA
    .map((p, i) => {
      if (p.ma20 === null) return null;
      const x = (i / Math.max(1, chartDataWithMA.length - 1)) * svgWidth;
      const y = getPriceY(p.ma20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean);
  const ma20PathD = ma20Points.length > 1 ? `M ${ma20Points.join(' L ')}` : '';

  // Is latest or hovered point up?
  const isUp = activePoint ? activePoint.close >= activePoint.open : stock.changeRate >= 0;

  return (
    <div className={`bg-[#101827] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl ${className}`} ref={containerRef}>
      {/* Top Controls: Timeframe & Chart Type Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800">
          {timeRanges.map(tr => (
            <button
              key={tr.value}
              type="button"
              onClick={() => setSelectedRange(tr.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedRange === tr.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {/* View Options: Candle vs Line & MA Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setChartType('candle')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                chartType === 'candle'
                  ? 'bg-slate-800 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>캔들</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                chartType === 'line'
                  ? 'bg-slate-800 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>라인</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMA(!showMA)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              showMA
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-[#0b0f19] border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>이동평균선</span>
          </button>
        </div>
      </div>

      {/* Dynamic Cursor / Current Hover Stats */}
      {activePoint && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-[#0b0f19]/70 p-3 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">날짜/시간</span>
            <span className="text-slate-200 font-medium">
              {activePoint.time ? `${activePoint.date} ${activePoint.time}` : activePoint.date}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">시가</span>
            <span className="text-slate-300 font-mono">
              {activePoint.open.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">고가</span>
            <span className="text-red-400 font-mono">
              {activePoint.high.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">저가</span>
            <span className="text-blue-400 font-mono">
              {activePoint.low.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">종가</span>
            <span className={`font-mono font-bold ${activePoint.close >= activePoint.open ? 'text-red-500' : 'text-blue-500'}`}>
              {activePoint.close.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">거래량</span>
            <span className="text-slate-300 font-mono">
              {activePoint.volume.toLocaleString()}주
            </span>
          </div>
        </div>
      )}

      {/* Main Price Chart Area */}
      <div className="relative w-full">
        {/* Price Indicators (Grid lines & Y-axis labels) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-600 font-mono pr-2">
          <div className="border-b border-slate-800/60 pb-0.5 text-right">{maxPrice.toLocaleString()}</div>
          <div className="border-b border-slate-800/40 pb-0.5 text-right">{Math.round((maxPrice + minPrice) / 2).toLocaleString()}</div>
          <div className="border-b border-slate-800/60 pb-0.5 text-right">{minPrice.toLocaleString()}</div>
        </div>

        {/* Price SVG */}
        <svg
          viewBox={`0 0 ${svgWidth} ${priceSvgHeight}`}
          className="w-full h-[240px] sm:h-[280px] overflow-visible cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {chartType === 'line' ? (
            <>
              <path
                d={areaPathD}
                fill={stock.changeRate >= 0 ? 'url(#chartLineGrad)' : 'url(#chartLineGradBlue)'}
              />
              <path
                d={linePathD}
                fill="none"
                stroke={stock.changeRate >= 0 ? '#ef4444' : '#3b82f6'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            // Candlestick rendering
            chartDataWithMA.map((p, idx) => {
              const x = (idx / Math.max(1, chartDataWithMA.length - 1)) * svgWidth;
              const barWidth = Math.max(3, Math.min(14, (svgWidth / chartDataWithMA.length) * 0.7));
              const isCandleUp = p.close >= p.open;
              const color = isCandleUp ? '#ef4444' : '#3b82f6';
              const yHigh = getPriceY(p.high);
              const yLow = getPriceY(p.low);
              const yOpen = getPriceY(p.open);
              const yClose = getPriceY(p.close);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={idx}>
                  {/* High - Low wick line */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle body rectangle */}
                  <rect
                    x={x - barWidth / 2}
                    y={bodyTop}
                    width={barWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          )}

          {/* Moving Average Lines */}
          {showMA && ma5PathD && (
            <path
              d={ma5PathD}
              fill="none"
              stroke="#fbbf24" // Amber 5-day MA
              strokeWidth="1.2"
              strokeOpacity="0.85"
            />
          )}
          {showMA && ma20PathD && (
            <path
              d={ma20PathD}
              fill="none"
              stroke="#a855f7" // Purple 20-day MA
              strokeWidth="1.2"
              strokeOpacity="0.85"
            />
          )}

          {/* Crosshair indicator when hovering */}
          {hoverIndex !== null && (
            <line
              x1={(hoverIndex / Math.max(1, chartDataWithMA.length - 1)) * svgWidth}
              y1={0}
              x2={(hoverIndex / Math.max(1, chartDataWithMA.length - 1)) * svgWidth}
              y2={priceSvgHeight}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />
          )}
        </svg>

        {/* Legend for MA */}
        {showMA && (
          <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1 pl-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />
              <span>MA 5</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-purple-400 inline-block rounded" />
              <span>MA 20</span>
            </span>
          </div>
        )}
      </div>

      {/* Volume Sub-Chart */}
      <div className="border-t border-slate-800/80 pt-2">
        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">
            거래량 (Volume)
          </span>
          <span className="font-mono text-slate-500">
            최대 {maxVolume.toLocaleString()}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${svgWidth} ${volumeSvgHeight}`}
          className="w-full h-[55px] overflow-visible"
          preserveAspectRatio="none"
        >
          {chartDataWithMA.map((p, idx) => {
            const x = (idx / Math.max(1, chartDataWithMA.length - 1)) * svgWidth;
            const barWidth = Math.max(2, Math.min(10, (svgWidth / chartDataWithMA.length) * 0.65));
            const y = getVolumeY(p.volume);
            const barHeight = volumeSvgHeight - y;
            const isCandleUp = p.close >= p.open;
            return (
              <rect
                key={idx}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={isCandleUp ? '#ef4444' : '#3b82f6'}
                opacity={hoverIndex === idx ? 1 : 0.45}
                rx="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Key Stock Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <span className="text-slate-500 block mb-1">시가</span>
          <span className="font-mono font-medium text-slate-200">
            {stock.openPrice.toLocaleString()} {stock.currency}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <span className="text-slate-500 block mb-1">고가</span>
          <span className="font-mono font-medium text-red-400">
            {stock.highPrice.toLocaleString()} {stock.currency}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <span className="text-slate-500 block mb-1">저가</span>
          <span className="font-mono font-medium text-blue-400">
            {stock.lowPrice.toLocaleString()} {stock.currency}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <TermTooltip termKey="거래량" label="거래량" className="text-slate-500 block mb-1" />
          <span className="font-mono font-medium text-slate-200">
            {stock.volume.toLocaleString()}주
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <span className="text-slate-500 block mb-1">거래대금</span>
          <span className="font-mono font-medium text-slate-200 truncate block">
            {stock.currency === 'KRW'
              ? `${(stock.tradingValue / 100000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}억 원`
              : `$${(stock.tradingValue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <TermTooltip termKey="시가총액" label="시가총액" className="text-slate-500 block mb-1" />
          <span className="font-mono font-medium text-slate-200 truncate block">
            {stock.companyInfo.marketCapFormatted}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800/60">
          <span className="text-slate-500 block mb-1">52주 최고/최저</span>
          <span className="font-mono font-medium text-slate-200 text-[11px] block truncate">
            {stock.companyInfo.week52High.toLocaleString()} / {stock.companyInfo.week52Low.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
