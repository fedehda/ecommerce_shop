'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
  AlertTriangle,
  Package,
  Wand2,
} from 'lucide-react';
import { DataRepository, RUBRO_PRESETS, RubroPreset } from '@/lib/data/repository';
import { Category, Item } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from '@/components/CategoryIcon';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminCategoriasPage() {
  const { themes, theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal ABM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('tag');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [isSlugAuto, setIsSlugAuto] = useState(true);

  // Confirmación de Eliminación
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteStats, setDeleteStats] = useState<{ linkedItems: number }>({ linkedItems: 0 });

  // Preset Confirm Modal
  const [presetToApply, setPresetToApply] = useState<RubroPreset | null>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    const [cat, it] = await Promise.all([
      DataRepository.getCategories(),
      DataRepository.getAdminItems(),
    ]);
    setCategories(cat);
    setItems(it);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      DataRepository.getCategories(),
      DataRepository.getAdminItems(),
    ]).then(([cat, it]) => {
      if (!isMounted) return;
      setCategories(cat);
      setItems(it);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormIcon('tag');
    setFormSortOrder(categories.length + 1);
    setIsSlugAuto(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIcon(cat.icon || 'tag');
    setFormSortOrder(cat.sort_order);
    setIsSlugAuto(false);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (isSlugAuto) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormSlug(generated);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    await DataRepository.saveCategory({
      ...(editingCategory?.id ? { id: editingCategory.id } : {}),
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      icon: formIcon,
      sort_order: formSortOrder,
    });
    setSaving(false);
    setIsModalOpen(false);
    await loadData();
    showNotification(
      editingCategory?.id
        ? '¡Categoría actualizada exitosamente!'
        : '¡Nueva categoría creada exitosamente!'
    );
  };

  const requestDeleteCategory = (cat: Category) => {
    const linked = items.filter((i) => i.category_id === cat.id).length;
    setDeleteStats({ linkedItems: linked });
    setDeletingCategory(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setSaving(true);
    const result = await DataRepository.deleteCategory(deletingCategory.id);
    setSaving(false);
    setDeletingCategory(null);
    await loadData();
    showNotification(
      result.unlinkedItems > 0
        ? `Categoría eliminada. ${result.unlinkedItems} producto(s)/servicio(s) quedaron sin categoría asignada.`
        : 'Categoría eliminada exitosamente.'
    );
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    setCategories(newCategories);
    const orderedIds = newCategories.map((c) => c.id);
    await DataRepository.reorderCategories(orderedIds);
    await loadData();
  };

  const handleApplyPreset = async () => {
    if (!presetToApply) return;
    setSaving(true);
    await DataRepository.applyCategoryPreset(presetToApply.key);
    setSaving(false);
    setPresetToApply(null);
    await loadData();
    showNotification(
      `¡Categorías para el rubro "${presetToApply.name}" aplicadas correctamente!`
    );
  };

  const activeThemeOption = themes.find((t) => t.id === theme) || themes[0];
  const uncategorizedItemsCount = items.filter((i) => !i.category_id).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-emerald-600" />
            Gestión de Categorías
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Personaliza las secciones de tu catálogo para adaptarlo a cualquier rubro o industria (Estética, Taller, Gastronomía, Salud, etc.).
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Categoría
        </Button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Stats de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Categorías Activas
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
            {categories.length}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Total Ítems en Catálogo
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
            {items.length}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Ítems Sin Categoría
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
            {uncategorizedItemsCount}
          </span>
        </div>
      </div>

      {/* ASISTENTE DE PLANTILLAS RÁPIDAS POR RUBRO */}
      <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 rounded-3xl border border-emerald-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Plantillas Rápidas por Rubro (1 Clic)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              ¿Tu negocio es de otro rubro? Haz clic en una plantilla para reemplazar o inicializar las categorías adecuadas al instante:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {RUBRO_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setPresetToApply(preset)}
              className="p-3 bg-white dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl text-left transition-all group flex flex-col justify-between cursor-pointer shadow-2xs"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CategoryIcon icon={preset.icon} className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {preset.name}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">
                  {preset.description}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 block">
                Aplicar Plantilla →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE CATEGORÍAS */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Categorías Configura­das ({categories.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Utiliza las flechas para ordenar qué categoría aparece primero en el menú y catálogo.
            </p>
          </div>
          <Link href="/admin/items">
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4 mr-1.5" />
              Ver Productos & Servicios
            </Button>
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <FolderTree className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Aún no tienes categorías creadas
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Crea tu primera categoría personalizada o selecciona una de las plantillas por rubro de arriba.
            </p>
            <Button onClick={openCreateModal} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Crear Categoría
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {categories.map((cat, index) => {
              const linkedCount = items.filter((i) => i.category_id === cat.id).length;
              const isFirst = index === 0;
              const isLast = index === categories.length - 1;

              return (
                <div
                  key={cat.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Botones de Reordenar */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={isFirst}
                        className={`p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
                          isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Subir orden"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={isLast}
                        className={`p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
                          isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Bajar orden"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Icono de Categoría */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: activeThemeOption.lightColor,
                        color: activeThemeOption.primaryColor,
                      }}
                    >
                      <CategoryIcon icon={cat.icon} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                          {cat.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          /{cat.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span>Orden: #{cat.sort_order}</span>
                        <span>•</span>
                        <span className={linkedCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-400'}>
                          {linkedCount} ítem(s) asignado(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(cat)}
                      className="text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                    <button
                      type="button"
                      onClick={() => requestDeleteCategory(cat)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory?.id ? 'Editar Categoría' : 'Nueva Categoría'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCategory} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Tratamientos Faciales, Service Automotor, Pizzas y Pastas..."
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Slug (Identificador en URL) *
              </label>
              <button
                type="button"
                onClick={() => setIsSlugAuto(!isSlugAuto)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isSlugAuto ? 'Editar manualmente' : 'Generar automáticamente'}
              </button>
            </div>
            <div className="flex items-center">
              <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 rounded-l-xl text-xs font-mono text-zinc-400 border border-r-0 border-zinc-200 dark:border-zinc-700">
                /
              </span>
              <input
                type="text"
                required
                value={formSlug}
                readOnly={isSlugAuto}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="slug-de-categoria"
                className={`w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-r-xl px-3.5 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden ${
                  isSlugAuto ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          {/* Selector de Iconos */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Icono Representativo (Elige uno)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              {AVAILABLE_CATEGORY_ICONS.map((iconOpt) => {
                const isSelected = formIcon === iconOpt.id;
                const IconComponent = iconOpt.icon;
                return (
                  <button
                    key={iconOpt.id}
                    type="button"
                    onClick={() => setFormIcon(iconOpt.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[9px] truncate w-full text-center">
                      {iconOpt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Orden de Visualización
            </label>
            <input
              type="number"
              min={1}
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 1)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingCategory?.id ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="¿Eliminar Categoría?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-800 dark:text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">Esta acción no se puede deshacer.</p>
              {deleteStats.linkedItems > 0 && (
                <p className="mt-0.5">
                  Hay <strong>{deleteStats.linkedItems} ítem(s)</strong> vinculados a esta categoría. Al eliminarla, quedarán sin categoría asignada para preservar tus datos.
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ¿Confirmas la eliminación de la categoría <strong>&quot;{deletingCategory?.name}&quot;</strong>?
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeleteCategory} isLoading={saving}>
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL CONFIRMAR PLANTILLA DE RUBRO */}
      <Modal
        isOpen={Boolean(presetToApply)}
        onClose={() => setPresetToApply(null)}
        title="Aplicar Plantilla de Rubro"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
            <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {presetToApply?.name}
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {presetToApply?.description}
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200 block mb-1">
                Categorías que se incorporarán:
              </span>
              <ul className="text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                {presetToApply?.categories.map((c) => (
                  <li key={c.slug} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c.name} (/{c.slug})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Esta plantilla añadirá o actualizará las categorías principales recomendadas para este tipo de negocio. Tus productos y servicios existentes no se perderán.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <Button variant="outline" onClick={() => setPresetToApply(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleApplyPreset} isLoading={saving}>
              Confirmar & Aplicar Plantilla
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
