'use client';

import React, { useState, useEffect } from 'react';
import PublicLayout from '@/app/(public)/layout';
import Link from 'next/link';
import { DataRepository } from '@/lib/data/repository';
import {
  PublicCatalogItem,
  ComboWithItems,
  BusinessHours,
  BlockedDate,
  Appointment,
  AppSettings,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  formatAppointmentMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp/message-builder';
import {
  CalendarSelector,
  getFirstAvailableDate,
} from '@/components/public/CalendarSelector';
import {
  User as UserLucide,
  Phone as PhoneLucide,
  CheckCircle as CheckCircleLucide,
  AlertTriangle as AlertTriangleLucide,
  Send as SendLucide,
  ArrowLeft as ArrowLeftLucide,
  Check as CheckLucide,
} from 'lucide-react';

export default function TurnosPage() {
  const [services, setServices] = useState<PublicCatalogItem[]>([]);
  const [combos, setCombos] = useState<ComboWithItems[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [it, co, bh, bd, app, sett] = await Promise.all([
        DataRepository.getPublicCatalogItems(),
        DataRepository.getCombos(),
        DataRepository.getBusinessHours(),
        DataRepository.getBlockedDates(),
        DataRepository.getAppointments(),
        DataRepository.getSettings(),
      ]);
      const activeServices = it.filter((i) => i.type === 'service');
      setServices(activeServices);
      setCombos(co.filter((c) => c.is_active));
      setBusinessHours(bh);
      setBlockedDates(bd);
      setAppointments(app);
      setSettings(sett);

      if (activeServices.length > 0) {
        setSelectedServiceId(activeServices[0].id);
      }

      // Encontrar el primer día que realmente está abierto según la agenda del admin
      const initialAvailableDate = getFirstAvailableDate(bh, bd, new Date());
      setSelectedDate(initialAvailableDate);
      setLoading(false);
    }
    loadData();
  }, []);

  const selectedItem =
    services.find((s) => s.id === selectedServiceId) ||
    combos.find((c) => c.id === selectedServiceId);

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

  // Franjas disponibles
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

    if (!selectedServiceId) {
      setValidationError('Por favor selecciona un servicio o paquete promocional.');
      return;
    }
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
        service_id: selectedItem && 'duration_minutes' in selectedItem ? selectedItem.id : null,
        combo_id: selectedItem && 'items' in selectedItem ? selectedItem.id : null,
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
        serviceOrComboName: selectedItem?.name || 'Servicio General',
        date: formattedDate,
        time: selectedTime,
        notes: notes.trim() || undefined,
        template: settings?.whatsapp_appointment_template || undefined,
      });

      const targetPhone = settings?.whatsapp_phone || '5491100000000';
      const waUrl = buildWhatsAppUrl(targetPhone, message);
      window.open(waUrl, '_blank');

      setIsSuccess(true);
    } catch (err) {
      console.error('Error al agendar:', err);
      setValidationError('Ocurrió un error al procesar la reserva. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeftLucide className="w-4 h-4" />
          Volver al Catálogo
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Reserva de Turno Online
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Elige el servicio, selecciona en el calendario interactivo los días disponibles y coordina directamente por WhatsApp.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleLucide className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ¡Tu solicitud de turno ha sido generada!
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Se abrió WhatsApp con el mensaje prearmado para tu turno del día <strong>{selectedDate}</strong> a las <strong>{selectedTime} hs</strong>.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link href="/">
                <Button variant="primary">Volver al Catálogo</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-8"
          >
            {validationError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangleLucide className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* PASO 1: SELECCIONAR SERVICIO O COMBO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Selecciona el Servicio o Pack
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        setValidationError(null);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {srv.name}
                        </span>
                        {isSelected && <CheckLucide className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          {srv.duration_minutes ? `⏱️ ${srv.duration_minutes} min` : 'Servicio'}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${srv.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {combos.map((cmb) => {
                  const isSelected = selectedServiceId === cmb.id;
                  return (
                    <button
                      key={cmb.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceId(cmb.id);
                        setValidationError(null);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {cmb.name}
                        </span>
                        {isSelected && <CheckLucide className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-600 font-medium">✨ Promo Pack</span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                          ${cmb.final_price.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: CALENDARIO INTERACTIVO */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Elige el Día en el Calendario
              </h3>
              <p className="text-xs text-zinc-500">
                Solo puedes seleccionar días en los que el establecimiento atiende y no estén bloqueados por feriados.
              </p>

              {/* Componente de Calendario Dinámico */}
              <CalendarSelector
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                businessHours={businessHours}
                blockedDates={blockedDates}
              />
            </div>

            {/* PASO 3: FRANJAS HORARIAS DISPONIBLES */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Horarios Disponibles para el {selectedDate}
                </h3>
                {selectedTime && (
                  <Badge variant="emerald" size="sm">
                    Seleccionado: {selectedTime} hs
                  </Badge>
                )}
              </div>

              {isDateBlocked ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangleLucide className="w-4 h-4 shrink-0" />
                  <span>Cerrado: {blockedReason || 'Día no laboral / Feriado'}.</span>
                </div>
              ) : !isBusinessOpenToday ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangleLucide className="w-4 h-4 shrink-0" />
                  <span>El establecimiento no atiende los días seleccionados.</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-zinc-400 py-3 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl">
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {availableSlots.map(({ time, isOccupied }) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => {
                          setSelectedTime(time);
                          setValidationError(null);
                        }}
                        className={`py-2.5 px-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                          isOccupied
                            ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400/50 line-through border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 scale-105'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PASO 4: DATOS DEL CLIENTE */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                Tus Datos para la Confirmación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="turnos-customer-name" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <UserLucide className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="turnos-customer-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Ej: Martín Rodríguez"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="turnos-customer-phone" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Teléfono Celular / WhatsApp *
                  </label>
                  <div className="relative">
                    <PhoneLucide className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="turnos-customer-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="Ej: 11 3456 7890"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="turnos-notes" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Notas o Comentarios (Opcional)
                </label>
                <textarea
                  id="turnos-notes"
                  rows={2}
                  placeholder="Detalles sobre el corte o necesidad..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-base sm:text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* BOTÓN FINAL DE ENVIAR WHATSAPP */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500">
                {selectedTime ? (
                  <span>
                    Turno: <strong>{selectedDate}</strong> a las <strong>{selectedTime} hs</strong>
                  </span>
                ) : (
                  <span>Selecciona un horario para habilitar la confirmación</span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="bg-[#25D366] hover:bg-[#1ebd5a] text-white w-full sm:w-auto shadow-lg shadow-[#25D366]/20 font-bold"
                isLoading={isSubmitting}
              >
                <SendLucide className="w-4 h-4 mr-2" />
                Confirmar y Enviar Reserva por WhatsApp
              </Button>
            </div>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
