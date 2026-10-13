'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { BusinessHours, BlockedDate } from '@/types';

interface CalendarSelectorProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Encuentra el primer día disponible a partir de una fecha base
 */
export function getFirstAvailableDate(
  businessHours: BusinessHours[],
  blockedDates: BlockedDate[],
  startDate: Date = new Date()
): string {
  const current = new Date(startDate);
  // Buscar en los próximos 60 días
  for (let i = 0; i < 60; i++) {
    const y = current.getFullYear();
    const m = (current.getMonth() + 1).toString().padStart(2, '0');
    const d = current.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const dayOfWeek = current.getDay(); // 0 = Domingo
    const schedule = businessHours.find((bh) => bh.day_of_week === dayOfWeek);
    const isOpen = schedule ? schedule.is_open : false;
    const isBlocked = blockedDates.some((bd) => bd.date === dateStr);

    if (isOpen && !isBlocked) {
      return dateStr;
    }
    current.setDate(current.getDate() + 1);
  }

  // Fallback si no encuentra
  const fallback = new Date(startDate);
  return fallback.toISOString().split('T')[0];
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDate,
  onSelectDate,
  businessHours,
  blockedDates,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Inicializar vista con el mes de la fecha seleccionada o hoy
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  // Navegación de meses
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Días en el mes
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Día de la semana del primer día del mes (0=Dom, 1=Lun...)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  // Ajustar para que la semana empiece en Lunes (0=Lun, 6=Dom)
  const startingCol = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Evaluar estado de cada día
  const checkDayStatus = (day: number) => {
    const dateObj = new Date(viewYear, viewMonth, day);
    dateObj.setHours(0, 0, 0, 0);

    const y = viewYear;
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    // 1. En el pasado
    if (dateObj < today) {
      return { enabled: false, reason: 'Pasado' };
    }

    // 2. Bloqueado en Admin (Feriado o Día Cerrado específico)
    const blocked = blockedDates.find((bd) => bd.date === dateStr);
    if (blocked) {
      return { enabled: false, reason: blocked.reason || 'Feriado' };
    }

    // 3. Día de la semana no laboral según configuración en Admin
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo
    const schedule = businessHours.find((bh) => bh.day_of_week === dayOfWeek);
    if (!schedule || !schedule.is_open) {
      return { enabled: false, reason: 'Cerrado' };
    }

    return { enabled: true, dateStr };
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3 sm:p-5 border border-zinc-200 dark:border-zinc-700/80 space-y-4 select-none">
      {/* Header del Calendario con navegación de Mes */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Mes anterior"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Cabecera de Días de la Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Grilla de Días */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Espacios vacíos antes del primer día del mes */}
        {Array.from({ length: startingCol }).map((_, index) => (
          <div key={`empty-${index}`} className="h-10 sm:h-11" />
        ))}

        {/* Días del Mes */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const status = checkDayStatus(day);
          const y = viewYear;
          const m = (viewMonth + 1).toString().padStart(2, '0');
          const d = day.toString().padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          const isSelected = selectedDate === dateStr;

          if (!status.enabled) {
            return (
              <div
                key={day}
                title={status.reason}
                className="h-10 sm:h-11 rounded-lg sm:rounded-xl flex flex-col items-center justify-center bg-zinc-100/60 dark:bg-zinc-900/40 text-zinc-400/60 dark:text-zinc-600 cursor-not-allowed border border-transparent p-0.5"
              >
                <span className="text-xs sm:text-sm font-medium line-through leading-tight">{day}</span>
                <span className="text-[6px] min-[360px]:text-[6.5px] sm:text-[8px] uppercase tracking-tighter truncate max-w-full px-0.5 opacity-70 leading-none mt-0.5 text-center">
                  {status.reason === 'Cerrado' ? 'No atiende' : status.reason}
                </span>
              </div>
            );
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`h-10 sm:h-11 rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all border p-0.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md shadow-emerald-600/30 scale-105'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 font-semibold'
              }`}
            >
              <span className="text-xs sm:text-sm leading-tight">{day}</span>
              <span
                className={`text-[6px] min-[360px]:text-[6.5px] sm:text-[8px] uppercase tracking-tighter leading-none mt-0.5 truncate max-w-full px-0.5 text-center font-medium ${
                  isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                Disponible
              </span>
            </button>
          );
        })}
      </div>

      {/* Leyenda de Ayuda */}
      <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/60 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>Día abierto en agenda</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
          <span>Cerrado / No laborable</span>
        </div>
      </div>
    </div>
  );
};
