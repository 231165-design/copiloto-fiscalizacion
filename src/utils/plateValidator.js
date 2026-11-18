/**
 * Formatos soportados:
 *   - Antiguo Ecuador:  ABC-1234  (3 letras, guión, 4 dígitos)
 *   - Nuevo Ecuador:    ABC-123   (3 letras, guión, 3 dígitos)
 *   - Motos Ecuador:    AB-1234   (2 letras, guión, 4 dígitos)
 *
 * Se acepta con o sin guión para acomodar errores OCR comunes.
 */
const PLATE_REGEX = /^[A-Z]{2,3}-?\d{3,4}$/

/**
 * Normaliza el texto OCR (mayúsculas, elimina espacios) y valida formato.
 * @param {string} raw
 * @returns {{ normalized: string, valid: boolean }}
 */
export function validatePlate(raw) {
  const normalized = raw.toUpperCase().replace(/\s+/g, '').replace(/[O]/g, '0')
  const valid = PLATE_REGEX.test(normalized)
  return { normalized, valid }
}
