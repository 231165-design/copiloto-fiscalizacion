const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const API_KEY  = import.meta.env.VITE_API_KEY  ?? ''

/**
 * POST /plate/query
 * @param {string} plate - número de placa, ej. "ABC-1234"
 * @returns {Promise<object>} datos del vehículo
 */
export async function queryPlate(plate) {
  const response = await fetch(`${BASE_URL}/plate/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({ plate })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw Object.assign(new Error(err.message ?? 'Error en la consulta'), {
      code: err.error,
      status: response.status
    })
  }

  return response.json()
}
