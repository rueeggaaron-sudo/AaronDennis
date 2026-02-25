import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800", className)} />
  );
};
