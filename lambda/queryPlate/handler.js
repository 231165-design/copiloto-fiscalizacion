import { validatePlate } from './validator.js'
import { getVehicleByPlate } from './dbClient.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key',
  'Content-Type': 'application/json'
}

/**
 * Lambda handler: POST /plate/query
 * Body: { "plate": "ABC-1234" }
 */
export const handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  let plate
  try {
    ;({ plate } = JSON.parse(event.body ?? '{}'))
  } catch {
    return respond(400, { error: 'BAD_REQUEST', message: 'Body JSON inválido.' })
  }

  if (!plate || typeof plate !== 'string') {
    return respond(400, { error: 'BAD_REQUEST', message: 'El campo "plate" es requerido.' })
  }

  const { normalized, valid } = validatePlate(plate)
  if (!valid) {
    return respond(422, { error: 'INVALID_PLATE_FORMAT', message: 'Formato de placa inválido.' })
  }

  const vehicle = await getVehicleByPlate(normalized)
  if (!vehicle) {
    return respond(404, { error: 'PLATE_NOT_FOUND', message: 'Placa no registrada.' })
  }

  return respond(200, vehicle)
}

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
}
