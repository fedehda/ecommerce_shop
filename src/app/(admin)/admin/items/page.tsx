'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  ShoppingBag,
  Clock,
  FolderTree,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { Item, Category, ItemType, PricingMode } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PricingCalculator } from '@/components/admin/PricingCalculator';

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal ABM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formType, setFormType] = useState<ItemType>('service');
  const [formCost, setFormCost] = useState<number>(0);
  const [formMode, setFormMode] = useState<PricingMode>('markup');
  const [formMarkup, setFormMarkup] = useState<number>(100);
  const [formMargin, setFormMargin] = useState<number>(50);
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDuration, setFormDuration] = useState<number | null>(30);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const loadData = async () => {
    const [it, cat] = await Promise.all([
      DataRepository.getAdminItems(),
      DataRepository.getCategories(),
    ]);
    setItems(it);
    setCategories(cat);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      DataRepository.getAdminItems(),
      DataRepository.getCategories(),
    ]).then(([it, cat]) => {
      if (!isMounted) return;
      setItems(it);
      setCategories(cat);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setFormCategoryId(categories[0]?.id || '');
    setFormType('service');
    setFormCost(3000);
    setFormMode('markup');
    setFormMarkup(100);
    setFormMargin(50);
    setFormPrice(6000);
    setFormImageUrl('');
    setFormDuration(30);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormCategoryId(item.category_id || '');
    setFormType(item.type);
    setFormCost(item.cost);
    setFormMode(item.pricing_mode);
    setFormMarkup(item.markup_percentage);
    setFormMargin(item.margin_percentage);
    setFormPrice(item.price);
    setFormImageUrl(item.image_url);
    setFormDuration(item.duration_minutes);
    setFormIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ítem?')) {
      await DataRepository.deleteItem(id);
      await loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    await DataRepository.saveItem({
      ...(editingItem?.id ? { id: editingItem.id } : {}),
      name: formName.trim(),
      description: formDescription.trim(),
      category_id: formCategoryId || null,
      type: formType,
      cost: formCost,
      pricing_mode: formMode,
      markup_percentage: formMarkup,
      margin_percentage: formMargin,
      price: formPrice,
      image_url: formImageUrl.trim(),
      duration_minutes: formType === 'service' ? formDuration : null,
      is_active: formIsActive,
    });

    setIsModalOpen(false);
    await loadData();
  };

  // Filtrado de items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory =
      categoryFilter === 'all' || item.category_id === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando catálogo..."></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Top Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Catálogo & Gestión de Ítems
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Control de productos, servicios, costos base y fijación de precios por Markup o Margen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/categorias"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0"
          >
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Gestionar</span> Categorías
          </Link>
          <Button onClick={openCreateModal} variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Ítem
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | ItemType)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="service">Solo Servicios</option>
            <option value="product">Solo Productos</option>
          </select>

          {/* Categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table / Responsive Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Ítem / Tipo</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Costo Base</th>
                <th className="py-3.5 px-4">Fijación</th>
                <th className="py-3.5 px-4">Precio Público</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No se encontraron ítems con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const category = categories.find((c) => c.id === item.category_id);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Nombre y Tipo */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              item.type === 'service'
                                ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                            }`}
                          >
                            {item.type === 'service' ? (
                              <Sparkles className="w-4 h-4" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                              <span className="capitalize">{item.type === 'service' ? 'Servicio' : 'Producto'}</span>
                              {item.duration_minutes && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.duration_minutes} min
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
                        {category?.name || 'Sin categoría'}
                      </td>

                      {/* Costo */}
                      <td className="py-4 px-4 font-mono font-medium text-zinc-500">
                        ${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Modo y Porcentajes */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              item.pricing_mode === 'markup'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {item.pricing_mode === 'markup' ? 'Markup' : 'Margen'}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            Mkp: {item.markup_percentage.toFixed(0)}% • Mg: {item.margin_percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Precio Público */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-50 font-mono">
                          ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4 text-center">
                        <Badge variant={item.is_active ? 'emerald' : 'zinc'} size="sm">
                          {item.is_active ? 'Activo' : 'Pausado'}
                        </Badge>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            aria-label={`Editar ${item.name}`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Editar ítem"
                          >
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            aria-label={`Eliminar ${item.name}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ABM de Ítem con Calculadora Financiera */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Ítem del Catálogo' : 'Crear Nuevo Ítem'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Nombre y Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nombre del Producto o Servicio *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Corte Clásico de Cabello"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tipo de Ítem
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ItemType)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="service">Servicio (Turnos)</option>
                <option value="product">Producto Físico</option>
              </select>
            </div>
          </div>

          {/* Categoría y Duración (si es servicio) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Categoría
                </label>
                <Link
                  href="/admin/categorias"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Gestionar ↗
                </Link>
              </div>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Sin Categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {formType === 'service' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Duración Estimada (Minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formDuration || ''}
                  onChange={(e) => setFormDuration(parseInt(e.target.value) || null)}
                  placeholder="30"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Descripción detallada
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Detalla qué incluye el corte, materiales o características..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* CALCULADORA FINANCIERA INTERACTIVA (MARKUP VS MARGEN) */}
          <PricingCalculator
            cost={formCost}
            mode={formMode}
            markupPercentage={formMarkup}
            marginPercentage={formMargin}
            price={formPrice}
            onCostChange={setFormCost}
            onModeChange={setFormMode}
            onMarkupChange={setFormMarkup}
            onMarginChange={setFormMargin}
            onPriceChange={setFormPrice}
          />

          {/* Activo / Visibilidad */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-zinc-300"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Visible en el catálogo público y habilitado para presupuestos
            </label>
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingItem ? 'Guardar Cambios' : 'Crear Ítem'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
