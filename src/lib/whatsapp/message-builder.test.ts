import { describe, it, expect } from 'vitest';
import {
  sanitizePhone,
  formatAppointmentMessage,
  formatQuoteMessage,
  formatProductMessage,
  buildWhatsAppUrl,
} from './message-builder';

describe('WhatsApp Message Builder', () => {
  describe('sanitizePhone', () => {
    it('removes spaces, hyphens, and plus signs', () => {
      expect(sanitizePhone('+54 9 11 2345-6789')).toBe('5491123456789');
      expect(sanitizePhone('+(54) 9 11-2345.6789')).toBe('5491123456789');
    });

    it('prepends default country code to 10-digit local Argentine numbers', () => {
      expect(sanitizePhone('1123456789', '549')).toBe('5491123456789');
    });

    it('handles empty input gracefully', () => {
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('formatAppointmentMessage', () => {
    it('formats appointment message with correct markdown and structure', () => {
      const message = formatAppointmentMessage({
        businessName: 'Studio Style',
        customerName: 'Juan Pérez',
        customerPhone: '1122334455',
        serviceOrComboName: 'Corte de Cabello Clásico',
        date: '15/10/2026',
        time: '14:30',
        notes: 'Puntual por favor',
      });

      expect(message).toContain('*Studio Style*');
      expect(message).toContain('*Cliente:* Juan Pérez');
      expect(message).toContain('*Servicio:* Corte de Cabello Clásico');
      expect(message).toContain('*Fecha:* 15/10/2026');
      expect(message).toContain('*Horario:* 14:30');
      expect(message).toContain('*Notas:* _Puntual por favor_');
    });

    it('supports custom appointment template with variable interpolation', () => {
      const customTemplate = 'Hola {negocio}, soy {cliente} ({telefono}). Quiero agendar {servicio} el {fecha} a las {hora}.';
      const message = formatAppointmentMessage({
        businessName: 'Spa Relax',
        customerName: 'María López',
        customerPhone: '1199887766',
        serviceOrComboName: 'Masaje Descontracturante',
        date: '20/10/2026',
        time: '16:00',
        template: customTemplate,
      });

      expect(message).toBe('Hola Spa Relax, soy María López (1199887766). Quiero agendar Masaje Descontracturante el 20/10/2026 a las 16:00.');
    });
  });

  describe('formatProductMessage', () => {
    it('formats product order message with default template', () => {
      const msg = formatProductMessage({
        businessName: 'Mi Negocio',
        productName: 'Cera Fijadora',
        price: 8500,
        currencySymbol: '$',
      });

      expect(msg).toContain('¡Hola Mi Negocio!');
      expect(msg).toContain('*Cera Fijadora*');
      expect(msg).toContain('$8.500');
    });

    it('formats product order message with custom template', () => {
      const customTemplate = 'Consulta de compra: {producto} a {moneda}{precio} para {negocio}.';
      const msg = formatProductMessage({
        businessName: 'TechStore',
        productName: 'Teclado Gamer',
        price: 35000,
        currencySymbol: 'ARS ',
        template: customTemplate,
      });

      expect(msg).toBe('Consulta de compra: Teclado Gamer a ARS 35.000 para TechStore.');
    });
  });

  describe('formatQuoteMessage', () => {
    it('formats quote with itemized list, subtotals, and total', () => {
      const quote = formatQuoteMessage({
        businessName: 'Barbería Style',
        customerName: 'Carlos Gómez',
        items: [
          { name: 'Corte Clásico', quantity: 2, unitPrice: 7500, subtotal: 15000 },
          { name: 'Pomada Modeladora', quantity: 1, unitPrice: 9000, subtotal: 9000 },
        ],
        discountAmount: 2000,
        total: 22000,
        currencySymbol: '$',
      });

      expect(quote).toContain('Barbería Style');
      expect(quote).toContain('*Cliente:* Carlos Gómez');
      expect(quote).toContain('*Corte Clásico* (x2)');
      expect(quote).toContain('*Pomada Modeladora* (x1)');
      expect(quote).toContain('Descuento Aplicado');
      expect(quote).toContain('*TOTAL FINAL:*');
    });

    it('supports custom quote template with variable interpolation', () => {
      const customTemplate = 'Presupuesto de {negocio} para {cliente}:\n{items}\nTotal: {moneda}{total}';
      const quote = formatQuoteMessage({
        businessName: 'Taller Rápido',
        customerName: 'Laura Silva',
        items: [
          { name: 'Cambio de Aceite', quantity: 1, unitPrice: 20000, subtotal: 20000 },
        ],
        total: 20000,
        currencySymbol: '$',
        template: customTemplate,
      });

      expect(quote).toContain('Presupuesto de Taller Rápido para Laura Silva:');
      expect(quote).toContain('*Cambio de Aceite* (x1)');
      expect(quote).toContain('Total: $20.000,00');
    });
  });

  describe('buildWhatsAppUrl', () => {
    it('generates valid wa.me URL with encoded text', () => {
      const url = buildWhatsAppUrl('+54 9 11 2345-6789', 'Hola *Mundo*!\nSegunda línea');
      expect(url).toContain('https://wa.me/5491123456789?text=');
      expect(url).toContain('Hola%20*Mundo*!%0ASegunda%20l%C3%ADnea');
    });
  });
});
