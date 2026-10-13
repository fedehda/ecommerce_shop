import { AppointmentMessageData, QuoteMessageData, ProductMessageData } from '@/types';

/**
 * Plantillas predeterminadas de WhatsApp con formato nativo (*negrita*, _cursiva_, emojis y saltos de línea).
 */
export const DEFAULT_APPOINTMENT_TEMPLATE = `📍 *{negocio}*
🗓️ *SOLICITUD DE TURNO*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* {cliente}
📞 *Teléfono:* {telefono}
✂️ *Servicio:* {servicio}
📅 *Fecha:* {fecha}
⏰ *Horario:* {hora}
{notas_linea}━━━━━━━━━━━━━━━━━━━━
¡Hola! Me gustaría confirmar la reserva de este turno. Muchas gracias.`;

export const DEFAULT_PRODUCT_TEMPLATE = `¡Hola {negocio}! Quisiera encargar el siguiente producto de su catálogo:

🛍️ *{producto}*
💰 *Precio:* {moneda}{precio}

¿Podrían indicarme si tienen stock para retiro o envío? ¡Muchas gracias!`;

export const DEFAULT_QUOTE_TEMPLATE = `🏢 *{negocio}*
📋 *PRESUPUESTO DETALLADO*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* {cliente}

🛒 *Detalle de Ítems:*
{items}
━━━━━━━━━━━━━━━━━━━━
{descuento_linea}💰 *TOTAL FINAL:* *{moneda}{total}*
{notas_linea}
_Presupuesto válido por 15 días._
Quedamos a tu disposición para coordinar o resolver cualquier duda.`;

/**
 * Reemplaza etiquetas {variable} dentro de una plantilla de texto.
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    const stringVal = val !== undefined && val !== null ? String(val) : '';
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, stringVal);
  }
  return result;
}

/**
 * Sanitiza un número telefónico para WhatsApp.
 * Remueve espacios, guiones, paréntesis y símbolos '+'.
 * Asegura que contenga únicamente dígitos.
 * 
 * @param phone Número telefónico ingresado
 * @param defaultCountryCode Código de país por defecto si no está presente (por ej. '549' para Argentina móvil)
 */
export function sanitizePhone(phone: string, defaultCountryCode = '549'): string {
  if (!phone) return '';
  
  // Remover todo excepto dígitos
  let cleaned = phone.replace(/\D/g, '');

  // Si comienza con 00, removerlos
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Si tiene longitud típica local argentina (ej. 10 dígitos tipo 1123456789)
  // o no tiene código de país, anteponer defaultCountryCode
  if (cleaned.length === 10 && defaultCountryCode) {
    cleaned = `${defaultCountryCode}${cleaned}`;
  }

  return cleaned;
}

/**
 * Construye el mensaje estructurado de WhatsApp para la solicitud / confirmación de un Turno.
 * Utiliza formato nativo de WhatsApp (*negrita*, _cursiva_, emojis y saltos de línea).
 */
export function formatAppointmentMessage(data: AppointmentMessageData): string {
  if (data.template && data.template.trim()) {
    const notesLine = data.notes && data.notes.trim()
      ? `📝 *Notas:* _${data.notes.trim()}_\n`
      : '';
    return interpolateTemplate(data.template, {
      negocio: data.businessName ? data.businessName.trim() : '',
      cliente: data.customerName.trim(),
      telefono: data.customerPhone ? data.customerPhone.trim() : '',
      servicio: data.serviceOrComboName.trim(),
      fecha: data.date.trim(),
      hora: data.time.trim(),
      notas: data.notes ? data.notes.trim() : '',
      notas_linea: notesLine,
    });
  }

  const businessHeader = data.businessName ? `📍 *${data.businessName.trim()}*\n` : '';
  
  const lines: string[] = [
    `${businessHeader}🗓️ *SOLICITUD DE TURNO*`,
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 *Cliente:* ${data.customerName.trim()}`,
  ];

  if (data.customerPhone) {
    lines.push(`📞 *Teléfono:* ${data.customerPhone.trim()}`);
  }

  lines.push(`✂️ *Servicio:* ${data.serviceOrComboName.trim()}`);
  lines.push(`📅 *Fecha:* ${data.date.trim()}`);
  lines.push(`⏰ *Horario:* ${data.time.trim()}`);

  if (data.notes && data.notes.trim()) {
    lines.push(`📝 *Notas:* _${data.notes.trim()}_`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('¡Hola! Me gustaría confirmar la reserva de este turno. Muchas gracias.');

  return lines.join('\n');
}

/**
 * Construye el mensaje estructurado de WhatsApp para un Pedido de Producto del Catálogo.
 */
export function formatProductMessage(data: ProductMessageData): string {
  const template = data.template && data.template.trim()
    ? data.template
    : DEFAULT_PRODUCT_TEMPLATE;

  const currency = data.currencySymbol || '$';
  const formattedPrice = data.price.toLocaleString('es-AR');
  const business = data.businessName ? data.businessName.trim() : 'nuestro local';

  return interpolateTemplate(template, {
    negocio: business,
    producto: data.productName.trim(),
    precio: formattedPrice,
    moneda: currency,
  });
}

/**
 * Construye el mensaje estructurado de WhatsApp para un Presupuesto o Cotización detallada.
 * Incluye lista de ítems, cantidades, subtotales, descuentos y total final.
 */
export function formatQuoteMessage(data: QuoteMessageData): string {
  const currency = data.currencySymbol || '$';

  if (data.template && data.template.trim()) {
    const itemsText = data.items
      .map(
        (item, index) =>
          `${index + 1}. *${item.name}* (x${item.quantity})` +
          `\n   Precio unitario: ${currency}${item.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` +
          `\n   Subtotal: *${currency}${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}*`
      )
      .join('\n');

    const discountLine = data.discountAmount && data.discountAmount > 0
      ? `🎟️ *Descuento Aplicado:* -${currency}${data.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}\n`
      : '';

    const notesLine = data.notes && data.notes.trim()
      ? `\n📝 *Observaciones:* _${data.notes.trim()}_\n`
      : '';

    return interpolateTemplate(data.template, {
      negocio: data.businessName ? data.businessName.trim() : '',
      cliente: data.customerName.trim(),
      items: itemsText,
      descuento_linea: discountLine,
      descuento: data.discountAmount ? data.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '',
      total: data.total.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
      moneda: currency,
      notas_linea: notesLine,
      notas: data.notes ? data.notes.trim() : '',
    });
  }

  const businessHeader = data.businessName ? `🏢 *${data.businessName.trim()}*\n` : '';

  const lines: string[] = [
    `${businessHeader}📋 *PRESUPUESTO DETALLADO*`,
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 *Cliente:* ${data.customerName.trim()}`,
    '',
    '🛒 *Detalle de Ítems:*',
  ];

  data.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. *${item.name}* (x${item.quantity})` +
      `\n   Precio unitario: ${currency}${item.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` +
      `\n   Subtotal: *${currency}${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}*`
    );
  });

  lines.push('━━━━━━━━━━━━━━━━━━━━');

  if (data.discountAmount && data.discountAmount > 0) {
    lines.push(`🎟️ *Descuento Aplicado:* -${currency}${data.discountAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
  }

  lines.push(`💰 *TOTAL FINAL:* *${currency}${data.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}*`);

  if (data.notes && data.notes.trim()) {
    lines.push(`\n📝 *Observaciones:* _${data.notes.trim()}_`);
  }

  lines.push('\n_Presupuesto válido por 15 días._');
  lines.push('Quedamos a tu disposición para coordinar o resolver cualquier duda.');

  return lines.join('\n');
}

/**
 * Ensambla la URL final de WhatsApp compatible con Web y Móvil.
 * 
 * @param phone Número telefónico receptor (se sanitiza automáticamente)
 * @param message Texto a enviar (se codifica con encodeURIComponent)
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const sanitized = sanitizePhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${sanitized}?text=${encodedText}`;
}
