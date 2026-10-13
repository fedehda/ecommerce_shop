'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, MapPin, Shield, Home, Scissors, ShoppingBag, Calendar } from 'lucide-react';
import { DataRepository } from '@/lib/data/repository';
import { AppSettings } from '@/types';
import { buildWhatsAppUrl } from '@/lib/whatsapp/message-builder';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandLogo } from '@/components/BrandLogo';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    DataRepository.getSettings().then(setSettings);
  }, []);

  const businessName = settings?.business_name || 'Studio & Barbería Style';
  const phone = settings?.whatsapp_phone || '5491123456789';
  const whatsappUrl = buildWhatsAppUrl(
    phone,
    `¡Hola ${businessName}! Quisiera hacer una consulta sobre sus productos y turnos.`
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo
              logoUrl={settings?.logo_url}
              logoIcon={settings?.logo_icon}
              className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 overflow-hidden shrink-0"
              iconClassName="w-5 h-5"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight block leading-tight">
                {businessName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase block">
                Catálogo & Reservas
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hidden sm:inline-block px-2 py-1 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/servicios"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hidden sm:inline-block px-2 py-1 transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="/productos"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hidden sm:inline-block px-2 py-1 transition-colors"
            >
              Productos
            </Link>
            <Link
              href="/turnos"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors shadow-xs"
            >
              Reservar Turno
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#25D366] text-white hover:bg-[#1ebd5a] transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>

            <ThemeToggle />

            <Link
              href="/admin"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Panel Administrativo"
            >
              <Shield className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>

      {/* Floating WhatsApp Action on Mobile */}
      <aside aria-label="Contacto flotante" className="fixed bottom-20 right-4 z-40 sm:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        </a>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navegación principal para móviles"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center justify-around shadow-lg"
      >
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 px-2 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          <span>Inicio</span>
        </Link>
        <Link
          href="/servicios"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 px-2 rounded-lg transition-colors"
        >
          <Scissors className="w-5 h-5" aria-hidden="true" />
          <span>Servicios</span>
        </Link>
        <Link
          href="/productos"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 px-2 rounded-lg transition-colors"
        >
          <ShoppingBag className="w-5 h-5" aria-hidden="true" />
          <span>Productos</span>
        </Link>
        <Link
          href="/turnos"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 py-1 px-2 rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <span>Turnos</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-10 mt-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-sm">
              {businessName}
            </span>
            <p>{settings?.business_description || 'Catálogo online y reservas directas.'}</p>
            {settings?.address && (
              <p className="flex items-center justify-center sm:justify-start gap-1 text-zinc-400">
                <MapPin className="w-3.5 h-3.5" />
                {settings.address}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-pink-600 transition-colors"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            <Link
              href="/admin/login"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline"
            >
              Acceso Staff
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
