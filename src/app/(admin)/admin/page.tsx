'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { Item, ComboWithItems, Appointment, AppSettings, AppointmentStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [combos, setCombos] = useState<ComboWithItems[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [it, co, app, sett] = await Promise.all([
        DataRepository.getAdminItems(),
        DataRepository.getCombos(),
        DataRepository.getAppointments(),
        DataRepository.getSettings(),
      ]);
      setItems(it);
      setCombos(co);
      setAppointments(app);
      setSettings(sett);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalProducts = items.filter((i) => i.type === 'product').length;
  const totalServices = items.filter((i) => i.type === 'service').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed');

  const averageMargin =
    items.length > 0
      ? items.reduce((acc, curr) => acc + curr.margin_percentage, 0) / items.length
      : 0;

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    await DataRepository.updateAppointmentStatus(id, status);
    const updated = await DataRepository.getAppointments();
    setAppointments(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando panel de administración..."></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 dark:from-emerald-950/60 dark:via-zinc-900 dark:to-zinc-950 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 dark:border-zinc-800 shadow-xs dark:shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Control Financiero & Operativo
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Hola! Bienvenido al panel de {settings?.business_name || 'tu negocio'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
            Administra tus precios con Markup o Margen desacoplados, controla las reservas de turnos y genera presupuestos detallados para enviar por WhatsApp en segundos.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/admin/presupuestos">
              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold">
                <FileText className="w-4 h-4 mr-1.5" />
                Cotizador Rápido WhatsApp
              </Button>
            </Link>
            <Link href="/admin/items">
              <Button variant="outline" size="sm" className="bg-white/80 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold shadow-2xs">
                <Package className="w-4 h-4 mr-1.5" />
                Gestionar Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>


      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Total Ítems */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Catálogo Total</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            {items.length}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
            <span>{totalServices} servicios</span>
            <span>•</span>
            <span>{totalProducts} productos</span>
          </div>
        </div>

        {/* KPI 2: Margen Promedio */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Margen Promedio</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            {averageMargin.toFixed(1)}%
          </p>
          <span className="text-xs text-zinc-500 block mt-2">Rentabilidad s/ Venta</span>
        </div>

        {/* KPI 3: Combos Activos */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Combos y Packs</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            {combos.length}
          </p>
          <span className="text-xs text-zinc-500 block mt-2">Paquetes con descuento</span>
        </div>

        {/* KPI 4: Turnos Pendientes */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Turnos Pendientes</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            {pendingAppointments.length}
          </p>
          <span className="text-xs text-amber-600 dark:text-amber-400 block mt-2">
            {confirmedAppointments.length} confirmados
          </span>
        </div>
      </div>

      {/* Main Section: Agenda & Turnos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Turnos Recibidos */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Próximos Turnos Solicitados
              </h2>
              <p className="text-xs text-zinc-500">Últimas reservas registradas o recibidas</p>
            </div>
            <Link
              href="/admin/agenda"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Ver agenda completa
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No hay turnos registrados en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {app.customer_name}
                        </span>
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
                          size="sm"
                        >
                          {app.status === 'confirmed'
                            ? 'Confirmado'
                            : app.status === 'pending'
                            ? 'Pendiente'
                            : app.status === 'cancelled'
                            ? 'Cancelado'
                            : 'Completado'}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        📅 {app.appointment_date} a las {app.start_time} hs • Tel: {app.customer_phone}
                      </p>
                      {app.notes && (
                        <p className="text-xs text-zinc-400 italic mt-0.5">&quot;{app.notes}&quot;</p>
                      )}
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {app.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                        className="text-xs py-1"
                      >
                        Confirmar
                      </Button>
                    )}
                    {app.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(app.id, 'completed')}
                        className="text-xs py-1"
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools Box */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
              Accesos Directos
            </h3>
            <div className="space-y-3">
              <Link
                href="/admin/items"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Crear Producto o Servicio
                    </h4>
                    <p className="text-xs text-zinc-500">Con cálculo Markup/Margen</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>

              <Link
                href="/admin/presupuestos"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Cotizador WhatsApp
                    </h4>
                    <p className="text-xs text-zinc-500">Enviar presupuesto al cliente</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>

              <Link
                href="/admin/agenda"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Horarios y Días Cerrados
                    </h4>
                    <p className="text-xs text-zinc-500">Gestionar disponibilidad</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
