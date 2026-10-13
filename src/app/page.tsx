'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicLayout from '@/app/(public)/layout';
import {
  Scissors,
  ShoppingBag,
  Layers,
  Clock,
  Sparkles,
  Calendar,
  MessageCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import {
  PublicCatalogItem,
  Category,
  ComboWithItems,
  AppSettings,
} from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookingModal } from '@/components/public/BookingModal';
import { buildWhatsAppUrl, formatProductMessage } from '@/lib/whatsapp/message-builder';

export default function HomePage() {
  const [items, setItems] = useState<PublicCatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [combos, setCombos] = useState<ComboWithItems[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal de Turno
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingItem, setBookingItem] = useState<PublicCatalogItem | ComboWithItems | null>(null);

  useEffect(() => {
    async function loadData() {
      const [it, cat, co, sett] = await Promise.all([
        DataRepository.getPublicCatalogItems(),
        DataRepository.getCategories(),
        DataRepository.getCombos(),
        DataRepository.getSettings(),
      ]);
      setItems(it);
      setCategories(cat);
      setCombos(co.filter((c) => c.is_active));
      setSettings(sett);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleOpenBooking = (item: PublicCatalogItem | ComboWithItems) => {
    setBookingItem(item);
    setIsBookingOpen(true);
  };

  const handleOrderProduct = (product: PublicCatalogItem) => {
    const phone = settings?.whatsapp_phone || '5491123456789';
    const message = formatProductMessage({
      businessName: settings?.business_name,
      productName: product.name,
      price: product.price,
      currencySymbol: settings?.currency_symbol || '$',
      template: settings?.whatsapp_product_template || undefined,
    });
    const url = buildWhatsAppUrl(phone, message);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando catálogo..."></div>
        </div>
      </PublicLayout>
    );
  }

  const services = items.filter((i) => i.type === 'service');
  const products = items.filter((i) => i.type === 'product');

  return (
    <PublicLayout>
      <div className="space-y-16 pb-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black text-zinc-900 dark:text-white py-14 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/80">
          <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-500/10 border border-emerald-300/60 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Catálogo Oficial & Turnos en Línea
            </div>

            <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight text-zinc-900 dark:text-white">
              {settings?.business_name || 'Studio & Barbería Style'}
            </h1>

            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {settings?.business_description ||
                'Reserva tu turno fácilmente sin esperas o adquiere nuestros productos de cuidado capilar directamente por WhatsApp.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link href="/turnos">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 font-bold"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar Turno Ahora
                </Button>
              </Link>
              <Link href="/productos">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white/80 dark:bg-transparent"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ver Productos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CONTAINER PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ========================================================================= */}
          {/* SECCIÓN 1: SERVICIOS */}
          {/* ========================================================================= */}
          <section id="servicios" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Scissors className="w-4 h-4" />
                  Atención en Salón
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  Nuestros Servicios
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                  Cortes personalizados, perfilado de barba a navaja y tratamientos intensivos.
                </p>
              </div>

              <Link
                href="/servicios"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                Conocer todos los servicios
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const category = categories.find((c) => c.id === service.category_id);
                return (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="emerald" size="sm">
                          {category?.name || 'Servicio'}
                        </Badge>
                        {service.duration_minutes && (
                          <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {service.duration_minutes} min
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1.5">
                        {service.name}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                        {service.description || 'Atención detallada con técnicas de vanguardia.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                          Precio
                        </span>
                        <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                          ${service.price.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenBooking(service)}
                      >
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Reservar Turno
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* DIVIDER ELEGANTE Y COMBOS PROMOCIONALES */}
          {/* ========================================================================= */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-50 dark:bg-zinc-950 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Packs Especiales & Descuentos
              </span>
            </div>
          </div>

          {/* COMBOS DESTACADOS */}
          {combos.length > 0 && (
            <section className="bg-gradient-to-br from-purple-50/80 via-white to-fuchsia-50/40 dark:from-purple-950/20 dark:via-zinc-900/60 dark:to-zinc-900/80 rounded-3xl p-6 sm:p-8 border border-purple-200/80 dark:border-purple-900/30 shadow-xs dark:shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Combos con Descuento Exclusivo
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Aprovecha combos combinados para maximizar tu ahorro en cada visita.
                  </p>
                </div>
                <Badge variant="purple" size="md">
                  Tarifas Bonificadas
                </Badge>
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
                      className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-900/60 shadow-xs flex flex-col justify-between"
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
                        <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{combo.description}</p>

                        <div className="bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl p-3 space-y-1 text-xs text-zinc-700 dark:text-zinc-300 mb-4">
                          <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 block mb-1">
                            Incluye:
                          </span>
                          {combo.items.map((ci) => (
                            <div key={ci.item.id} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
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
                          onClick={() => handleOpenBooking(combo)}
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

          {/* DIVIDER ENTRE COMBOS Y PRODUCTOS */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-50 dark:bg-zinc-950 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Línea de Productos para Llevar
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: PRODUCTOS */}
          {/* ========================================================================= */}
          <section id="productos" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  Para Mantener tu Estilo en Casa
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  Productos de Cuidado
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                  Pomadas modeladoras, aceites nutritivos y lociones seleccionadas por barberos.
                </p>
              </div>

              <Link
                href="/productos"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
              >
                Ver catálogo completo de productos
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const category = categories.find((c) => c.id === product.category_id);
                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Imagen */}
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800 relative">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 bg-zinc-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          En Stock
                        </span>
                      </div>

                      <Badge variant="blue" size="sm" className="mb-2">
                        {category?.name || 'Producto'}
                      </Badge>

                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                        {product.description || 'Fijación duradera y acabado natural.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                          Precio
                        </span>
                        <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleOrderProduct(product)}
                        className="bg-[#25D366] hover:bg-[#1ebd5a] text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        Pedir por WhatsApp
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Modal de Reserva de Turnos */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialItem={bookingItem}
          settings={settings}
        />
      </div>
    </PublicLayout>
  );
}
