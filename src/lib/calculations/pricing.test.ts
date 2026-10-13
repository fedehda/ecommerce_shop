import { describe, it, expect } from 'vitest';
import {
  calculatePriceFromMarkup,
  calculatePriceFromMargin,
  getMetrics,
  calculateComboTotal,
  roundToTwoDecimals,
} from './pricing';

describe('Pricing Engine Calculations', () => {
  describe('roundToTwoDecimals', () => {
    it('rounds numbers correctly to 2 decimals', () => {
      expect(roundToTwoDecimals(10.555)).toBe(10.56);
      expect(roundToTwoDecimals(10.554)).toBe(10.55);
      expect(roundToTwoDecimals(10)).toBe(10);
    });
  });

  describe('calculatePriceFromMarkup', () => {
    it('calculates price correctly with 100% markup', () => {
      // Cost: 1000, Markup: 100% -> Price: 2000
      expect(calculatePriceFromMarkup(1000, 100)).toBe(2000);
    });

    it('calculates price correctly with 50% markup', () => {
      // Cost: 2000, Markup: 50% -> Price: 3000
      expect(calculatePriceFromMarkup(2000, 50)).toBe(3000);
    });

    it('calculates price correctly with 150% markup', () => {
      // Cost: 3000, Markup: 150% -> Price: 7500
      expect(calculatePriceFromMarkup(3000, 150)).toBe(7500);
    });

    it('handles 0 cost and negative markup safely', () => {
      expect(calculatePriceFromMarkup(0, 50)).toBe(0);
      expect(calculatePriceFromMarkup(-500, 50)).toBe(0);
      expect(calculatePriceFromMarkup(1000, -10)).toBe(1000);
    });
  });

  describe('calculatePriceFromMargin', () => {
    it('calculates price correctly with 50% margin', () => {
      // Cost: 4500, Margin: 50% -> Price: 9000
      expect(calculatePriceFromMargin(4500, 50)).toBe(9000);
    });

    it('calculates price correctly with 60% margin', () => {
      // Cost: 2000, Margin: 60% -> Price: 5000 (2000 / 0.4 = 5000)
      expect(calculatePriceFromMargin(2000, 60)).toBe(5000);
    });

    it('protects against division by zero (margin >= 100%)', () => {
      expect(calculatePriceFromMargin(1000, 100)).toBe(0);
      expect(calculatePriceFromMargin(1000, 120)).toBe(0);
    });

    it('handles 0 cost and negative margin safely', () => {
      expect(calculatePriceFromMargin(0, 40)).toBe(0);
      expect(calculatePriceFromMargin(-100, 40)).toBe(0);
      expect(calculatePriceFromMargin(1000, -10)).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('returns exact markup, margin and profit for given cost and price', () => {
      // Cost: 1000, Price: 2000 -> Profit: 1000, Markup: 100%, Margin: 50%
      const metrics = getMetrics(1000, 2000);
      expect(metrics.profit).toBe(1000);
      expect(metrics.markup).toBe(100);
      expect(metrics.margin).toBe(50);
    });

    it('calculates metrics for 3000 cost and 7500 price', () => {
      // Cost: 3000, Price: 7500 -> Profit: 4500, Markup: 150%, Margin: 60%
      const metrics = getMetrics(3000, 7500);
      expect(metrics.profit).toBe(4500);
      expect(metrics.markup).toBe(150);
      expect(metrics.margin).toBe(60);
    });

    it('handles zero cost and zero price without errors', () => {
      const metricsZero = getMetrics(0, 0);
      expect(metricsZero.profit).toBe(0);
      expect(metricsZero.markup).toBe(0);
      expect(metricsZero.margin).toBe(0);
    });
  });

  describe('calculateComboTotal', () => {
    it('calculates combo with percentage discount correctly', () => {
      // Items: 7500 + 5000 = 12500, 15% discount -> 1875 desc -> 10625 total
      const items = [
        { price: 7500, quantity: 1 },
        { price: 5000, quantity: 1 },
      ];
      const result = calculateComboTotal(items, 'percentage', 15);
      expect(result.subtotal).toBe(12500);
      expect(result.discountAmount).toBe(1875);
      expect(result.total).toBe(10625);
    });

    it('calculates combo with fixed amount discount correctly', () => {
      // Items: 2 x 3000 = 6000, fixed discount 1000 -> total 5000
      const items = [{ price: 3000, quantity: 2 }];
      const result = calculateComboTotal(items, 'fixed', 1000);
      expect(result.subtotal).toBe(6000);
      expect(result.discountAmount).toBe(1000);
      expect(result.total).toBe(5000);
    });

    it('caps fixed discount to subtotal to prevent negative totals', () => {
      const items = [{ price: 1000, quantity: 1 }];
      const result = calculateComboTotal(items, 'fixed', 2500);
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(1000);
      expect(result.total).toBe(0);
    });
  });
});
