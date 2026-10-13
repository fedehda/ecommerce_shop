'use client';

import React from 'react';
import { PricingMode, PricingMetrics } from '@/types';
import {
  calculatePriceFromMarkup,
  calculatePriceFromMargin,
  getMetrics,
} from '@/lib/calculations/pricing';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

interface PricingCalculatorProps {
  cost: number;
  mode: PricingMode;
  markupPercentage: number;
  marginPercentage: number;
  price: number;
  currencySymbol?: string;
  onCostChange: (cost: number) => void;
  onModeChange: (mode: PricingMode) => void;
  onMarkupChange: (markup: number) => void;
  onMarginChange: (margin: number) => void;
  onPriceChange: (price: number) => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  cost,
  mode,
  markupPercentage,
  marginPercentage,
  price,
  currencySymbol = '$',
  onCostChange,
  onModeChange,
  onMarkupChange,
  onMarginChange,
  onPriceChange,
}) => {
  // Manejo de cambio de Costo
  const handleCostChange = (newCost: number) => {
    onCostChange(newCost);
    if (mode === 'markup') {
      const calculatedPrice = calculatePriceFromMarkup(newCost, markupPercentage);
      onPriceChange(calculatedPrice);
      const metrics = getMetrics(newCost, calculatedPrice);
      onMarginChange(metrics.margin);
    } else {
      const calculatedPrice = calculatePriceFromMargin(newCost, marginPercentage);
      onPriceChange(calculatedPrice);
      const metrics = getMetrics(newCost, calculatedPrice);
      onMarkupChange(metrics.markup);
    }
  };

  // Manejo de cambio de Markup
  const handleMarkupChange = (newMarkup: number) => {
    onMarkupChange(newMarkup);
    const calculatedPrice = calculatePriceFromMarkup(cost, newMarkup);
    onPriceChange(calculatedPrice);
    const metrics = getMetrics(cost, calculatedPrice);
    onMarginChange(metrics.margin);
  };

  // Manejo de cambio de Margen
  const handleMarginChange = (newMargin: number) => {
    const clampedMargin = Math.min(99.9, Math.max(0, newMargin));
    onMarginChange(clampedMargin);
    const calculatedPrice = calculatePriceFromMargin(cost, clampedMargin);
    onPriceChange(calculatedPrice);
    const metrics = getMetrics(cost, calculatedPrice);
    onMarkupChange(metrics.markup);
  };

  // Manejo de cambio manual directo de Precio de Venta
  const handleDirectPriceChange = (newPrice: number) => {
    onPriceChange(newPrice);
    const metrics = getMetrics(cost, newPrice);
    onMarkupChange(metrics.markup);
    onMarginChange(metrics.margin);
  };

  // Alternar modo
  const toggleMode = (newMode: PricingMode) => {
    onModeChange(newMode);
    if (newMode === 'markup') {
      const metrics = getMetrics(cost, price);
      onMarkupChange(metrics.markup);
    } else {
      const metrics = getMetrics(cost, price);
      onMarginChange(metrics.margin);
    }
  };

  const metrics: PricingMetrics = getMetrics(cost, price);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
      {/* Header con Switch de Modo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Estrategia de Fijación de Precios
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Alterna entre sobreprecio respecto al costo o margen de beneficio sobre la venta.
          </p>
        </div>

        {/* Switch de Modo */}
        <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-700/60 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toggleMode('markup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'markup'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Fijar por Markup
          </button>
          <button
            type="button"
            onClick={() => toggleMode('margin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'margin'
                ? 'bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Fijar por Margen
          </button>
        </div>
      </div>

      {/* Grid de Inputs: Costo y Parámetro según modo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Costo Base */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Costo Base ({currencySymbol})
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cost || ''}
              onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <span className="text-[11px] text-zinc-400">Costo directo de producción o compra.</span>
        </div>

        {/* Input condicional según el Modo */}
        {mode === 'markup' ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Markup Deseado (%)
              </label>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                +{markupPercentage}% s/costo
              </span>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Percent className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={markupPercentage || ''}
                onChange={(e) => handleMarkupChange(parseFloat(e.target.value) || 0)}
                placeholder="100"
                className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <span className="text-[11px] text-zinc-400">
              Sobreprecio sobre el costo: Costo × (1 + {markupPercentage}%)
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Margen Deseado (%)
              </label>
              <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                {marginPercentage}% s/venta
              </span>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Percent className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                max="99"
                step="1"
                value={marginPercentage || ''}
                onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                placeholder="50"
                className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <span className="text-[11px] text-zinc-400">
              Porcentaje del precio final que es ganancia: Costo / (1 - {marginPercentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Tarjeta de Resultados y Métricas en Tiempo Real */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div>
          <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Precio Final</span>
          <div className="relative mt-1">
            <input
              type="number"
              min="0"
              step="0.01"
              value={price || ''}
              onChange={(e) => handleDirectPriceChange(parseFloat(e.target.value) || 0)}
              className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 w-full text-center bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 focus:border-emerald-500 focus:outline-hidden py-0.5"
            />
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Editable directo</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Ganancia Neta</span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
            {currencySymbol}{metrics.profit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Precio - Costo</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Markup Resultante</span>
          <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 block mt-1">
            {metrics.markup.toFixed(1)}%
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">s/ Costo</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Margen Resultante</span>
          <span className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300 block mt-1">
            {metrics.margin.toFixed(1)}%
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">s/ Venta</span>
        </div>
      </div>
    </div>
  );
};
