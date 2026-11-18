import { useMutation } from '@tanstack/react-query'
import { queryPlate } from '../services/api.js'
import { saveToHistory, enqueueOffline } from '../services/db.js'

/**
 * Mutation para consultar una placa.
 * Si no hay conexión, encola la consulta en IndexedDB.
 */
export function usePlateQuery() {
  return useMutation({
    mutationFn: async (plate) => {
      if (!navigator.onLine) {
        await enqueueOffline(plate)
        throw Object.assign(new Error('Sin conexión. La consulta se enviará cuando vuelva la red.'), {
          code: 'OFFLINE'
        })
      }
      return queryPlate(plate)
    },
    onSuccess: async (data) => {
      await saveToHistory({ plate: data.plate, result: data })
    }
  })
}
