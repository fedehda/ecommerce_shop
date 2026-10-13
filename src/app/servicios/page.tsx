'use client';

import React, { useState, useEffect } from 'react';
import PublicLayout from '@/app/(public)/layout';
import Link from 'next/link';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { PublicCatalogItem, ComboWithItems, Category, AppSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/CategoryIcon';
import { BookingModal } from '@/components/public/BookingModal';

export default function ServiciosPage() {
  const [services, setServices] = useState<PublicCatalogItem[]>([]);
  const [combos, setCombos] = useState<ComboWithItems[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PublicCatalogItem | ComboWithItems | null>(null);

  useEffect(() => {
    async function loadData() {
      const [it, co, cat, sett] = await Promise.all([
        DataRepository.getPublicCatalogItems(),
        DataRepository.getCombos(),
        DataRepository.getCategories(),
        DataRepository.getSettings(),
      ]);
      setServices(it.filter((i) => i.type === 'service'));
      setCombos(co.filter((c) => c.is_active));
      setCategories(cat);
      setSettings(sett);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleBook = (item: PublicCatalogItem | ComboWithItems) => {
    setSelectedService(item);
    setIsBookingOpen(true);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando servicios..."></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
          <Link href="/turnos">
            <Button variant="primary" size="sm">
              <Calendar className="w-4 h-4 mr-1.5" />
              Ver Calendario Completo
            </Button>
          </Link>
        </div>

        {/* 1. SECCIÓN INTRODUCTORIA PREVIA */}
        <section className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-zinc-900 dark:via-zinc-950 dark:to-emerald-950 text-zinc-900 dark:text-white rounded-3xl p-6 sm:p-12 border border-emerald-200/60 dark:border-zinc-800 shadow-sm dark:shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300/60 dark:border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Servicios Profesionales & Atención Personalizada
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-zinc-900 dark:text-white">
              Nuestros Servicios Profesionales
            </h1>

            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              En <strong>{settings?.business_name || 'nuestro espacio'}</strong>, cada turno es una experiencia personalizada. Ofrecemos la máxima calidad, calidez en el trato y los mejores estándares para cada uno de nuestros servicios.
            </p>
          </div>

          {/* Tarjetas de Pilares de Calidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-zinc-200/80 dark:border-white/10 space-y-1 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Técnica & Asesoramiento</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                Asesoramiento experto adaptado a tus necesidades específicas.
              </p>
            </div>

            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-zinc-200/80 dark:border-white/10 space-y-1 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Higiene & Bioseguridad</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                Herramientas esterilizadas, navajas descartables y toallas calientes individuales.
              </p>
            </div>

            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-zinc-200/80 dark:border-white/10 space-y-1 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-2">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Puntualidad Absoluta</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                Respetamos tu tiempo: agenda sincronizada con atención sin demoras.
              </p>
            </div>
          </div>
        </section>

        {/* 2. LISTADO DETALLADO DE SERVICIOS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Carta Completa de Servicios
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                Selecciona cualquier servicio para agendar tu fecha y hora en el calendario.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              {services.length} servicios disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const category = categories.find((c) => c.id === service.category_id);
              return (
                <div
                  key={service.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header del Servicio */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="purple" size="sm" className="mb-2 inline-flex items-center gap-1.5">
                          <CategoryIcon icon={category?.icon} className="w-3 h-3 shrink-0" />
                          <span>{category?.name || 'Servicio'}</span>
                        </Badge>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {service.name}
                        </h3>
                      </div>
                      {service.duration_minutes && (
                        <span className="text-xs font-semibold font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl shrink-0">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {service.duration_minutes} min
                        </span>
                      )}
                    </div>

                    {/* Descripción Detallada */}
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {service.description ||
                        'Incluye atención personalizada, productos específicos y asesoramiento estilístico adaptado.'}
                    </p>

                    {/* Qué incluye (Checklist) */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3.5 text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Diagnóstico capilar / asesoramiento de estilo previo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Lavado con shampoo especializado y acabado profesional</span>
                      </div>
                    </div>
                  </div>

                  {/* Precios y Botón de Turno */}
                  <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                        Inversión
                      </span>
                      <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                        ${service.price.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleBook(service)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Reservar Turno
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. COMBOS Y PAQUETES PROMOCIONALES */}
        {combos.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Combos y Packs de Ahorro
                </h3>
                <p className="text-xs text-zinc-500">
                  Combina corte, barba y tratamientos para acceder a tarifas bonificadas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.map((combo) => {
                const originalSum = combo.items.reduce(
                  (s, ci) => s + ci.item.price * ci.quantity,
                  0
                );
                return (
                  <div
                    key={combo.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-900/60 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="purple" size="sm">
                          {combo.discount_type === 'percentage'
                            ? `${combo.discount_value}% OFF`
                            : `$${combo.discount_value} OFF`}
                        </Badge>
                        <span className="text-[10px] font-bold text-purple-600 uppercase">
                          Pack Ahorro
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1">
                        {combo.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mb-4">{combo.description}</p>

                      <div className="bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl p-3 space-y-1 text-xs text-zinc-700 dark:text-zinc-300 mb-4">
                        <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 block mb-1">
                          Servicios incluidos:
                        </span>
                        {combo.items.map((ci) => (
                          <div key={ci.item.id} className="flex items-center gap-1.5">
                            <span className="text-purple-600 font-bold">•</span>
                            <span className="truncate">
                              {ci.item.name} {ci.quantity > 1 && `(x${ci.quantity})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-400 line-through font-mono block">
                          ${originalSum.toLocaleString('es-AR')}
                        </span>
                        <span className="text-xl font-bold font-mono text-purple-700 dark:text-purple-300">
                          ${combo.final_price.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleBook(combo)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Reservar Pack
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Modal para agendar turno */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialItem={selectedService}
          settings={settings}
        />
      </div>
    </PublicLayout>
  );
}
