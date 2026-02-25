import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Coin, getTop20Coins, getMarketChart, type MarketChartPoint } from '../services/coingecko';
import { getLatestBlock, type BlockData } from '../services/mempool';
import type { Sparplan } from '../utils/dcaEngine';

interface AppContextType {
  plans: Sparplan[];
  addPlan: (plan: Sparplan) => void;
  updatePlan: (plan: Sparplan) => void;
  deletePlan: (id: string) => void;
  coins: Coin[];
  priceCache: Record<string, MarketChartPoint[]>;
  fetchPricesForCoin: (coinId: string, startDate: string) => Promise<void>;
  blockData: BlockData | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<Sparplan[]>(() => {
    const saved = localStorage.getItem('dca_plans');
    return saved ? JSON.parse(saved) : [];
  });
  const [coins, setCoins] = useState<Coin[]>([]);
  const [priceCache, setPriceCache] = useState<Record<string, MarketChartPoint[]>>({});
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('dca_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const topCoins = await getTop20Coins();
      setCoins(topCoins);

      const latestBlock = await getLatestBlock();
      setBlockData(latestBlock);

      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Initialdaten. Bitte später erneut versuchen.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    const interval = setInterval(async () => {
      try {
        const latestBlock = await getLatestBlock();
        setBlockData(latestBlock);
      } catch (err) {
        console.error('Failed to fetch block data', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchInitialData]);

  const fetchPricesForCoin = async (coinId: string, startDate: string) => {
    if (priceCache[coinId]) return;

    try {
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const prices = await getMarketChart(coinId, diffDays);
      setPriceCache(prev => ({ ...prev, [coinId]: prices }));
    } catch (err) {
      console.error(`Failed to fetch prices for ${coinId}`, err);
      throw err;
    }
  };

  const addPlan = (plan: Sparplan) => setPlans(prev => [...prev, plan]);
  const updatePlan = (plan: Sparplan) => setPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
  const deletePlan = (id: string) => setPlans(prev => prev.filter(p => p.id !== id));

  return (
    <AppContext.Provider value={{
      plans, addPlan, updatePlan, deletePlan,
      coins, priceCache, fetchPricesForCoin,
      blockData, theme, toggleTheme, loading, error
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
