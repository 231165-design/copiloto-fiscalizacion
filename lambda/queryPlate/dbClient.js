import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const client    = new DynamoDBClient({})
const TABLE     = process.env.VEHICLES_TABLE ?? 'vehicles'

/**
 * Busca un vehículo por número de placa en DynamoDB.
 * @param {string} plate  número normalizado, ej. "ABC-1234"
 * @returns {Promise<object|null>}
 */
export async function getVehicleByPlate(plate) {
  const { Item } = await client.send(new GetItemCommand({
    TableName: TABLE,
    Key: marshall({ plateId: plate })
  }))
  return Item ? unmarshall(Item) : null
}
