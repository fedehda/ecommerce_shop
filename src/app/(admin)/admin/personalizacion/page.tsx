'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  Image as ImageIcon,
  Save,
  Link2,
  Store,
} from 'lucide-react';
import { useTheme, THEME_OPTIONS, ThemeOption } from '@/components/ThemeProvider';
import { ThemeMode, AppSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { DataRepository } from '@/lib/data/repository';
import { BrandLogo, AVAILABLE_BRAND_ICONS } from '@/components/BrandLogo';

const MODE_OPTIONS: Array<{
  id: ThemeMode;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Sun;
  badge: string;
}> = [
  {
    id: 'light',
    name: 'Tema Claro',
    tagline: 'Luminoso, limpio y minimalista',
    description: 'Fondo blanco puro y zinc suave. Tipografía oscura de alto contraste, ideal para lectura diurna y ambientes luminosos.',
    icon: Sun,
    badge: 'Recomendado',
  },
  {
    id: 'dark',
    name: 'Tema Oscuro',
    tagline: 'Elegante, sobrio y moderno',
    description: 'Fondo grafito profundo y zinc-950. Reduce la fatiga visual en ambientes de poca luz y hace resaltar los colores de acento.',
    icon: Moon,
    badge: 'Nocturno',
  },
  {
    id: 'system',
    name: 'Automático',
    tagline: 'Adaptativo al dispositivo',
    description: 'Se ajusta en tiempo real según el modo claro u oscuro que tenga configurado el usuario en su sistema operativo o smartphone.',
    icon: Laptop,
    badge: 'Inteligente',
  },
];

export default function AdminPersonalizacionPage() {
  const { theme, setTheme, mode, resolvedMode, setMode } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState(theme);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Configuración de Logo e Icono
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [logoIcon, setLogoIcon] = useState('store');
  const [logoUrl, setLogoUrl] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);

  useEffect(() => {
    DataRepository.getSettings().then((s) => {
      setSettings(s);
      setLogoIcon(s.logo_icon || 'store');
      setLogoUrl(s.logo_url || '');
    });
  }, []);

  const handleSaveLogo = async () => {
    setSavingLogo(true);
    const updated = await DataRepository.updateSettings({
      logo_icon: logoIcon,
      logo_url: logoUrl.trim(),
    });
    setSettings(updated);
    setSavingLogo(false);
    setSuccessMessage('¡Logo e icono de marca guardados exitosamente!');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectPalette = async (option: ThemeOption) => {
    setSelectedThemeId(option.id);
    await setTheme(option.id);
    setSuccessMessage(`¡Paleta ${option.name} aplicada exitosamente!`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectMode = async (targetMode: ThemeMode) => {
    await setMode(targetMode);
    const modeLabel = targetMode === 'light' ? 'Tema Claro' : targetMode === 'dark' ? 'Tema Oscuro' : 'Modo Automático / Sistema';
    setSuccessMessage(`¡${modeLabel} activado como preferencia!`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const activeOption = THEME_OPTIONS.find((t) => t.id === selectedThemeId) || THEME_OPTIONS[0];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-emerald-600" />
          Personalización & Identidad de Marca
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Configura la paleta de colores de tu negocio. El estilo se aplica automáticamente en toda la plataforma pública y en el backoffice.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECCIÓN 1: MODO DE TEMA (CLARO / OSCURO / SISTEMA) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Modo de Visualización (Temas Claros y Oscuros)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configura si la plataforma debe mostrarse con fondo claro, oscuro o adaptarse automáticamente a las preferencias de pantalla del cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectMode(opt.id)}
                className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-2 bg-white dark:bg-zinc-900 shadow-md ring-2'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs'
                }`}
                style={{
                  borderColor: isSelected ? activeOption.primaryColor : undefined,
                  // @ts-expect-error Tailwind custom ring color
                  '--tw-ring-color': isSelected ? activeOption.primaryColor + '40' : undefined,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: isSelected ? activeOption.primaryColor : undefined,
                        }}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                          {opt.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
                          {opt.tagline}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                        style={{ backgroundColor: activeOption.primaryColor }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? activeOption.lightColor : undefined,
                      color: isSelected ? activeOption.primaryColor : undefined,
                    }}
                  >
                    {opt.badge}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: isSelected ? activeOption.primaryColor : undefined,
                    }}
                  >
                    {isSelected ? 'Modo Activo' : 'Activar'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: LOGO & ICONO DE LA MARCA */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              Logo o Icono de la Marca
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Personaliza el imagotipo visual que identifica a tu negocio en la cabecera pública, el pie de página y la barra lateral de administración.
            </p>
          </div>

          <Button
            onClick={() => handleSaveLogo()}
            variant="primary"
            size="sm"
            disabled={savingLogo}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {savingLogo ? 'Guardando...' : 'Guardar Logo'}
          </Button>
        </div>

        {/* Previsualización en Vivo del Logo */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <BrandLogo
              logoUrl={logoUrl}
              logoIcon={logoIcon}
              className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 overflow-hidden shrink-0"
              iconClassName="w-6 h-6"
            />
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Previsualización en Vivo
              </span>
              <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                {settings?.business_name || 'Tu Marca Comercial'}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">
                {logoUrl ? 'Logotipo con imagen personalizada' : `Icono vectorial: ${AVAILABLE_BRAND_ICONS.find((i) => i.key === logoIcon)?.label || logoIcon}`}
              </span>
            </div>
          </div>

          {logoUrl && (
            <button
              type="button"
              onClick={() => setLogoUrl('')}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Quitar imagen (usar icono)
            </button>
          )}
        </div>

        {/* Campo de URL de Imagen */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-zinc-400" />
            URL de Logotipo en Imagen (Opcional - PNG transparente, SVG o WebP)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://tudominio.com/logo.png"
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Si dejas este campo vacío o se remueve, se mostrará el icono vectorial elegido a continuación.
          </span>
        </div>

        {/* Selector de Iconos Vectoriales */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            O elige un Icono Vectorial Representativo de tu Rubro:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {AVAILABLE_BRAND_ICONS.map((item) => {
              const Icon = item.icon;
              const isSelected = logoIcon === item.key && !logoUrl;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setLogoIcon(item.key);
                    setLogoUrl('');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs ring-2 ring-emerald-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] leading-tight truncate w-full">
                    {item.label.split(' / ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: PALETAS DE COLOR */}
      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            Paleta de Acentos de Color
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Selecciona el color de identidad corporativa. Combina armónicamente tanto con el tema claro como con el oscuro.
          </p>
        </div>

        {/* Grid de Paletas Disponibles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_OPTIONS.map((option) => {
            const isSelected = selectedThemeId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectPalette(option)}
                className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-2 shadow-md bg-white dark:bg-zinc-900 ring-2 ring-offset-2'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs'
                }`}
                style={{
                  borderColor: isSelected ? option.primaryColor : undefined,
                  // @ts-expect-error Tailwind custom ring color
                  '--tw-ring-color': isSelected ? option.primaryColor : undefined,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {option.name}
                    </span>
                    {isSelected ? (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: option.primaryColor }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    {option.description}
                  </p>
                </div>

              {/* Muestrario de Colores (Color Swatches) */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-6 h-6 rounded-full shadow-xs border border-white/20"
                    style={{ backgroundColor: option.primaryColor }}
                    title="Color Primario"
                  />
                  <span
                    className="w-6 h-6 rounded-full shadow-xs border border-zinc-300 dark:border-zinc-700"
                    style={{ backgroundColor: option.lightColor }}
                    title="Color Claro"
                  />
                  <span
                    className="w-6 h-6 rounded-full shadow-xs border border-white/10"
                    style={{ backgroundColor: option.darkColor }}
                    title="Color Oscuro"
                  />
                </div>

                <span
                  className="text-xs font-semibold"
                  style={{ color: isSelected ? option.primaryColor : undefined }}
                >
                  {isSelected ? 'Activa' : 'Seleccionar'}
                </span>
              </div>
            </button>
          );
        })}
        </div>
      </div>

      {/* Previsualización en Vivo de Componentes */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: activeOption.primaryColor }} />
              Previsualización en Vivo: {activeOption.name}
            </h3>
            <p className="text-xs text-zinc-500">
              Así verán tus clientes los botones, insignias, tarjetas y llamadas a la acción.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
              {resolvedMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {resolvedMode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: activeOption.lightColor,
                color: activeOption.primaryColor,
              }}
            >
              Paleta en Uso
            </span>
          </div>
        </div>

        {/* Demo Cards & Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demo Tarjeta de Servicio */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: activeOption.lightColor,
                  color: activeOption.primaryColor,
                  borderColor: activeOption.primaryColor + '40',
                }}
              >
                Servicio Estrella
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                45 min
              </span>
            </div>

            <div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Corte Clásico & Perfilado
              </h4>
              <p className="text-xs text-zinc-500 mt-1">
                Lavado, corte artesanal a tijera y navaja con diseño personalizado.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                $7.500
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                style={{ backgroundColor: activeOption.primaryColor }}
              >
                <Calendar className="w-3.5 h-3.5" />
                Reservar Turno
              </button>
            </div>
          </div>

          {/* Demo Banner Promocional */}
          <div
            className="rounded-2xl p-5 text-white flex flex-col justify-between"
            style={{
              background: `linear-gradient(135deg, ${activeOption.darkColor} 0%, ${activeOption.primaryColor} 100%)`,
            }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-2">
                Promoción Especial
              </span>
              <h4 className="font-bold text-lg">Combo Corte + Barba Premium</h4>
              <p className="text-xs text-white/80 mt-1">
                Ahorra un 15% reservando ambos servicios en una misma sesión.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs line-through text-white/60 font-mono block">$12.500</span>
                <span className="font-bold text-xl font-mono text-white">$10.625</span>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-zinc-900 hover:bg-white/90 shadow-md flex items-center gap-1"
              >
                Ver Promo
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
