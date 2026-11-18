import { useEffect } from 'react'
import { Camera, Loader2, AlertCircle } from 'lucide-react'
import { useCamera }        from '../../hooks/useCamera.js'
import { useOCR }           from '../../hooks/useOCR.js'
import { preprocessForOCR } from '../../utils/imagePreprocess.js'
import { useSessionStore }  from '../../store/sessionStore.js'

export default function CameraView() {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureFrame } = useCamera()
  const { isProcessing, ocrError, runOCR } = useOCR()
  const setActivePlate = useSessionStore((s) => s.setActivePlate)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  async function handleCapture() {
    const dataUrl = captureFrame()
    if (!dataUrl) return
    const img = new Image()
    img.src = dataUrl
    await new Promise((res) => { img.onload = res })
    const aux = document.createElement('canvas')
    aux.width  = img.naturalWidth
    aux.height = img.naturalHeight
    aux.getContext('2d').drawImage(img, 0, 0)
    const processed = preprocessForOCR(aux)
    const text = await runOCR(processed)
    setActivePlate(text)
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full">

      {/* Visor de cámara
          .camera-viewport  → aspect-ratio 4:3, max-height 38 vh (42 vh en ≥640 px)
          El <video> llena el contenedor con object-fit:cover (definido en index.css). */}
      <div className="camera-viewport rounded-2xl
                      border-2 border-blue-500/70
                      shadow-[0_0_24px_rgba(59,130,246,0.25)]
                      bg-slate-900">

        <video ref={videoRef} playsInline muted autoPlay />

        {/* Overlay oscuro con recorte central */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Regiones oscuras arriba y abajo */}
          <div className="absolute top-0 left-0 right-0 h-[28%] bg-black/50" />
          <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-black/50" />

          {/* Visor central con esquinas decorativas */}
          <div className="absolute inset-x-[8%] top-[28%] bottom-[28%]">

            {/* Esquinas — top-left */}
            <span className="animate-corner-pulse absolute top-0 left-0 w-6 h-6
                             border-t-[3px] border-l-[3px] border-blue-400 rounded-tl-md" />
            {/* top-right */}
            <span className="animate-corner-pulse absolute top-0 right-0 w-6 h-6
                             border-t-[3px] border-r-[3px] border-blue-400 rounded-tr-md" />
            {/* bottom-left */}
            <span className="animate-corner-pulse absolute bottom-0 left-0 w-6 h-6
                             border-b-[3px] border-l-[3px] border-blue-400 rounded-bl-md" />
            {/* bottom-right */}
            <span className="animate-corner-pulse absolute bottom-0 right-0 w-6 h-6
                             border-b-[3px] border-r-[3px] border-blue-400 rounded-br-md" />

            {/* Línea de escaneo */}
            <div className="animate-scan absolute left-1 right-1 h-[2px]
                            bg-gradient-to-r from-transparent via-blue-400 to-transparent
                            shadow-[0_0_8px_2px_rgba(96,165,250,0.6)]" />
          </div>

          {/* Texto guía */}
          <p className="absolute bottom-3 left-0 right-0 text-center text-[11px]
                        text-slate-300/80 font-medium tracking-widest uppercase">
            Encuadre la placa en el visor
          </p>
        </div>

        {/* Estado "sin stream" — placeholder antes de que arranque la cámara */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-2">
            <Loader2 size={32} className="text-blue-400 animate-spin" />
            <p className="text-xs text-slate-400">Iniciando cámara…</p>
          </div>
        )}
      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error de cámara */}
      {error && (
        <div className="flex items-center gap-2 w-full max-w-sm px-3 py-2.5
                        rounded-xl bg-red-950/60 border border-red-700/50 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Botón Capturar */}
      <button
        onClick={handleCapture}
        disabled={!isStreaming || isProcessing}
        className="w-full max-w-sm flex items-center justify-center gap-2.5
                   py-4 rounded-2xl font-bold text-base tracking-wide
                   bg-blue-700 hover:bg-blue-600 active:bg-blue-800
                   shadow-[0_4px_20px_rgba(37,99,235,0.45)]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-[0.98]"
      >
        {isProcessing
          ? <><Loader2 size={20} className="animate-spin" /> Procesando OCR…</>
          : <><Camera size={20} /> Capturar placa</>
        }
      </button>

      {/* Error OCR */}
      {ocrError && (
        <div className="flex items-center gap-2 w-full max-w-sm px-3 py-2.5
                        rounded-xl bg-red-950/60 border border-red-700/50 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {ocrError}
        </div>
      )}

    </div>
  )
}
