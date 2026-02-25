import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const FAB: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center transition-shadow hover:shadow-orange-500/50"
    >
      <Plus size={32} />
    </motion.button>
  );
};
