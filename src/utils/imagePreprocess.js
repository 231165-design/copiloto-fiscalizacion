/**
 * Aplica preprocesamiento básico sobre un canvas para mejorar la precisión OCR:
 *  1. Escala de grises
 *  2. Umbralización (binarización simple)
 *
 * @param {HTMLCanvasElement} canvas  canvas con el frame capturado
 * @returns {HTMLCanvasElement}       nuevo canvas procesado
 */
export function preprocessForOCR(canvas) {
  const src  = canvas.getContext('2d')
  const data = src.getImageData(0, 0, canvas.width, canvas.height)
  const px   = data.data

  for (let i = 0; i < px.length; i += 4) {
    // Luminosidad perceptual
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
    // Umbral simple
    const val  = gray > 128 ? 255 : 0
    px[i] = px[i + 1] = px[i + 2] = val
  }

  const out = document.createElement('canvas')
  out.width  = canvas.width
  out.height = canvas.height
  out.getContext('2d').putImageData(data, 0, 0)
  return out
}
