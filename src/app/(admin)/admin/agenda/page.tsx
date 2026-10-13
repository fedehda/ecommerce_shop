'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { Appointment, BusinessHours, BlockedDate, AppointmentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';

const DAYS_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function AdminAgendaPage() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'hours' | 'blocked'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro de Turnos
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Form Días Bloqueados
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [hoursSavedSuccess, setHoursSavedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      DataRepository.getAppointments(),
      DataRepository.getBusinessHours(),
      DataRepository.getBlockedDates(),
    ]).then(([app, bh, bd]) => {
      if (!isMounted) return;
      setAppointments(app);
      setBusinessHours(bh);
      setBlockedDates(bd);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await DataRepository.updateAppointmentStatus(id, status);
    const updated = await DataRepository.getAppointments();
    setAppointments(updated);
  };

  const handleUpdateHour = (dayOfWeek: number, field: keyof BusinessHours, value: BusinessHours[keyof BusinessHours]) => {
    setBusinessHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveHours = async () => {
    await DataRepository.updateBusinessHours(businessHours);
    setHoursSavedSuccess(true);
    setTimeout(() => setHoursSavedSuccess(false), 3000);
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    await DataRepository.addBlockedDate(
      newBlockedDate,
      newBlockedReason.trim() || 'Feriado / Cerrado'
    );
    setNewBlockedDate('');
    setNewBlockedReason('');
    const updated = await DataRepository.getBlockedDates();
    setBlockedDates(updated);
  };

  const handleRemoveBlockedDate = async (id: string) => {
    await DataRepository.removeBlockedDate(id);
    const updated = await DataRepository.getBlockedDates();
    setBlockedDates(updated);
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      app.customer_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.customer_phone.includes(searchFilter);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando agenda de turnos..."></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Agenda & Control de Turnos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Administra solicitudes de clientes, horarios comerciales semanales y fechas bloqueadas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Secciones de la agenda" className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-6 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'appointments'}
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'appointments'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Turnos Recibidos ({appointments.length})
          {activeTab === 'appointments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'hours'}
          onClick={() => setActiveTab('hours')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'hours'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Horarios Laborales Semanales
          {activeTab === 'hours' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'blocked'}
          onClick={() => setActiveTab('blocked')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'blocked'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Días Bloqueados / Feriados ({blockedDates.length})
          {activeTab === 'blocked' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
      </div>

      {/* TAB 1: LISTADO DE TURNOS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              aria-label="Buscar turnos por cliente o teléfono"
              placeholder="Buscar por cliente o teléfono..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <select
              aria-label="Filtrar por estado del turno"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | AppointmentStatus)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-400">
              No hay turnos registrados que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {app.customer_name}
                        </h3>
                        <span className="text-xs text-zinc-400">📞 {app.customer_phone}</span>
                      </div>
                      <Badge
                        variant={
                          app.status === 'confirmed'
                            ? 'emerald'
                            : app.status === 'pending'
                            ? 'amber'
                            : app.status === 'cancelled'
                            ? 'rose'
                            : 'zinc'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3 my-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold">{app.appointment_date}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold">{app.start_time} a {app.end_time} hs</span>
                      </div>
                      {app.notes && (
                        <p className="text-zinc-400 italic pt-1">
                          Notas: &quot;{app.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {app.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange(app.id, 'confirmed')}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Confirmar
                      </Button>
                    )}
                    {app.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(app.id, 'completed')}
                      >
                        Completar
                      </Button>
                    )}
                    {app.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(app.id, 'cancelled')}
                        className="text-rose-600 dark:text-rose-400"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HORARIOS LABORALES */}
      {activeTab === 'hours' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Configuración Semanal de Apertura
              </h3>
              <p className="text-xs text-zinc-500">
                Los clientes solo podrán agendar turnos dentro de los días y horarios abiertos.
              </p>
            </div>
            <Button onClick={handleSaveHours} variant="primary" size="sm">
              <Save className="w-4 h-4 mr-1.5" />
              Guardar Horarios
            </Button>
          </div>

          {hoursSavedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              ¡Horarios actualizados exitosamente!
            </div>
          )}

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {businessHours.map((bh) => (
              <div
                key={bh.day_of_week}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-44">
                  <Switch
                    checked={bh.is_open}
                    onChange={(checked) => handleUpdateHour(bh.day_of_week, 'is_open', checked)}
                  />
                  <span
                    className={`font-semibold text-sm ${
                      bh.is_open ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 line-through'
                    }`}
                  >
                    {DAYS_NAMES[bh.day_of_week]}
                  </span>
                </div>

                {bh.is_open ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Desde:</span>
                      <input
                        type="time"
                        value={bh.open_time}
                        onChange={(e) => handleUpdateHour(bh.day_of_week, 'open_time', e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Hasta:</span>
                      <input
                        type="time"
                        value={bh.close_time}
                        onChange={(e) => handleUpdateHour(bh.day_of_week, 'close_time', e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Intervalo:</span>
                      <select
                        value={bh.slot_duration_minutes}
                        onChange={(e) =>
                          handleUpdateHour(bh.day_of_week, 'slot_duration_minutes', parseInt(e.target.value))
                        }
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 italic">Cerrado todo el día</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DÍAS BLOQUEADOS */}
      {activeTab === 'blocked' && (
        <div className="space-y-6">
          {/* Form Agregar Día Bloqueado */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1">
              Bloquear Fecha Específica
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Impide la reserva de turnos en feriados nacionales, días de descanso o vacaciones.
            </p>

            <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                required
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                placeholder="Motivo (ej: Feriado Nacional, Refacciones)..."
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <Button type="submit" variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1" />
                Bloquear Fecha
              </Button>
            </form>
          </div>

          {/* Listado de Fechas Bloqueadas */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4">
              Fechas Actualmente Bloqueadas
            </h4>
            {blockedDates.length === 0 ? (
              <p className="text-zinc-400 text-xs">No hay fechas bloqueadas configuradas.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {blockedDates.map((bd) => (
                  <div
                    key={bd.id}
                    className="py-3 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-rose-500" />
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {bd.date}
                      </span>
                      <span className="text-xs text-zinc-500">• {bd.reason}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDate(bd.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Eliminar bloqueo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
