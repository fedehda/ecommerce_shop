'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DataRepository } from '@/lib/data/repository';
import { ThemeMode } from '@/types';

export interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  lightColor: string;
  darkColor: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'emerald',
    name: 'Esmeralda Clásico',
    primaryColor: '#059669',
    lightColor: '#ecfdf5',
    darkColor: '#064e3b',
    description: 'Estilo tradicional de barbería y naturaleza, fresco y equilibrado.',
  },
  {
    id: 'blue',
    name: 'Azul Zafiro',
    primaryColor: '#2563eb',
    lightColor: '#eff6ff',
    darkColor: '#1e3a8a',
    description: 'Estilo moderno, tecnológico, limpio y profesional.',
  },
  {
    id: 'purple',
    name: 'Púrpura Amatista',
    primaryColor: '#7c3aed',
    lightColor: '#f5f3ff',
    darkColor: '#4c1d95',
    description: 'Elegancia, lujo, salón de estética y spa premium.',
  },
  {
    id: 'amber',
    name: 'Ámbar Dorado',
    primaryColor: '#d97706',
    lightColor: '#fffbeb',
    darkColor: '#78350f',
    description: 'Cálido, vintage, estilo cuero y barbería clásica de época.',
  },
  {
    id: 'rose',
    name: 'Rosa Rubí',
    primaryColor: '#e11d48',
    lightColor: '#fff1f2',
    darkColor: '#881337',
    description: 'Vibrante, salón de belleza, estética contemporánea y cosmética.',
  },
  {
    id: 'zinc',
    name: 'Grafito Noir',
    primaryColor: '#27272a',
    lightColor: '#f4f4f5',
    darkColor: '#09090b',
    description: 'Minimalista sobrio, monocolor premium en blanco y negro.',
  },
];

interface ThemeContextType {
  theme: string;
  setTheme: (themeId: string) => Promise<void>;
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'emerald',
  setTheme: async () => {},
  mode: 'light',
  resolvedMode: 'light',
  setMode: async () => {},
  toggleMode: async () => {},
  themes: THEME_OPTIONS,
});

export const useTheme = () => useContext(ThemeContext);

const LOCAL_STORAGE_MODE_KEY = 'app_theme_mode';
const LOCAL_STORAGE_THEME_KEY = 'app_theme_palette';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (cached) return cached;
    }
    return 'emerald';
  });
  const [mode, setCurrentMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(LOCAL_STORAGE_MODE_KEY) as ThemeMode | null;
      if (cached) return cached;
    }
    return 'light';
  });
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const resolvedMode: 'light' | 'dark' =
    mode === 'dark' ? 'dark' : mode === 'light' ? 'light' : isSystemDark ? 'dark' : 'light';

  // Listener para cuando el modo es 'system' y el usuario cambia su SO
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sincronización del DOM según el modo y la paleta actual
  useEffect(() => {
    if (resolvedMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [resolvedMode, theme]);

  // Sincronización inicial asíncrona con el repositorio
  useEffect(() => {
    let isMounted = true;
    DataRepository.getSettings().then((settings) => {
      if (!isMounted) return;
      const dbPalette = settings.theme_palette || 'emerald';
      const dbMode = (settings.theme_mode as ThemeMode) || 'light';

      const cachedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      const cachedMode = localStorage.getItem(LOCAL_STORAGE_MODE_KEY);

      if (!cachedTheme) {
        setCurrentTheme(dbPalette);
      }
      if (!cachedMode) {
        setCurrentMode(dbMode);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = async (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    await DataRepository.updateSettings({ theme_palette: newTheme });
  };

  const setMode = async (newMode: ThemeMode) => {
    setCurrentMode(newMode);
    localStorage.setItem(LOCAL_STORAGE_MODE_KEY, newMode);
    await DataRepository.updateSettings({ theme_mode: newMode });
  };

  const toggleMode = async () => {
    const nextMode: ThemeMode = resolvedMode === 'dark' ? 'light' : 'dark';
    await setMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        mode,
        resolvedMode,
        setMode,
        toggleMode,
        themes: THEME_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
