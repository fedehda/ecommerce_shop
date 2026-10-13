import { ComboItemPrice, ComboTotalCalculation, PricingMetrics } from '@/types';

/**
 * Redondea un número a 2 decimales de forma precisa
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el precio de venta a partir del costo base y el porcentaje de Markup.
 * Fórmula: Precio = Costo * (1 + Markup / 100)
 * 
 * @param cost Costo base del producto o servicio
 * @param markup Porcentaje de markup sobre el costo (ej: 50 para 50%)
 * @returns Precio final calculado y redondeado
 */
export function calculatePriceFromMarkup(cost: number, markup: number): number {
  if (cost <= 0) return 0;
  if (markup < 0) return roundToTwoDecimals(cost);
  
  const price = cost * (1 + markup / 100);
  return roundToTwoDecimals(price);
}

/**
 * Calcula el precio de venta a partir del costo base y el porcentaje de Margen de ganancia deseado.
 * Fórmula: Precio = Costo / (1 - Margen / 100)
 * 
 * Protegido contra división por cero o margen >= 100%.
 * 
 * @param cost Costo base del producto o servicio
 * @param margin Porcentaje de margen sobre el precio final (ej: 30 para 30%)
 * @returns Precio final calculado y redondeado
 */
export function calculatePriceFromMargin(cost: number, margin: number): number {
  if (cost <= 0) return 0;
  // Protección contra división por cero o margen inalcanzable (100% o más)
  if (margin >= 100 || margin < 0) return 0;
  
  const denominator = 1 - margin / 100;
  if (denominator <= 0) return 0;
  
  const price = cost / denominator;
  return roundToTwoDecimals(price);
}

/**
 * Calcula las métricas financieras (Markup, Margen de ganancia y Beneficio neto)
 * dadas las variables de Costo y Precio de venta.
 * 
 * Fórmulas:
 * - Ganancia = Precio - Costo
 * - Markup (%) = ((Precio - Costo) / Costo) * 100
 * - Margen (%) = ((Precio - Costo) / Precio) * 100
 * 
 * @param cost Costo base
 * @param price Precio de venta
 */
export function getMetrics(cost: number, price: number): PricingMetrics {
  const safeCost = Math.max(0, cost);
  const safePrice = Math.max(0, price);
  const profit = roundToTwoDecimals(safePrice - safeCost);

  // Markup: sobreprecio respecto al costo
  const markup = safeCost > 0
    ? roundToTwoDecimals(((safePrice - safeCost) / safeCost) * 100)
    : 0;

  // Margen: porcentaje del precio de venta que es beneficio
  const margin = safePrice > 0
    ? roundToTwoDecimals(((safePrice - safeCost) / safePrice) * 100)
    : 0;

  return {
    markup,
    margin,
    profit,
  };
}

/**
 * Calcula el subtotal, descuento aplicado y precio total de un Combo o Paquete de ítems.
 * 
 * @param items Lista de ítems con precio y cantidad
 * @param discountType Tipo de descuento ('percentage' o 'fixed')
 * @param discountValue Valor del descuento (porcentaje 0-100 o monto fijo en $)
 */
export function calculateComboTotal(
  items: ComboItemPrice[],
  discountType: 'percentage' | 'fixed',
  discountValue: number
): ComboTotalCalculation {
  const subtotal = roundToTwoDecimals(
    items.reduce((sum, item) => sum + (Math.max(0, item.price) * Math.max(1, item.quantity)), 0)
  );

  const safeDiscountValue = Math.max(0, discountValue);
  let discountAmount = 0;

  if (discountType === 'percentage') {
    const clampedPercentage = Math.min(100, safeDiscountValue);
    discountAmount = roundToTwoDecimals((subtotal * clampedPercentage) / 100);
  } else {
    // Descuento fijo en monto monetario, no puede superar el subtotal
    discountAmount = roundToTwoDecimals(Math.min(subtotal, safeDiscountValue));
  }

  const total = roundToTwoDecimals(Math.max(0, subtotal - discountAmount));

  return {
    subtotal,
    discountAmount,
    total,
  };
}
