// ── Configuración ──────────────────────────────────────────────────────────────
const BASE_URL   = import.meta.env.VITE_API_BASE_URL ?? ''
const API_KEY    = import.meta.env.VITE_API_KEY      ?? ''

// El modo demo se activa en dos situaciones:
//   1. No se configuró VITE_API_BASE_URL  →  no hay backend real apuntado.
//   2. Se definió VITE_DEMO_MODE=true     →  forzado explícitamente (ej. Vercel preview).
const DEMO_MODE  = !BASE_URL || import.meta.env.VITE_DEMO_MODE === 'true'

// ── Base de datos simulada ─────────────────────────────────────────────────────
const MOCK_DB = {
  'ABC-1234': {
    plate: 'ABC-1234',
    owner: 'Juan Pérez',
    status: 'active',
    technicalReview: { valid: true,  expiresAt: '2025-11-30' },
    soat:            { valid: true,  expiresAt: '2025-08-15' },
    pendingFines: 0,
    fineAmountUSD: 0
  },
  'XYZ-9876': {
    plate: 'XYZ-9876',
    owner: 'María González',
    status: 'active',
    technicalReview: { valid: false, expiresAt: '2024-03-01' },
    soat:            { valid: true,  expiresAt: '2025-12-31' },
    pendingFines: 2,
    fineAmountUSD: 150.00
  },
  'PQR-456': {
    plate: 'PQR-456',
    owner: 'Carlos Ruiz',
    status: 'suspended',
    technicalReview: { valid: false, expiresAt: '2023-10-15' },
    soat:            { valid: false, expiresAt: '2024-01-20' },
    pendingFines: 5,
    fineAmountUSD: 420.00
  }
}

// ── Respuesta simulada ─────────────────────────────────────────────────────────
function mockQuery(plate) {
  // Simula ~400 ms de latencia para que la demo parezca real
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      const vehicle = MOCK_DB[plate]
      if (vehicle) {
        resolve(vehicle)
      } else {
        const err = Object.assign(
          new Error(`Placa ${plate} no registrada.`),
          { code: 'PLATE_NOT_FOUND', status: 404 }
        )
        reject(err)
      }
    }, 400)
  )
}

// ── Función principal ──────────────────────────────────────────────────────────
/**
 * Consulta el estado de un vehículo por número de placa.
 *
 * En modo demo (sin VITE_API_BASE_URL o con VITE_DEMO_MODE=true) responde
 * desde los datos locales sin hacer ninguna petición de red.
 *
 * @param {string} plate  número de placa normalizado, ej. "ABC-1234"
 * @returns {Promise<object>}
 */
export async function queryPlate(plate) {
  if (DEMO_MODE) {
    return mockQuery(plate)
  }

  const response = await fetch(`${BASE_URL}/plate/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({ plate })
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw Object.assign(
      new Error(body.message ?? 'Error en la consulta'),
      { code: body.error, status: response.status }
    )
  }

  return response.json()
}

/** Expuesto solo para tests y el banner de UI. */
export const isDemoMode = DEMO_MODE
