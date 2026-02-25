import { addDays, addMonths, isBefore, isAfter, startOfDay, getDate, lastDayOfMonth, setDate } from 'date-fns';
import type { MarketChartPoint } from '../services/coingecko';

export interface Sparplan {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  amount: number;
  interval: 'weekly' | 'monthly';
  startDate: string; // ISO string
}

export interface Transaction {
  date: string;
  amountEur: number;
  amountCoin: number;
  price: number;
}

export interface DCAStats {
  totalInvested: number;
  totalCoinAmount: number;
  currentValue: number;
  roiAbsolute: number;
  roiPercentage: number;
  transactions: Transaction[];
  history: { date: string; value: number; invested: number }[];
}

export const calculateDCA = (
  plan: Sparplan,
  prices: MarketChartPoint[],
  currentPrice: number
): DCAStats => {
  const transactions: Transaction[] = [];
  let totalInvested = 0;
  let totalCoinAmount = 0;

  const start = startOfDay(new Date(plan.startDate));
  const today = startOfDay(new Date());

  let nextPurchase = start;

  while (!isAfter(nextPurchase, today)) {
    const purchaseTime = nextPurchase.getTime();
    const pricePoint = prices.find(p => {
      const pDate = startOfDay(new Date(p.date));
      return pDate.getTime() === startOfDay(nextPurchase).getTime();
    }) || prices.find(p => p.date >= purchaseTime);

    if (pricePoint) {
      const amountCoin = plan.amount / pricePoint.price;
      transactions.push({
        date: nextPurchase.toISOString(),
        amountEur: plan.amount,
        amountCoin,
        price: pricePoint.price,
      });
      totalInvested += plan.amount;
      totalCoinAmount += amountCoin;
    }

    if (plan.interval === 'weekly') {
      nextPurchase = addDays(nextPurchase, 7);
    } else {
      const currentDayOfMonth = getDate(start);
      const nextMonth = addMonths(nextPurchase, 1);
      const lastDay = lastDayOfMonth(nextMonth);
      const targetDay = Math.min(currentDayOfMonth, getDate(lastDay));
      nextPurchase = setDate(nextMonth, targetDay);
    }
  }

  const currentValue = totalCoinAmount * currentPrice;
  const roiAbsolute = currentValue - totalInvested;
  const roiPercentage = totalInvested > 0 ? (roiAbsolute / totalInvested) * 100 : 0;

  const history: { date: string; value: number; invested: number }[] = [];
  let runningInvested = 0;
  let runningCoinAmount = 0;
  let txIndex = 0;

  let currentDay = start;
  while (!isAfter(currentDay, today)) {
    while (txIndex < transactions.length && isBefore(startOfDay(new Date(transactions[txIndex].date)), addDays(currentDay, 1))) {
      runningInvested += transactions[txIndex].amountEur;
      runningCoinAmount += transactions[txIndex].amountCoin;
      txIndex++;
    }

    const dailyPrice = prices.find(p => startOfDay(new Date(p.date)).getTime() === startOfDay(currentDay).getTime())?.price || (txIndex > 0 ? transactions[txIndex-1].price : 0);

    history.push({
      date: currentDay.toISOString(),
      value: runningCoinAmount * dailyPrice,
      invested: runningInvested,
    });

    currentDay = addDays(currentDay, 1);
  }

  return {
    totalInvested,
    totalCoinAmount,
    currentValue,
    roiAbsolute,
    roiPercentage,
    transactions,
    history,
  };
};
