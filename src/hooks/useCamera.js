import { useRef, useState, useCallback } from 'react'

/**
 * Gestiona el stream de la cámara trasera y la captura de fotogramas.
 *
 * @returns {{
 *   videoRef: React.RefObject,
 *   canvasRef: React.RefObject,
 *   isStreaming: boolean,
 *   error: string|null,
 *   startCamera: () => Promise<void>,
 *   stopCamera: () => void,
 *   captureFrame: () => string|null   // dataURL PNG
 * }}
 */
export function useCamera() {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError]            = useState(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsStreaming(true)
    } catch (err) {
      setError(`No se pudo acceder a la cámara: ${err.message}`)
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setIsStreaming(false)
  }, [])

  const captureFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !isStreaming) return null

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/png')
  }, [isStreaming])

  return { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureFrame }
}
