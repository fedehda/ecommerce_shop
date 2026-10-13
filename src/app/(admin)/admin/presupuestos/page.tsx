'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  Send,
  User,
  Phone,
  Tag,
  MessageCircle,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { Item, AppSettings, QuoteItem } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  formatQuoteMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp/message-builder';

export default function AdminPresupuestosPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Quote State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('Presupuesto válido por 15 días. Sujeto a disponibilidad de turnos.');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [it, sett] = await Promise.all([
        DataRepository.getAdminItems(),
        DataRepository.getSettings(),
      ]);
      setItems(it.filter((i) => i.is_active));
      setSettings(sett);
      setLoading(false);
    }
    loadData();
  }, []);

  const addItemToQuote = (item: Item) => {
    setQuoteItems((prev) => {
      const existing = prev.find((qi) => qi.name === item.name);
      if (existing) {
        return prev.map((qi) =>
          qi.name === item.name
            ? { ...qi, quantity: qi.quantity + 1, subtotal: (qi.quantity + 1) * qi.unitPrice }
            : qi
        );
      } else {
        return [
          ...prev,
          {
            name: item.name,
            quantity: 1,
            unitPrice: item.price,
            subtotal: item.price,
          },
        ];
      }
    });
  };

  const updateQuantity = (name: string, delta: number) => {
    setQuoteItems((prev) =>
      prev
        .map((qi) => {
          if (qi.name === name) {
            const newQty = qi.quantity + delta;
            return newQty > 0
              ? { ...qi, quantity: newQty, subtotal: newQty * qi.unitPrice }
              : null;
          }
          return qi;
        })
        .filter(Boolean) as QuoteItem[]
    );
  };

  const removeItem = (name: string) => {
    setQuoteItems((prev) => prev.filter((qi) => qi.name !== name));
  };

  // Estado de edición manual del mensaje
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [manualMessage, setManualMessage] = useState('');

  // Cálculos
  const subtotal = quoteItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const total = Math.max(0, subtotal - (discountAmount || 0));

  // Generar Mensaje de WhatsApp
  const formattedMessage = formatQuoteMessage({
    customerName: customerName || 'Estimado/a cliente',
    businessName: settings?.business_name || 'Nuestro Negocio',
    items: quoteItems,
    discountAmount: discountAmount > 0 ? discountAmount : undefined,
    total,
    notes,
    currencySymbol: settings?.currency_symbol || '$',
    template: settings?.whatsapp_quote_template || undefined,
  });

  const effectiveMessage = isManualEdit ? manualMessage : formattedMessage;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(effectiveMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleSendWhatsApp = () => {
    const targetPhone = customerPhone || settings?.whatsapp_phone || '';
    if (!targetPhone) {
      alert('Por favor, ingresa el número telefónico del cliente.');
      return;
    }
    const url = buildWhatsAppUrl(targetPhone, effectiveMessage);
    window.open(url, '_blank');
  };

  const filteredCatalog = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" role="status" aria-label="Cargando cotizador..."></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-emerald-600" />
          Generador de Presupuestos WhatsApp
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Selecciona productos o servicios, añade descuentos y genera una cotización profesional lista para enviar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Armado del Presupuesto (7 columnas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Datos del Cliente */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Marcos Alvarez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Teléfono WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Ej: 11 2345 6789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carrito de Cotización */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Ítems Cotizados ({quoteItems.length})
              </h3>
              {quoteItems.length > 0 && (
                <button
                  onClick={() => setQuoteItems([])}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Vaciar lista
                </button>
              )}
            </div>

            {quoteItems.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                Elige ítems del catálogo inferior para añadirlos a la cotización.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {quoteItems.map((qi) => (
                  <div key={qi.name} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex-1 pr-3">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                        {qi.name}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        ${qi.unitPrice.toLocaleString('es-AR')} c/u
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(qi.name, -1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{qi.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(qi.name, 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 w-20 text-right">
                        ${qi.subtotal.toLocaleString('es-AR')}
                      </span>

                      <button
                        onClick={() => removeItem(qi.name)}
                        className="p-1 text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ajustes de Descuento y Notas */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Descuento Especial ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-32 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-sm text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Notas / Observaciones del presupuesto
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Totales */}
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block">Subtotal: ${subtotal.toLocaleString('es-AR')}</span>
                  {discountAmount > 0 && (
                    <span className="text-xs text-rose-600 block">
                      Descuento: -${discountAmount.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Total a Presupuestar
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Catálogo de Ítems Rápido */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Agregar Ítems del Catálogo
              </h3>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar ítem..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCatalog.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItemToQuote(item)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    +${item.price.toLocaleString('es-AR')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Previsualización de WhatsApp (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  {isManualEdit ? 'Edición Manual' : 'Previsualización WhatsApp'}
                </span>

                <div className="flex items-center gap-1.5">
                  {isManualEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualMessage(formattedMessage);
                        setIsManualEdit(false);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Restaurar al cálculo automático"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isManualEdit) setManualMessage(formattedMessage);
                      setIsManualEdit(!isManualEdit);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      isManualEdit
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    {isManualEdit ? 'Vista Previa' : 'Editar Texto'}
                  </button>
                </div>
              </div>

              {/* Mensaje con estilo WhatsApp o Textarea */}
              {isManualEdit ? (
                <div className="space-y-1.5">
                  <textarea
                    rows={14}
                    value={manualMessage}
                    onChange={(e) => setManualMessage(e.target.value)}
                    placeholder="Edita o añade texto personalizado antes de enviar..."
                    className="w-full bg-[#efeae2] dark:bg-zinc-950 p-4 rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-inner"
                  />
                  <span className="text-[10px] text-zinc-400 block text-right">
                    Los cambios se enviarán tal como los redactes.
                  </span>
                </div>
              ) : (
                <div className="bg-[#efeae2] dark:bg-zinc-950 p-4 rounded-2xl font-sans text-xs text-zinc-900 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed border border-zinc-200 dark:border-zinc-800 shadow-inner max-h-[420px] overflow-y-auto font-mono">
                  {effectiveMessage}
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <Button
                type="button"
                onClick={handleSendWhatsApp}
                variant="primary"
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white"
                disabled={quoteItems.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar por WhatsApp
              </Button>

              <Button
                type="button"
                onClick={handleCopyText}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-600" />
                    ¡Copiado al Portapapeles!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Texto Completo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
