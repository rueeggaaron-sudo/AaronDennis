import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
}

export interface MarketChartPoint {
  date: number;
  price: number;
}

const priceCache: Record<string, MarketChartPoint[]> = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry<T>(url: string, params: any, retries = 3, backoff = 1000): Promise<T> {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error: any) {
    if (retries > 0 && error.response?.status === 429) {
      console.warn(`Rate limit reached. Retrying in ${backoff}ms...`);
      await delay(backoff);
      return fetchWithRetry(url, params, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export const getTop20Coins = async (): Promise<Coin[]> => {
  return fetchWithRetry<Coin[]>(`${BASE_URL}/coins/markets`, {
    vs_currency: 'eur',
    order: 'market_cap_desc',
    per_page: 20,
    page: 1,
    sparkline: false,
  });
};

export const getMarketChart = async (coinId: string, days: number | 'max'): Promise<MarketChartPoint[]> => {
  const cacheKey = `${coinId}-${days}`;
  if (priceCache[cacheKey]) {
    return priceCache[cacheKey];
  }

  const data = await fetchWithRetry<any>(`${BASE_URL}/coins/${coinId}/market_chart`, {
    vs_currency: 'eur',
    days: days,
    interval: 'daily',
  });

  const prices: MarketChartPoint[] = data.prices.map((price: [number, number]) => ({
    date: price[0],
    price: price[1],
  }));

  priceCache[cacheKey] = prices;
  return prices;
};
