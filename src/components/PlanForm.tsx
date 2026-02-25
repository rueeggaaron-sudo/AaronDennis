import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Sparplan } from '../utils/dcaEngine';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export const PlanForm: React.FC<{ onClose: () => void, editPlan?: Sparplan }> = ({ onClose, editPlan }) => {
  const { coins, addPlan, updatePlan } = useApp();
  const [formData, setFormData] = useState<Partial<Sparplan>>(
    editPlan || {
      coinId: '',
      amount: 50,
      interval: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCoin = coins.find(c => c.id === formData.coinId);
    if (!selectedCoin) return;

    const plan: Sparplan = {
      id: editPlan?.id || crypto.randomUUID(),
      coinId: formData.coinId!,
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      amount: Number(formData.amount),
      interval: formData.interval as 'weekly' | 'monthly',
      startDate: formData.startDate!,
    };

    if (editPlan) {
      updatePlan(plan);
    } else {
      addPlan(plan);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{editPlan ? 'Sparplan bearbeiten' : 'Neuer Sparplan'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Coin wählen</label>
            <select
              value={formData.coinId}
              onChange={e => setFormData({...formData, coinId: e.target.value})}
              required
              className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 ring-orange-500/50 transition-all appearance-none"
            >
              <option value="">Wähle einen Coin...</option>
              {coins.map(coin => (
                <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Betrag in EUR</label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
              required
              min="1"
              className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 ring-orange-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Intervall</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, interval: 'weekly'})}
                className={`py-2 rounded-xl border ${formData.interval === 'weekly' ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}
              >
                Wöchentlich
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, interval: 'monthly'})}
                className={`py-2 rounded-xl border ${formData.interval === 'monthly' ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}
              >
                Monatlich
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Startdatum</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 ring-orange-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            {editPlan ? 'Speichern' : 'Plan erstellen'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
