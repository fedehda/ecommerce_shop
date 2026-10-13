'use client';

import React from 'react';
import {
  Tag,
  Scissors,
  Sparkles,
  ShoppingBag,
  Heart,
  Coffee,
  Car,
  Wrench,
  Camera,
  Briefcase,
  Utensils,
  Flame,
  BookOpen,
  Palette,
  Gift,
  Star,
  Activity,
  Shield,
  Zap,
  Music,
  Sun,
  Smile,
  Dumbbell,
  Stethoscope,
  FolderTree,
} from 'lucide-react';

export interface CategoryIconOption {
  id: string;
  name: string;
  categoryName: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AVAILABLE_CATEGORY_ICONS: CategoryIconOption[] = [
  { id: 'tag', name: 'Etiqueta', categoryName: 'General', icon: Tag },
  { id: 'scissors', name: 'Tijeras', categoryName: 'Belleza & Barbería', icon: Scissors },
  { id: 'sparkles', name: 'Destellos / Spa', categoryName: 'Estética & Cuidado', icon: Sparkles },
  { id: 'heart', name: 'Corazón / Salud', categoryName: 'Bienestar & Mascotas', icon: Heart },
  { id: 'shopping-bag', name: 'Bolsa de Compras', categoryName: 'Productos & Tienda', icon: ShoppingBag },
  { id: 'car', name: 'Auto / Vehículo', categoryName: 'Automotor & Taller', icon: Car },
  { id: 'wrench', name: 'Herramientas', categoryName: 'Mecánica & Reparación', icon: Wrench },
  { id: 'coffee', name: 'Café', categoryName: 'Cafetería & Desayunos', icon: Coffee },
  { id: 'utensils', name: 'Cubiertos / Platos', categoryName: 'Gastronomía & Restaurant', icon: Utensils },
  { id: 'flame', name: 'Fuego / Parrilla', categoryName: 'Cocina & Tragos', icon: Flame },
  { id: 'briefcase', name: 'Maletín / Negocios', categoryName: 'Servicios Profesionales', icon: Briefcase },
  { id: 'book-open', name: 'Libro / Estudio', categoryName: 'Capacitación & Cursos', icon: BookOpen },
  { id: 'camera', name: 'Cámara', categoryName: 'Fotografía & Eventos', icon: Camera },
  { id: 'palette', name: 'Paleta de Arte', categoryName: 'Diseño & Uñas', icon: Palette },
  { id: 'dumbbell', name: 'Pesa / Fitness', categoryName: 'Gimnasio & Deporte', icon: Dumbbell },
  { id: 'stethoscope', name: 'Estetoscopio', categoryName: 'Medicina & Consultorio', icon: Stethoscope },
  { id: 'activity', name: 'Pulso / Actividad', categoryName: 'Kinesiología & Terapias', icon: Activity },
  { id: 'shield', name: 'Escudo / Protección', categoryName: 'Seguridad & Seguros', icon: Shield },
  { id: 'zap', name: 'Rayo / Electricidad', categoryName: 'Electricidad & Técnico', icon: Zap },
  { id: 'music', name: 'Música / Sonido', categoryName: 'Espectáculos & DJ', icon: Music },
  { id: 'sun', name: 'Sol / Día', categoryName: 'Aire Libre & Recreación', icon: Sun },
  { id: 'smile', name: 'Sonrisa', categoryName: 'Odontología & Coaching', icon: Smile },
  { id: 'gift', name: 'Regalo / Pack', categoryName: 'Regalería & Promociones', icon: Gift },
  { id: 'star', name: 'Estrella / Premium', categoryName: 'Destacados & VIP', icon: Star },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  tag: Tag,
  scissors: Scissors,
  sparkles: Sparkles,
  'shopping-bag': ShoppingBag,
  heart: Heart,
  coffee: Coffee,
  car: Car,
  wrench: Wrench,
  camera: Camera,
  briefcase: Briefcase,
  utensils: Utensils,
  flame: Flame,
  'book-open': BookOpen,
  palette: Palette,
  gift: Gift,
  star: Star,
  activity: Activity,
  shield: Shield,
  zap: Zap,
  music: Music,
  sun: Sun,
  smile: Smile,
  dumbbell: Dumbbell,
  stethoscope: Stethoscope,
  'folder-tree': FolderTree,
};

interface CategoryIconProps {
  icon?: string | null;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = 'w-4 h-4' }) => {
  if (!icon) return <Tag className={className} />;
  const normalizedKey = icon.toLowerCase().trim();
  const IconComponent = ICON_MAP[normalizedKey] || Tag;
  return <IconComponent className={className} />;
};
