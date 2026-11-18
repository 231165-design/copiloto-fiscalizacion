// Tesseract.js v5 es un paquete CJS sin mapa de exports ESM.
// Vite lo pre-empaqueta y expone el objeto completo como default.
import Tesseract from 'tesseract.js'
const { createWorker } = Tesseract

let worker = null

/**
 * Devuelve un Worker de Tesseract inicializado (singleton).
 * @returns {Promise<import('tesseract.js').Worker>}
 */
async function getWorker() {
  if (worker) return worker

  worker = await createWorker('spa', 1, {
    logger: (m) => {
      if (import.meta.env.DEV) console.debug('[OCR]', m)
    }
  })

  // Parámetros para texto de placa: caracteres alfanuméricos y guión
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
  })

  return worker
}

/**
 * Reconoce texto en un ImageData, Blob, URL o HTMLCanvasElement.
 * @param {import('tesseract.js').ImageLike} image
 * @returns {Promise<string>} texto extraído (trimmed)
 */
export async function recognizePlate(image) {
  const w = await getWorker()
  const { data } = await w.recognize(image)
  return data.text.trim()
}

/** Libera el worker (llamar al desmontar la app si se desea). */
export async function terminateWorker() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
