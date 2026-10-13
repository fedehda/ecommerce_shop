'use client';

import React from 'react';
import {
  Store,
  Scissors,
  Sparkles,
  Heart,
  Car,
  Wrench,
  Coffee,
  Utensils,
  Briefcase,
  Camera,
  Dumbbell,
  Stethoscope,
  ShoppingBag,
  Crown,
  Gem,
  Flower2,
  Bike,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export interface BrandIconOption {
  key: string;
  label: string;
  icon: LucideIcon;
  category: string;
}

export const AVAILABLE_BRAND_ICONS: BrandIconOption[] = [
  { key: 'store', label: 'Tienda / General', icon: Store, category: 'Comercio' },
  { key: 'scissors', label: 'Barbería / Peluquería', icon: Scissors, category: 'Belleza' },
  { key: 'sparkles', label: 'Estética / Spa', icon: Sparkles, category: 'Belleza' },
  { key: 'heart', label: 'Salud / Mascotas', icon: Heart, category: 'Cuidado' },
  { key: 'car', label: 'Taller / Automotor', icon: Car, category: 'Servicios' },
  { key: 'wrench', label: 'Mecánica / Reparación', icon: Wrench, category: 'Servicios' },
  { key: 'coffee', label: 'Cafetería / Bar', icon: Coffee, category: 'Gastronomía' },
  { key: 'utensils', label: 'Restaurante / Cocina', icon: Utensils, category: 'Gastronomía' },
  { key: 'briefcase', label: 'Consultoría / Profesional', icon: Briefcase, category: 'Corporativo' },
  { key: 'camera', label: 'Fotografía / Estudio', icon: Camera, category: 'Creativo' },
  { key: 'dumbbell', label: 'Gimnasio / Fitness', icon: Dumbbell, category: 'Deporte' },
  { key: 'stethoscope', label: 'Medicina / Clínica', icon: Stethoscope, category: 'Salud' },
  { key: 'shopping-bag', label: 'Boutique / Moda', icon: ShoppingBag, category: 'Comercio' },
  { key: 'crown', label: 'Premium / Exclusivo', icon: Crown, category: 'Lujo' },
  { key: 'gem', label: 'Joyería / Diseño', icon: Gem, category: 'Lujo' },
  { key: 'flower-2', label: 'Floristería / Naturaleza', icon: Flower2, category: 'Naturaleza' },
  { key: 'bike', label: 'Ciclismo / Movilidad', icon: Bike, category: 'Deporte' },
  { key: 'book-open', label: 'Educación / Cursos', icon: BookOpen, category: 'Educación' },
];

const BRAND_ICON_MAP: Record<string, LucideIcon> = {
  store: Store,
  scissors: Scissors,
  sparkles: Sparkles,
  heart: Heart,
  car: Car,
  wrench: Wrench,
  coffee: Coffee,
  utensils: Utensils,
  briefcase: Briefcase,
  camera: Camera,
  dumbbell: Dumbbell,
  stethoscope: Stethoscope,
  'shopping-bag': ShoppingBag,
  crown: Crown,
  gem: Gem,
  'flower-2': Flower2,
  bike: Bike,
  'book-open': BookOpen,
};

export interface BrandLogoProps {
  logoUrl?: string | null;
  logoIcon?: string | null;
  className?: string;
  iconClassName?: string;
  imageClassName?: string;
  alt?: string;
}

export function BrandLogo({
  logoUrl,
  logoIcon,
  className = 'w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 overflow-hidden shrink-0',
  iconClassName = 'w-5 h-5',
  imageClassName = 'w-full h-full object-cover',
  alt = 'Logo de la marca',
}: BrandLogoProps) {
  const [imgError, setImgError] = React.useState(false);

  // Si hay logoUrl válido y no falló la carga
  if (logoUrl && logoUrl.trim() && !imgError) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl.trim()}
          alt={alt}
          onError={() => setImgError(true)}
          className={imageClassName}
        />
      </div>
    );
  }

  // Fallback a Icono
  const IconComponent = (logoIcon && BRAND_ICON_MAP[logoIcon]) || Store;

  return (
    <div className={className}>
      <IconComponent className={iconClassName} />
    </div>
  );
}
