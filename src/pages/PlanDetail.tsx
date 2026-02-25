import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateDCA } from '../utils/dcaEngine';
import { exportTransactionsToCSV } from '../utils/csvExport';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Download, Trash2, Edit3, TrendingUp, Wallet, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlanForm } from '../components/PlanForm';
import { Skeleton } from '../components/Skeleton';

export const PlanDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plans, coins, priceCache, fetchPricesForCoin, deletePlan } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  const plan = plans.find(p => p.id === id);

  useEffect(() => {
    if (plan) {
      setIsPriceLoading(true);
      fetchPricesForCoin(plan.coinId, plan.startDate).finally(() => setIsPriceLoading(false));
    }
  }, [plan, fetchPricesForCoin]);

  const stats = useMemo(() => {
    if (!plan || !priceCache[plan.coinId]) return null;
    const coin = coins.find(c => c.id === plan.coinId);
    if (!coin) return null;
    return calculateDCA(plan, priceCache[plan.coinId], coin.current_price);
  }, [plan, coins, priceCache]);

  if (!plan) {
    return (
      <div className="text-center py-32">
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Plan nicht gefunden</h2>
        <Link to="/" className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform inline-block">
          Zurück zum Dashboard
        </Link>
      </div>
    );
  }

  const coin = coins.find(c => c.id === plan.coinId);

  const handleDelete = () => {
    if (confirm('Möchtest du diesen Sparplan wirklich löschen?')) {
      deletePlan(plan.id);
      navigate('/');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-zinc-400 hover:text-orange-500 transition-colors group">
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 group-hover:border-orange-500/50">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold uppercase text-xs tracking-widest">Dashboard</span>
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 hover:border-orange-500/50 transition-all shadow-sm"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 hover:border-red-500/50 text-red-500 transition-all shadow-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center gap-8 p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
      >
        <div className="relative">
          <img src={coin?.image} alt={plan.coinName} className="w-20 h-20 rounded-3xl shadow-xl" />
          <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-1.5 rounded-xl shadow-lg">
            <TrendingUp size={14} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight">{plan.coinName}</h1>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-500 uppercase font-black tracking-widest">{plan.coinSymbol}</span>
          </div>
          <p className="text-zinc-400 font-medium">{plan.interval === 'weekly' ? 'Wöchentlich' : 'Monatlich'} • {plan.amount} € • Start am {new Date(plan.startDate).toLocaleDateString('de-DE')}</p>
        </div>
        <button
          onClick={() => stats && exportTransactionsToCSV(stats.transactions, plan.coinName)}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest shadow-xl shadow-zinc-900/20 dark:shadow-none"
        >
          <Download size={18} />
          CSV Export
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Investiert', value: stats?.totalInvested.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }), icon: Wallet, color: 'blue' },
          { label: 'Marktwert', value: stats?.currentValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }), icon: TrendingUp, color: 'orange' },
          { label: 'Bestand', value: `${stats?.totalCoinAmount.toFixed(6)} ${plan.coinSymbol.toUpperCase()}`, icon: Coins, color: 'purple' },
          { label: 'Performance', value: `${stats?.roiPercentage.toFixed(2)}%`, subValue: stats?.roiAbsolute.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }), icon: TrendingUp, color: (stats?.roiAbsolute || 0) >= 0 ? 'green' : 'red' }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-lg shadow-zinc-200/30 dark:shadow-none"
          >
            <div className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{item.label}</div>
            <div className={`text-2xl font-black tracking-tight ${item.color === 'green' ? 'text-green-500' : item.color === 'red' ? 'text-red-500' : ''}`}>
              {item.value}
            </div>
            {item.subValue && <div className={`text-xs font-bold mt-1 ${(stats?.roiAbsolute || 0) >= 0 ? 'text-green-500/50' : 'text-red-500/50'}`}>({item.subValue})</div>}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-2xl shadow-zinc-200/50 dark:shadow-none h-[450px]"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black uppercase tracking-tight">Kursentwicklung & DCA</h3>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
             <div className="flex items-center gap-2"><div className="w-3 h-1 bg-zinc-300 rounded-full" /> Investiert</div>
             <div className="flex items-center gap-2"><div className="w-3 h-1 bg-orange-500 rounded-full" /> Wert</div>
          </div>
        </div>
        {isPriceLoading ? (
           <Skeleton className="h-full w-full rounded-2xl" />
        ) : (
          <ResponsiveContainer width="100%" height="75%">
            <AreaChart data={stats?.history}>
              <defs>
                <linearGradient id="colorValueDetail" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#colorValueDetail)" strokeWidth={4} name="Wert" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-200/30 dark:shadow-none"
      >
        <div className="p-8 border-b border-zinc-50 dark:border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tight">Kaufhistorie</h3>
          <div className="px-4 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {stats?.transactions.length} Transaktionen
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-black/20 text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Datum</th>
                <th className="px-8 py-5">Investment</th>
                <th className="px-8 py-5">Kurs</th>
                <th className="px-8 py-5">Menge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
              {stats?.transactions.slice().reverse().map((tx, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold">{new Date(tx.date).toLocaleDateString('de-DE')}</td>
                  <td className="px-8 py-5 text-sm font-medium">{tx.amountEur.toFixed(2)} €</td>
                  <td className="px-8 py-5 text-sm font-medium text-zinc-500">{tx.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-8 py-5 text-sm font-black text-orange-500 tracking-tight group-hover:scale-110 transition-transform origin-left">
                    {tx.amountCoin.toFixed(8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isEditModalOpen && <PlanForm onClose={() => setIsEditModalOpen(false)} editPlan={plan} />}
    </div>
  );
};
