const PLATE_REGEX = /^[A-Z]{2,3}-?\d{3,4}$/

/**
 * @param {string} raw
 * @returns {{ normalized: string, valid: boolean }}
 */
export function validatePlate(raw) {
  const normalized = raw.toUpperCase().replace(/\s+/g, '').replace(/O/g, '0')
  return { normalized, valid: PLATE_REGEX.test(normalized) }
}
