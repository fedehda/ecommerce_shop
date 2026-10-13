'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PublicCatalogItem,
  ComboWithItems,
  BusinessHours,
  BlockedDate,
  Appointment,
  AppSettings,
} from '@/types';
import { DataRepository } from '@/lib/data/repository';
import {
  formatAppointmentMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp/message-builder';
import {
  CalendarSelector,
  getFirstAvailableDate,
} from './CalendarSelector';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: PublicCatalogItem | ComboWithItems | null;
  settings?: AppSettings | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialItem,
  settings,
}) => {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    Promise.all([
      DataRepository.getBusinessHours(),
      DataRepository.getBlockedDates(),
      DataRepository.getAppointments(),
    ]).then(([bh, bd, app]) => {
      if (!isMounted) return;
      setBusinessHours(bh);
      setBlockedDates(bd);
      setAppointments(app);
      const initialDate = getFirstAvailableDate(bh, bd, new Date());
      setSelectedDate(initialDate);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsSuccess(false);
    setSelectedTime('');
    setValidationError(null);
    onClose();
  };

  if (!isOpen) return null;

  const itemName = initialItem ? initialItem.name : 'Servicio General';
  const itemPrice = initialItem
    ? 'price' in initialItem
      ? initialItem.price
      : initialItem.final_price
    : 0;

  // Validaciones del día seleccionado
  const isDateBlocked = blockedDates.some((bd) => bd.date === selectedDate);
  const blockedReason = blockedDates.find((bd) => bd.date === selectedDate)?.reason;

  let dayOfWeek = 0;
  if (selectedDate) {
    const parts = selectedDate.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dayOfWeek = dateObj.getDay();
  }
  const currentDaySchedule = businessHours.find((bh) => bh.day_of_week === dayOfWeek);
  const isBusinessOpenToday = currentDaySchedule ? currentDaySchedule.is_open : false;

  // Franjas horarias disponibles
  const availableSlots: Array<{ time: string; isOccupied: boolean }> = [];
  if (currentDaySchedule && isBusinessOpenToday && !isDateBlocked) {
    const [openH, openM] = currentDaySchedule.open_time.split(':').map(Number);
    const [closeH, closeM] = currentDaySchedule.close_time.split(':').map(Number);
    const slotDuration = currentDaySchedule.slot_duration_minutes || 30;

    let currentMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const existingTimes = appointments
      .filter((a) => a.appointment_date === selectedDate && a.status !== 'cancelled')
      .map((a) => a.start_time.substring(0, 5));

    while (currentMinutes + slotDuration <= closeMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      const isOccupied = existingTimes.includes(timeStr);
      availableSlots.push({ time: timeStr, isOccupied });

      currentMinutes += slotDuration;
    }
  }

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedDate || isDateBlocked || !isBusinessOpenToday) {
      setValidationError('Por favor selecciona una fecha disponible en el calendario.');
      return;
    }
    if (!selectedTime) {
      setValidationError('Por favor selecciona un horario disponible de la lista.');
      return;
    }
    if (!customerName.trim()) {
      setValidationError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!customerPhone.trim()) {
      setValidationError('Por favor ingresa tu teléfono celular / WhatsApp.');
      return;
    }

    setIsSubmitting(true);

    try {
      await DataRepository.createAppointment({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        service_id: initialItem && 'price' in initialItem ? initialItem.id : null,
        combo_id: initialItem && 'final_price' in initialItem ? initialItem.id : null,
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: selectedTime,
        status: 'pending',
        notes: notes.trim(),
      });

      const parts = selectedDate.split('-');
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

      const message = formatAppointmentMessage({
        businessName: settings?.business_name || 'Studio Style',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceOrComboName: itemName,
        date: formattedDate,
        time: selectedTime,
        notes: notes.trim() || undefined,
        template: settings?.whatsapp_appointment_template || undefined,
      });

      const targetPhone = settings?.whatsapp_phone || '5491100000000';
      const waUrl = buildWhatsAppUrl(targetPhone, message);
      window.open(waUrl, '_blank');

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error al agendar:', err);
      setValidationError('Ocurrió un error al procesar la reserva. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reservar Turno Online" maxWidth="xl">
      {isSuccess ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" aria-hidden="true" />
          </div>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ¡Turno Registrado con Éxito!
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Se ha abierto WhatsApp con los datos de tu reserva para que puedas confirmarlo con el negocio.
          </p>
          <div className="pt-2">
            <Button type="button" variant="primary" onClick={handleClose}>
              Aceptar y Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {validationError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Header del Servicio Seleccionado */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{itemName}</h4>
                <span className="text-xs text-zinc-400 font-mono">
                  ${itemPrice.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
            <Badge variant="emerald" size="sm">
              Confirmación vía WhatsApp
            </Badge>
          </div>

          {/* Selector de Fecha con Calendario Visual */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              Selecciona el Día en el Calendario
            </label>
            <CalendarSelector
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              businessHours={businessHours}
              blockedDates={blockedDates}
            />
          </div>

          {/* Selector Dinámico de Franjas Horarias */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Horarios Disponibles para {selectedDate}
              </label>
              {selectedTime && (
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  {selectedTime} hs
                </span>
              )}
            </div>

            {isDateBlocked ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Fecha cerrada: {blockedReason || 'Día no laboral / Feriado'}.</span>
              </div>
            ) : !isBusinessOpenToday ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>El establecimiento no atiende los días seleccionados.</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                No hay horarios disponibles para esta fecha.
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
                {availableSlots.map(({ time, isOccupied }) => (
                  <button
                    key={time}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => {
                      setSelectedTime(time);
                      setValidationError(null);
                    }}
                    className={`py-2 px-1 text-xs font-mono font-semibold rounded-xl border transition-all ${
                      isOccupied
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400/50 border-zinc-200 dark:border-zinc-800 line-through cursor-not-allowed'
                        : selectedTime === time
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Datos de Contacto del Cliente */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label htmlFor="booking-name" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tu Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="booking-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ej: Lucas Martínez"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-base sm:text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="booking-phone" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tu Teléfono de WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Ej: 11 2345 6789"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="booking-notes" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Comentarios o Aclaraciones (Opcional)
              </label>
              <textarea
                id="booking-notes"
                rows={2}
                placeholder="Ej: Prefiero corte con tijera / primera visita..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-base sm:text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold"
              isLoading={isSubmitting}
            >
              <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Solicitar Turno por WhatsApp
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
