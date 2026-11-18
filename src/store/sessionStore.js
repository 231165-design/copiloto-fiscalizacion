import { create } from 'zustand'

/**
 * Estado global de la sesión activa.
 */
export const useSessionStore = create((set) => ({
  /** Texto de placa actualmente en edición */
  activePlate: '',
  setActivePlate: (plate) => set({ activePlate: plate }),

  /** Último resultado de la API */
  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),

  /** Resetea la sesión de escaneo */
  resetScan: () => set({ activePlate: '', lastResult: null })
}))
