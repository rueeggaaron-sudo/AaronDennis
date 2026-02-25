import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDCA, type DCAStats } from '../utils/dcaEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';

export const Dashboard: React.FC = () => {
  const { plans, coins, priceCache, fetchPricesForCoin, loading } = useApp();
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const loadAllPrices = async () => {
      if (plans.length === 0) return;
      setIsDataLoading(true);
      try {
        await Promise.all(plans.map(p => fetchPricesForCoin(p.coinId, p.startDate)));
      } finally {
        setIsDataLoading(false);
      }
    };
    loadAllPrices();
  }, [plans, fetchPricesForCoin]);

  const portfolioStats = useMemo(() => {
    const allStats = plans.map(plan => {
      const prices = priceCache[plan.coinId];
      const coin = coins.find(c => c.id === plan.coinId);
      if (!prices || !coin) return null;
      return { stats: calculateDCA(plan, prices, coin.current_price), plan };
    }).filter(s => s !== null) as { stats: DCAStats, plan: any }[];

    if (allStats.length === 0) return null;

    const totalInvested = allStats.reduce((acc, s) => acc + s.stats.totalInvested, 0);
    const currentValue = allStats.reduce((acc, s) => acc + s.stats.currentValue, 0);
    const roiAbsolute = currentValue - totalInvested;
    const roiPercentage = totalInvested > 0 ? (roiAbsolute / totalInvested) * 100 : 0;

    const allHistoryDates = new Set<string>();
    allStats.forEach(s => s.stats.history.forEach(h => allHistoryDates.add(h.date)));
    const sortedDates = Array.from(allHistoryDates).sort();

    const aggregateHistory = sortedDates.map(date => {
      let dailyValue = 0;
      let dailyInvested = 0;
      allStats.forEach(s => {
        const point = s.stats.history.find(h => h.date === date);
        if (point) {
          dailyValue += point.value;
          dailyInvested += point.invested;
        } else {
          const lastPoint = [...s.stats.history].reverse().find(h => new Date(h.date) < new Date(date));
          if (lastPoint) {
            dailyValue += lastPoint.value;
            dailyInvested += lastPoint.invested;
          }
        }
      });
      return { date, value: dailyValue, invested: dailyInvested };
    });

    const coinAggregates = coins.filter(c => plans.some(p => p.coinId === c.id)).map(coin => {
      const coinPlans = allStats.filter(s => s.plan.coinId === coin.id);
      const coinInvested = coinPlans.reduce((acc, s) => acc + s.stats.totalInvested, 0);
      const coinValue = coinPlans.reduce((acc, s) => acc + s.stats.currentValue, 0);
      const coinAmount = coinPlans.reduce((acc, s) => acc + s.stats.totalCoinAmount, 0);
      const coinRoi = coinInvested > 0 ? ((coinValue - coinInvested) / coinInvested) * 100 : 0;

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        invested: coinInvested,
        value: coinValue,
        amount: coinAmount,
        roi: coinRoi,
        plans: coinPlans.map(s => s.plan)
      };
    });

    return { totalInvested, currentValue, roiAbsolute, roiPercentage, aggregateHistory, coinAggregates };
  }, [plans, coins, priceCache]);

  if (loading || isDataLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-3xl flex items-center justify-center mb-8 rotate-12">
          <TrendingUp className="text-orange-500" size={48} />
        </div>
        <h2 className="text-3xl font-black mb-4">Bereit für dein Portfolio?</h2>
        <p className="text-zinc-500 max-w-sm mb-12 text-lg">Erstelle deinen ersten Sparplan und verfolge die historische Performance deiner Krypto-Investments.</p>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center animate-bounce">
            <span className="text-2xl">➕</span>
          </div>
          <span className="text-sm font-medium opacity-50 uppercase tracking-widest">Klicke unten rechts</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Investiert</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Wallet size={16} /></div>
          </div>
          <div className="text-3xl font-black tracking-tight">{portfolioStats?.totalInvested.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Marktwert</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><PieChartIcon size={16} /></div>
          </div>
          <div className="text-3xl font-black tracking-tight">{portfolioStats?.currentValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Performance</span>
            <div className={`p-2 rounded-xl ${portfolioStats && portfolioStats.roiAbsolute >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {portfolioStats && portfolioStats.roiAbsolute >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            </div>
          </div>
          <div className={`text-3xl font-black tracking-tight ${portfolioStats && portfolioStats.roiAbsolute >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolioStats?.roiPercentage.toFixed(2)}%
            <span className="text-xs font-medium ml-2 opacity-50 block sm:inline">
              ({portfolioStats?.roiAbsolute.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-2xl shadow-zinc-200/50 dark:shadow-none h-[450px]"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black uppercase tracking-tight">Portfolio Performance</h3>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-zinc-300 rounded-full" /> Investiert</div>
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-orange-500 rounded-full" /> Wert</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="75%">
          <AreaChart data={portfolioStats?.aggregateHistory}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888811" />
            <XAxis
              dataKey="date"
              tickFormatter={(str) => new Date(str).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })}
              stroke="#888888"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', fontSize: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              formatter={(val: number | undefined) => [val?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '0 €', 'Wert']}
            />
            <Area type="monotone" dataKey="invested" stroke="#888" fill="transparent" strokeDasharray="5 5" strokeWidth={1.5} name="Investiert" />
            <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} name="Wert" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tight px-2">Aktive Positionen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioStats?.coinAggregates.map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/30 dark:shadow-none hover:border-orange-500/40 transition-all group"
            >
              <div className="p-7">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-2xl shadow-lg" />
                    <div>
                      <div className="font-black text-lg">{asset.name}</div>
                      <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{asset.symbol}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-black ${asset.roi >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {asset.roi >= 0 ? '+' : ''}{asset.roi.toFixed(2)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Bestand</div>
                    <div className="font-bold tracking-tight">{asset.amount.toFixed(6)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Marktwert</div>
                    <div className="font-bold tracking-tight">{asset.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-zinc-50 dark:border-white/5">
                  {asset.plans.map(plan => (
                    <Link
                      key={plan.id}
                      to={`/plan/${plan.id}`}
                      className="flex justify-between items-center p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 hover:bg-orange-500 hover:text-white transition-all group/item"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">{plan.interval === 'weekly' ? 'Wöchentlich' : 'Monatlich'} • {plan.amount} €</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
