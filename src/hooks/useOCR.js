import { useState, useCallback } from 'react'
import { recognizePlate } from '../services/ocrWorker.js'

/**
 * @returns {{
 *   text: string,
 *   isProcessing: boolean,
 *   ocrError: string|null,
 *   runOCR: (image: any) => Promise<string>
 * }}
 */
export function useOCR() {
  const [text, setText]             = useState('')
  const [isProcessing, setProcessing] = useState(false)
  const [ocrError, setOcrError]     = useState(null)

  const runOCR = useCallback(async (image) => {
    setProcessing(true)
    setOcrError(null)
    try {
      const result = await recognizePlate(image)
      setText(result)
      return result
    } catch (err) {
      setOcrError(`Error OCR: ${err.message}`)
      return ''
    } finally {
      setProcessing(false)
    }
  }, [])

  return { text, isProcessing, ocrError, runOCR }
}
