/**
 * Mock API — Copiloto de Fiscalización
 * Simula el endpoint POST /plate/query de AWS Lambda + API Gateway.
 *
 * No requiere dependencias externas: usa el módulo http de Node.js.
 *
 * Uso:
 *   node mock-api.js
 *
 * Escucha en: http://localhost:3001
 */

import { createServer } from 'node:http'

const PORT = 3001

// ── Base de datos de vehículos de prueba ──────────────────────────────────────
const VEHICLES = {
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

const PLATE_REGEX = /^[A-Z]{2,3}-?\d{3,4}$/

// ── Helpers ───────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Content-Type': 'application/json'
}

function send(res, statusCode, body) {
  const payload = JSON.stringify(body)
  res.writeHead(statusCode, { ...CORS_HEADERS, 'Content-Length': Buffer.byteLength(payload) })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end',  ()    => {
      try { resolve(JSON.parse(data || '{}')) }
      catch { reject(new Error('JSON inválido')) }
    })
    req.on('error', reject)
  })
}

function normalizePlate(raw) {
  return raw.toUpperCase().replace(/\s+/g, '').replace(/O/g, '0')
}

// ── Servidor ──────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const { method, url } = req

  // Log de cada petición
  console.log(`${new Date().toISOString()}  ${method} ${url}`)

  // Preflight CORS
  if (method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  // Ruta única: POST /plate/query
  if (method === 'POST' && url === '/plate/query') {
    let body
    try {
      body = await readBody(req)
    } catch {
      send(res, 400, { error: 'BAD_REQUEST', message: 'Body JSON inválido.' })
      return
    }

    const { plate } = body
    if (!plate || typeof plate !== 'string') {
      send(res, 400, { error: 'BAD_REQUEST', message: 'El campo "plate" es requerido.' })
      return
    }

    const normalized = normalizePlate(plate)

    if (!PLATE_REGEX.test(normalized)) {
      send(res, 422, { error: 'INVALID_PLATE_FORMAT', message: 'Formato de placa inválido.' })
      return
    }

    const vehicle = VEHICLES[normalized]
    if (!vehicle) {
      send(res, 404, { error: 'PLATE_NOT_FOUND', message: `Placa ${normalized} no registrada.` })
      return
    }

    // Simula ~200 ms de latencia de red para que el demo sea realista
    await new Promise(r => setTimeout(r, 200))

    send(res, 200, vehicle)
    return
  }

  // Cualquier otra ruta
  send(res, 404, { error: 'NOT_FOUND', message: `Ruta ${method} ${url} no existe en el mock.` })
})

server.listen(PORT, () => {
  console.log(`\n🚀  Mock API escuchando en http://localhost:${PORT}`)
  console.log('   Ruta disponible: POST /plate/query')
  console.log('\n   Placas de prueba:')
  console.log('   • ABC-1234  → Juan Pérez, todo en regla')
  console.log('   • XYZ-9876  → María González, revisión técnica vencida, 2 multas')
  console.log('   • PQR-456   → Carlos Ruiz, suspendido, 5 multas')
  console.log('\n   Ctrl+C para detener.\n')
})
