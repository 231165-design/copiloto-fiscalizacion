/**
 * Carga datos de prueba en DynamoDB Local o en AWS.
 *
 * Uso:
 *   # Contra DynamoDB Local (puerto 8000)
 *   DYNAMODB_ENDPOINT=http://localhost:8000 TABLE=vehicles-prod node seed-data.js
 *
 *   # Contra AWS (usa credenciales de tu perfil)
 *   TABLE=vehicles-prod node seed-data.js
 */

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

const TABLE    = process.env.TABLE    ?? 'vehicles-prod'
const ENDPOINT = process.env.DYNAMODB_ENDPOINT

const client = new DynamoDBClient(ENDPOINT ? { endpoint: ENDPOINT } : {})

const vehicles = [
  {
    plateId: 'ABC-1234',
    owner: 'Juan Pérez',
    status: 'active',
    technicalReview: { valid: true,  expiresAt: '2025-11-30' },
    soat:            { valid: true,  expiresAt: '2025-08-15' },
    pendingFines: 0,
    fineAmountUSD: 0
  },
  {
    plateId: 'XYZ-9876',
    owner: 'María González',
    status: 'active',
    technicalReview: { valid: false, expiresAt: '2024-03-01' },
    soat:            { valid: true,  expiresAt: '2025-12-31' },
    pendingFines: 2,
    fineAmountUSD: 150.00
  },
  {
    plateId: 'PQR-456',
    owner: 'Carlos Ruiz',
    status: 'suspended',
    technicalReview: { valid: false, expiresAt: '2023-10-15' },
    soat:            { valid: false, expiresAt: '2024-01-20' },
    pendingFines: 5,
    fineAmountUSD: 420.00
  }
]

for (const v of vehicles) {
  await client.send(new PutItemCommand({
    TableName: TABLE,
    Item: marshall(v)
  }))
  console.log(`✓ Insertado: ${v.plateId}`)
}

console.log('Seed completado.')
