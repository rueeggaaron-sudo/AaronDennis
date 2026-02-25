import React from 'react';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 md:px-8 py-8 pb-32">
        {children}
      </main>
    </div>
  );
};
