'use client';

import React, { useState, useEffect } from 'react';
import PublicLayout from '@/app/(public)/layout';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  ArrowLeft,
  MessageCircle,
  ArrowUpDown,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { PublicCatalogItem, Category, AppSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/CategoryIcon';
import { buildWhatsAppUrl, formatProductMessage } from '@/lib/whatsapp/message-builder';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export default function ProductosPage() {
  const [products, setProducts] = useState<PublicCatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros y Búsqueda
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    async function loadData() {
      const [it, cat, sett] = await Promise.all([
        DataRepository.getPublicCatalogItems(),
        DataRepository.getCategories(),
        DataRepository.getSettings(),
      ]);
      const onlyProducts = it.filter((i) => i.type === 'product');
      setProducts(onlyProducts);
      setCategories(cat);
      setSettings(sett);
      setLoading(false);
    }
    loadData();
  }, []);

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

  // Filtrado y Ordenamiento
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.sort_order - b.sort_order;
    });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
          <span className="text-xs text-zinc-400">
            {filteredProducts.length} productos disponibles
          </span>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50/60 dark:from-blue-950 dark:via-zinc-900 dark:to-zinc-950 rounded-3xl p-6 sm:p-10 text-zinc-900 dark:text-white border border-blue-200/60 dark:border-zinc-800 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-transparent">
              <ShoppingBag className="w-3.5 h-3.5" />
              Tienda Oficial & Productos Premium
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Catálogo de Productos para el Cuidado
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Pomadas modeladoras, bálsamos artesanales, ceras mate y aceites de hidratación capilar. Realiza tu pedido directo por WhatsApp con atención inmediata.
            </p>
          </div>

          <div className="shrink-0 bg-white dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-blue-200/60 dark:border-white/10 text-center shadow-2xs">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-semibold">
              Envíos y Retiros
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Coordinación Inmediata
            </span>
            <span className="text-[10px] text-zinc-400 block mt-1">Vía WhatsApp Oficial</span>
          </div>
        </div>

        {/* Barra de Búsqueda, Filtros y Orden */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar pomadas, aceites, ceras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Categorías (Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            <button
              type="button"
              aria-pressed={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={selectedCategory === c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <CategoryIcon icon={c.icon} className="w-3.5 h-3.5 shrink-0" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <select
              aria-label="Ordenar productos por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Grid de Productos */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200">No se encontraron productos</h3>
            <p className="text-xs text-zinc-500 mt-1">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const category = categories.find((c) => c.id === product.category_id);
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagen con badge */}
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800 relative">
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
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                      )}
                      <span className="absolute top-2.5 right-2.5 bg-zinc-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Disponible
                      </span>
                    </div>

                    <Badge variant="blue" size="sm" className="mb-2 inline-flex items-center gap-1.5">
                      <CategoryIcon icon={category?.icon} className="w-3 h-3 shrink-0" />
                      <span>{category?.name || 'General'}</span>
                    </Badge>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1 leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-3 mb-4 leading-relaxed">
                      {product.description || 'Producto de alta fijación y calidad profesional.'}
                    </p>
                  </div>

                  {/* Precios y Botón WhatsApp */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
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
                      className="bg-[#25D366] hover:bg-[#1ebd5a] text-white shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      Pedir por WhatsApp
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Banner Inferior: ¿Necesitas un corte o turno? */}
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              ¿Quieres combinar tu producto con un servicio o corte?
            </h4>
            <p className="text-xs text-zinc-500">
              Conoce todos nuestros tratamientos capilares y reserva tu turno sin esperas.
            </p>
          </div>
          <Link href="/servicios">
            <Button variant="outline" size="md">
              Ver Servicios & Turnos
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
