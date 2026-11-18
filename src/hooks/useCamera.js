import { useRef, useState, useCallback } from 'react'

/**
 * Gestiona el stream de la cámara trasera y la captura de fotogramas.
 *
 * Problemas que este hook resuelve explícitamente:
 *
 * 1. React StrictMode monta los efectos dos veces en desarrollo.
 *    Un ref `isMounted` aborta la inicialización si el componente
 *    ya se desmontó mientras getUserMedia estaba en vuelo.
 *
 * 2. Llamar a play() inmediatamente después de asignar srcObject produce
 *    "play() interrupted by a new load request" porque el elemento <video>
 *    no ha terminado de cargar el stream. Esperamos el evento 'canplay'
 *    antes de llamar play().
 *
 * 3. Si ya existe un stream previo (doble llamada en StrictMode),
 *    lo detenemos antes de pedir uno nuevo.
 */
export function useCamera() {
  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const streamRef     = useRef(null)
  // Señala si la última llamada a startCamera sigue vigente.
  // Se pone a false en stopCamera o cuando el componente se desmonta.
  const isMountedRef  = useRef(false)

  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError]            = useState(null)

  const startCamera = useCallback(async () => {
    // Marcar esta invocación como la activa
    isMountedRef.current = true
    setError(null)

    // Si ya hay un stream anterior (p.ej. doble llamada en StrictMode),
    // lo cerramos antes de pedir uno nuevo.
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
    } catch (err) {
      // Solo actualizamos el estado si seguimos montados
      if (isMountedRef.current) {
        setError(`No se pudo acceder a la cámara: ${err.message}`)
      } else {
        // Llegó tarde; liberamos el stream y salimos silenciosamente
        stream?.getTracks().forEach((t) => t.stop())
      }
      return
    }

    // Si el componente se desmontó mientras esperábamos getUserMedia,
    // liberamos el stream y no tocamos el estado de React.
    if (!isMountedRef.current) {
      stream.getTracks().forEach((t) => t.stop())
      return
    }

    streamRef.current = stream
    const video = videoRef.current

    if (!video) return

    // Asignar srcObject dispara la carga; esperamos 'canplay' para llamar
    // play(), evitando "play() interrupted by a new load request".
    video.srcObject = stream

    await new Promise((resolve, reject) => {
      const onCanPlay = () => {
        video.removeEventListener('canplay', onCanPlay)
        video.removeEventListener('error',   onError)
        resolve()
      }
      const onError = (e) => {
        video.removeEventListener('canplay', onCanPlay)
        video.removeEventListener('error',   onError)
        reject(e)
      }
      video.addEventListener('canplay', onCanPlay)
      video.addEventListener('error',   onError)
    })

    // Verificación final: el componente puede haberse desmontado mientras
    // esperábamos 'canplay'.
    if (!isMountedRef.current) {
      stream.getTracks().forEach((t) => t.stop())
      video.srcObject = null
      return
    }

    try {
      await video.play()
    } catch (err) {
      // AbortError es inocuo: significa que stopCamera() llegó primero.
      if (err.name !== 'AbortError' && isMountedRef.current) {
        setError(`Error al reproducir video: ${err.message}`)
      }
      return
    }

    if (isMountedRef.current) {
      setIsStreaming(true)
    }
  }, []) // sin dependencias — las refs no necesitan estar en el array

  const stopCamera = useCallback(() => {
    // Señalamos que esta invocación de startCamera ya no es válida
    isMountedRef.current = false

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

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
