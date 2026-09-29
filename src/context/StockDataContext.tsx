import React, { createContext, useContext, useState, useEffect } from 'react';
import { StockItem, MarketIndex } from '../types';
import { MOCK_STOCKS } from '../data/mockStocks';
import { MOCK_INDICES } from '../data/mockMarket';
import {
  fetchKrxStatus,
  fetchSpotlightStocks,
  fetchMarketMovers,
  getStockDetail,
  getStockDetailAsync,
} from '../services/stockService';

interface StockDataContextType {
  isKrxConfigured: boolean;
  isKrxLive: boolean;
  baseDateFormatted: string;
  stocks: StockItem[];
  indices: MarketIndex[];
  marketMovers: {
    topGainers: StockItem[];
    topLosers: StockItem[];
    topVolume: StockItem[];
  };
  isLoading: boolean;
  refreshKrxData: () => Promise<void>;
  getStock: (code: string) => Promise<StockItem | null>;
}

const StockDataContext = createContext<StockDataContextType>({
  isKrxConfigured: false,
  isKrxLive: false,
  baseDateFormatted: '거래일 기준',
  stocks: MOCK_STOCKS,
  indices: MOCK_INDICES,
  marketMovers: {
    topGainers: [],
    topLosers: [],
    topVolume: [],
  },
  isLoading: false,
  refreshKrxData: async () => {},
  getStock: async () => null,
});

export const StockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKrxConfigured, setIsKrxConfigured] = useState(false);
  const [isKrxLive, setIsKrxLive] = useState(false);
  const [baseDateFormatted, setBaseDateFormatted] = useState('거래일 기준');
  const [stocks, setStocks] = useState<StockItem[]>(MOCK_STOCKS);
  const [indices] = useState<MarketIndex[]>(MOCK_INDICES);
  const [marketMovers, setMarketMovers] = useState<{
    topGainers: StockItem[];
    topLosers: StockItem[];
    topVolume: StockItem[];
  }>({
    topGainers: [],
    topLosers: [],
    topVolume: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch KRX status
      const status = await fetchKrxStatus();
      if (status) {
        setIsKrxConfigured(status.isConfigured);
        setIsKrxLive(status.isLive);
        if (status.baseDateFormatted) {
          setBaseDateFormatted(status.baseDateFormatted);
        }
      }

      // 2. Fetch Spotlight Stocks with real KRX prices
      const spotlight = await fetchSpotlightStocks();
      if (spotlight.stocks.length > 0) {
        setStocks(spotlight.stocks);
        setIsKrxLive(spotlight.isLive);
        if (spotlight.baseDateFormatted) {
          setBaseDateFormatted(spotlight.baseDateFormatted);
        }
      }

      // 3. Fetch Real KRX Market Movers
      const movers = await fetchMarketMovers();
      setMarketMovers({
        topGainers: movers.topGainers,
        topLosers: movers.topLosers,
        topVolume: movers.topVolume,
      });
    } catch (err) {
      console.error('Error loading stock data in StockDataProvider:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStock = async (code: string): Promise<StockItem | null> => {
    return await getStockDetailAsync(code) || getStockDetail(code);
  };

  return (
    <StockDataContext.Provider
      value={{
        isKrxConfigured,
        isKrxLive,
        baseDateFormatted,
        stocks,
        indices,
        marketMovers,
        isLoading,
        refreshKrxData: loadData,
        getStock,
      }}
    >
      {children}
    </StockDataContext.Provider>
  );
};

export function useStockData() {
  return useContext(StockDataContext);
}
