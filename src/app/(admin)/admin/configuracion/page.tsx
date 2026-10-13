'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  Check,
  Phone,
  Building,
  DollarSign,
  MapPin,
  MessageCircle,
  RotateCcw,
  ExternalLink,
  Calendar,
  ShoppingBag,
  FileText,
  Palette,
} from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { AppSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  sanitizePhone,
  DEFAULT_APPOINTMENT_TEMPLATE,
  DEFAULT_PRODUCT_TEMPLATE,
  DEFAULT_QUOTE_TEMPLATE,
  interpolateTemplate,
  buildWhatsAppUrl,
} from '@/lib/whatsapp/message-builder';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AdminConfiguracionPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('¡Configuración guardada correctamente!');

  // Pestaña Principal
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp'>('general');

  // Form Fields - Datos Generales
  const [businessName, setBusinessName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [address, setAddress] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [description, setDescription] = useState('');

  // Form Fields - Plantillas WhatsApp
  const [appointmentTemplate, setAppointmentTemplate] = useState(DEFAULT_APPOINTMENT_TEMPLATE);
  const [productTemplate, setProductTemplate] = useState(DEFAULT_PRODUCT_TEMPLATE);
  const [quoteTemplate, setQuoteTemplate] = useState(DEFAULT_QUOTE_TEMPLATE);
  const [activeMessageSubTab, setActiveMessageSubTab] = useState<'appointment' | 'product' | 'quote'>('appointment');

  useEffect(() => {
    DataRepository.getSettings().then((s) => {
      setSettings(s);
      setBusinessName(s.business_name);
      setWhatsappPhone(s.whatsapp_phone);
      setCurrencySymbol(s.currency_symbol);
      setAddress(s.address);
      setInstagramUrl(s.instagram_url);
      setDescription(s.business_description);
      setAppointmentTemplate(s.whatsapp_appointment_template || DEFAULT_APPOINTMENT_TEMPLATE);
      setProductTemplate(s.whatsapp_product_template || DEFAULT_PRODUCT_TEMPLATE);
      setQuoteTemplate(s.whatsapp_quote_template || DEFAULT_QUOTE_TEMPLATE);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    const cleanedPhone = sanitizePhone(whatsappPhone);

    const updated = await DataRepository.updateSettings({
      business_name: businessName.trim(),
      whatsapp_phone: cleanedPhone,
      currency_symbol: currencySymbol.trim(),
      address: address.trim(),
      instagram_url: instagramUrl.trim(),
      business_description: description.trim(),
      whatsapp_appointment_template: appointmentTemplate.trim(),
      whatsapp_product_template: productTemplate.trim(),
      whatsapp_quote_template: quoteTemplate.trim(),
    });

    setSettings(updated);
    setWhatsappPhone(cleanedPhone);
    setSuccessMessage(activeTab === 'whatsapp' ? '¡Plantillas de WhatsApp guardadas con éxito!' : '¡Configuración comercial guardada correctamente!');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Inserción de variables en la plantilla activa
  const handleInsertTag = (tag: string) => {
    if (activeMessageSubTab === 'appointment') {
      setAppointmentTemplate((prev) => `${prev} {${tag}}`);
    } else if (activeMessageSubTab === 'product') {
      setProductTemplate((prev) => `${prev} {${tag}}`);
    } else {
      setQuoteTemplate((prev) => `${prev} {${tag}}`);
    }
  };

  // Previsualizaciones con datos de muestra
  const previewAppointmentText = interpolateTemplate(appointmentTemplate, {
    negocio: businessName || 'Mi Negocio',
    cliente: 'Ignacio Morales',
    telefono: '11 4455-6677',
    servicio: 'Corte & Estilo Personalizado',
    fecha: '24/10/2026',
    hora: '17:30',
    notas: 'Primera visita, llegar 5 min antes',
    notas_linea: '📝 *Notas:* _Primera visita, llegar 5 min antes_\n',
  });

  const previewProductText = interpolateTemplate(productTemplate, {
    negocio: businessName || 'Mi Negocio',
    producto: 'Pomada Fijadora Mate 100g',
    precio: '9.000',
    moneda: currencySymbol || '$',
  });

  const previewQuoteText = interpolateTemplate(quoteTemplate, {
    negocio: businessName || 'Mi Negocio',
    cliente: 'Camila Rossi',
    items: `1. *Servicio Integral* (x1)\n   Precio: ${currencySymbol}12.000\n   Subtotal: *${currencySymbol}12.000*\n2. *Producto Cuidado Diario* (x2)\n   Precio: ${currencySymbol}4.500\n   Subtotal: *${currencySymbol}9.000*`,
    descuento_linea: `🎟️ *Descuento Aplicado:* -${currencySymbol}2.000\n`,
    descuento: '2.000',
    total: '19.000,00',
    moneda: currencySymbol || '$',
    notas_linea: '\n📝 *Observaciones:* _Entrega inmediata en sucursal_\n',
    notas: 'Entrega inmediata en sucursal',
  });

  const currentPreviewText =
    activeMessageSubTab === 'appointment'
      ? previewAppointmentText
      : activeMessageSubTab === 'product'
      ? previewProductText
      : previewQuoteText;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Configuración del Negocio & Mensajes
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Ajusta los datos comerciales, número de contacto y personaliza los textos que se envían por WhatsApp para turnos, productos y presupuestos.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs de Navegación */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Datos del Negocio
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          Mensajes de WhatsApp
        </button>
      </div>

      {/* TAB 1: DATOS DEL NEGOCIO */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          {/* Nombre del Negocio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-zinc-400" />
              Nombre Comercial del Negocio *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Teléfono WhatsApp y Moneda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-zinc-400" />
                Teléfono WhatsApp Receptor *
              </label>
              <input
                type="text"
                required
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="5491123456789"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Incluye código de país sin signos (ej: 54911...).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-zinc-400" />
                Símbolo de Moneda
              </label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="$"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Dirección y Redes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                Dirección del Local
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Corrientes 1234, CABA"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <InstagramIcon className="w-4 h-4 text-zinc-400" />
                Enlace de Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/tunegocio"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Descripción o Bio del Negocio
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve reseña sobre tus especialidades y servicios..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Banner de acceso a Logo y Paletas */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  ¿Deseas personalizar el Logo, Icono o Colores?
                </span>
                <span className="text-xs text-zinc-500">
                  Elige tu logotipo con imagen, iconos de rubro y temas claros/oscuros.
                </span>
              </div>
            </div>
            <Link
              href="/admin/personalizacion"
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-xl transition-colors shrink-0"
            >
              Ir a Personalización ↗
            </Link>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: MENSAJES DE WHATSAPP */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Sub-tabs de Tipo de Mensaje */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActiveMessageSubTab('appointment')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeMessageSubTab === 'appointment'
                  ? 'border-emerald-600 bg-white dark:bg-zinc-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Reserva de Turnos
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-snug">
                Enviado por clientes al agendar un servicio o combo.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveMessageSubTab('product')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeMessageSubTab === 'product'
                  ? 'border-emerald-600 bg-white dark:bg-zinc-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Pedidos de Productos
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-snug">
                Enviado por clientes al consultar o encargar un producto.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveMessageSubTab('quote')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeMessageSubTab === 'quote'
                  ? 'border-emerald-600 bg-white dark:bg-zinc-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Presupuestos Rápidos
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-snug">
                Enviado desde el panel admin con cotizaciones a medida.
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor de la Plantilla */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {activeMessageSubTab === 'appointment'
                      ? 'Plantilla: Solicitud de Turno'
                      : activeMessageSubTab === 'product'
                      ? 'Plantilla: Pedido de Producto'
                      : 'Plantilla: Presupuesto Detallado'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Usa negritas con `*texto*` y cursivas con `_texto_`.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (activeMessageSubTab === 'appointment') setAppointmentTemplate(DEFAULT_APPOINTMENT_TEMPLATE);
                    if (activeMessageSubTab === 'product') setProductTemplate(DEFAULT_PRODUCT_TEMPLATE);
                    if (activeMessageSubTab === 'quote') setQuoteTemplate(DEFAULT_QUOTE_TEMPLATE);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title="Restaurar formato original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar
                </button>
              </div>

              {/* Botones de Etiquetas Dinámicas (Tags) */}
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                  Etiquetas dinámicas disponibles (haz clic para insertar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMessageSubTab === 'appointment' && (
                    <>
                      {['negocio', 'cliente', 'telefono', 'servicio', 'fecha', 'hora', 'notas'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertTag(tag)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          + &#123;{tag}&#125;
                        </button>
                      ))}
                    </>
                  )}

                  {activeMessageSubTab === 'product' && (
                    <>
                      {['negocio', 'producto', 'precio', 'moneda'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertTag(tag)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          + &#123;{tag}&#125;
                        </button>
                      ))}
                    </>
                  )}

                  {activeMessageSubTab === 'quote' && (
                    <>
                      {['negocio', 'cliente', 'items', 'total', 'descuento', 'moneda', 'notas'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertTag(tag)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          + &#123;{tag}&#125;
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Textarea de Edición */}
              <div>
                <textarea
                  rows={10}
                  value={
                    activeMessageSubTab === 'appointment'
                      ? appointmentTemplate
                      : activeMessageSubTab === 'product'
                      ? productTemplate
                      : quoteTemplate
                  }
                  onChange={(e) => {
                    if (activeMessageSubTab === 'appointment') setAppointmentTemplate(e.target.value);
                    else if (activeMessageSubTab === 'product') setProductTemplate(e.target.value);
                    else setQuoteTemplate(e.target.value);
                  }}
                  className="w-full font-mono text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Botón Guardar Cambios */}
              <div className="pt-2 flex justify-end">
                <Button onClick={() => handleSave()} variant="primary" size="md">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Plantillas de WhatsApp
                </Button>
              </div>
            </div>

            {/* Previsualizador en Vivo Estilo WhatsApp */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    Previsualización en WhatsApp
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Dato Ejemplo</span>
                </div>

                {/* Burbuja estilo chat WhatsApp */}
                <div className="bg-[#efeae2] dark:bg-[#0b141a] p-4 rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed border border-zinc-200 dark:border-zinc-800/80 shadow-inner max-h-[380px] overflow-y-auto">
                  {currentPreviewText}
                </div>
              </div>

              {/* Botón Probar Mensaje */}
              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                <a
                  href={buildWhatsAppUrl(whatsappPhone || '5491123456789', currentPreviewText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#1ebd5a] text-white transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Probar este mensaje en WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

