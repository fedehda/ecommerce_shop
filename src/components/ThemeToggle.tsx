'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { resolvedMode, toggleMode } = useTheme();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={toggleMode}
        className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs flex items-center gap-2 group cursor-pointer"
        title={
          resolvedMode === 'dark'
            ? 'Cambiar a Modo Claro (Luminoso)'
            : 'Cambiar a Modo Oscuro'
        }
        aria-label="Alternar tema claro/oscuro"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${
              resolvedMode === 'dark' ? 'scale-0 rotate-90 absolute' : 'scale-100 rotate-0'
            }`}
          />
          <Moon
            className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${
              resolvedMode === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute'
            }`}
          />
        </div>

        {showLabel && (
          <span className="text-xs font-medium">
            {resolvedMode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        )}
      </button>
    </div>
  );
};
