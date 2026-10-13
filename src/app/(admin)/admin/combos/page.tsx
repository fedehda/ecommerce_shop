'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Percent,
  DollarSign,
  Tag,
  Check,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { ComboWithItems, Item, DiscountType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { calculateComboTotal } from '@/lib/calculations/pricing';

function buildComboPayload(
  editingCombo: ComboWithItems | null,
  name: string,
  description: string,
  discountType: DiscountType,
  discountValue: number,
  finalPrice: number,
  imageUrl: string,
  isActive: boolean,
  items: Array<{ item: Item; quantity: number }>
): ComboWithItems {
  const now = new Date().toISOString();
  return {
    id: editingCombo ? editingCombo.id : `combo-${Date.now()}`,
    name,
    description,
    discount_type: discountType,
    discount_value: discountValue,
    final_price: finalPrice,
    image_url: imageUrl,
    is_active: isActive,
    sort_order: 1,
    created_at: editingCombo?.created_at || now,
    updated_at: now,
    items,
  };
}

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<ComboWithItems[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboWithItems | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [selectedItemIds, setSelectedItemIds] = useState<{ [itemId: string]: number }>({});
  const [isActive, setIsActive] = useState(true);

  const loadData = async () => {
    const [c, it] = await Promise.all([
      DataRepository.getCombos(),
      DataRepository.getAdminItems(),
    ]);
    setCombos(c);
    setAvailableItems(it.filter((i) => i.is_active));
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      DataRepository.getCombos(),
      DataRepository.getAdminItems(),
    ]).then(([c, it]) => {
      if (!isMounted) return;
      setCombos(c);
      setAvailableItems(it.filter((i) => i.is_active));
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingCombo(null);
    setName('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setSelectedItemIds({});
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (combo: ComboWithItems) => {
    setEditingCombo(combo);
    setName(combo.name);
    setDescription(combo.description);
    setDiscountType(combo.discount_type);
    setDiscountValue(combo.discount_value);
    const itemMap: { [id: string]: number } = {};
    combo.items.forEach((ci) => {
      itemMap[ci.item.id] = ci.quantity;
    });
    setSelectedItemIds(itemMap);
    setIsActive(combo.is_active);
    setIsModalOpen(true);
  };

  const handleDeleteCombo = async (id: string) => {
    if (confirm('¿Deseas eliminar este combo?')) {
      await DataRepository.deleteCombo(id);
      await loadData();
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = 1;
      }
      return next;
    });
  };

  const updateItemQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItemIds((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      setSelectedItemIds((prev) => ({ ...prev, [itemId]: qty }));
    }
  };

  // Cálculo en vivo
  const selectedItemsList = Object.entries(selectedItemIds)
    .map(([itemId, qty]) => {
      const item = availableItems.find((i) => i.id === itemId);
      return item ? { item, quantity: qty, price: item.price } : null;
    })
    .filter(Boolean) as Array<{ item: Item; quantity: number; price: number }>;

  const calculation = calculateComboTotal(
    selectedItemsList.map((si) => ({ price: si.price, quantity: si.quantity })),
    discountType,
    discountValue
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (selectedItemsList.length === 0) {
      alert('Debes incluir al menos un producto o servicio en el combo.');
      return;
    }

    const comboToSave = buildComboPayload(
      editingCombo,
      name.trim(),
      description.trim(),
      discountType,
      discountValue,
      calculation.total,
      selectedItemsList[0]?.item.image_url || '',
      isActive,
      selectedItemsList.map((si) => ({
        item: si.item,
        quantity: si.quantity,
      }))
    );

    await DataRepository.saveCombo(comboToSave);
    setIsModalOpen(false);
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando combos..."></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Combos y Packs Promocionales
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Arma paquetes de productos o servicios con descuentos automáticos por porcentaje o monto fijo.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Crear Nuevo Combo
        </Button>
      </div>

      {/* Grid de Combos */}
      {combos.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
          <Layers className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">No hay combos configurados</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Combina servicios como corte + barba o productos para ofrecer descuentos atractivos.
          </p>
          <Button onClick={openCreateModal} variant="primary" size="sm" className="mt-4">
            Crear Primer Combo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => {
            const originalSubtotal = combo.items.reduce(
              (sum, i) => sum + i.item.price * i.quantity,
              0
            );
            const savings = originalSubtotal - combo.final_price;

            return (
              <div
                key={combo.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Badge variant="purple" size="sm" className="mb-2">
                        {combo.discount_type === 'percentage'
                          ? `${combo.discount_value}% OFF`
                          : `$${combo.discount_value} OFF`}
                      </Badge>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {combo.name}
                      </h3>
                    </div>
                    <Badge variant={combo.is_active ? 'emerald' : 'zinc'} size="sm">
                      {combo.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 mb-4">
                    {combo.description || 'Sin descripción'}
                  </p>

                  {/* Lista de Ítems Incluidos */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3 space-y-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Incluye:
                    </span>
                    {combo.items.map((ci) => (
                      <div
                        key={ci.item.id}
                        className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="truncate pr-2">
                          • {ci.item.name} {ci.quantity > 1 && `(x${ci.quantity})`}
                        </span>
                        <span className="text-zinc-400 font-mono shrink-0">
                          ${(ci.item.price * ci.quantity).toLocaleString('es-AR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precios y Botones */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-end justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 line-through block font-mono">
                      ${originalSubtotal.toLocaleString('es-AR')}
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ${combo.final_price.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                      Ahorro: ${savings.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(combo)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Editar combo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCombo(combo.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Eliminar combo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Crear/Editar Combo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCombo ? 'Editar Combo' : 'Crear Nuevo Combo'}
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nombre del Combo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Combo Total: Corte + Barba + Pomada"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explicación breve de la promoción..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Selector Múltiple de Ítems */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Seleccionar Productos o Servicios para el Combo *
            </label>
            <div className="max-h-52 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-2xl p-2 space-y-1 bg-zinc-50 dark:bg-zinc-800/40">
              {availableItems.map((item) => {
                const isSelected = !!selectedItemIds[item.id];
                const qty = selectedItemIds[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div
                      onClick={() => toggleItemSelection(item.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border text-white transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          ${item.price.toLocaleString('es-AR')} • {item.type}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400">Cant:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={qty}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-14 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-xs text-center font-bold"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuración de Descuento */}
          <div className="bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              Configurar Descuento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tipo de Descuento
                </label>
                <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-700 p-1">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                      discountType === 'percentage'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Porcentaje (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                      discountType === 'fixed'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Monto Fijo ($)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {discountType === 'percentage' ? 'Porcentaje de Rebaja (%)' : 'Monto de Descuento ($)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Resumen del Cálculo */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-400 block">Suma Original:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold line-through">
                  ${calculation.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Descuento:</span>
                <span className="font-mono text-rose-600 font-semibold">
                  -${calculation.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block font-bold">Precio Final Combo:</span>
                <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                  ${calculation.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingCombo ? 'Guardar Cambios' : 'Crear Combo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
