import { RotateCcw, ShieldCheck } from 'lucide-react'
import CameraView  from '../components/CameraView/CameraView.jsx'
import PlateForm   from '../components/PlateForm/PlateForm.jsx'
import ResultCard  from '../components/ResultCard/ResultCard.jsx'
import { useSessionStore } from '../store/sessionStore.js'

export default function ScanPage() {
  const resetScan    = useSessionStore((s) => s.resetScan)
  const lastResult   = useSessionStore((s) => s.lastResult)

  return (
    <div className="flex flex-col gap-0 pb-6">

      {/* Cabecera de página */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-400" />
          <h1 className="text-base font-bold tracking-wide">Escanear Placa</h1>
        </div>

        {lastResult && (
          <button
            onClick={resetScan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       text-slate-400 bg-slate-800 border border-slate-700
                       hover:text-white hover:bg-slate-700 hover:border-slate-500
                       transition-all duration-200 active:scale-95"
          >
            <RotateCcw size={13} />
            Limpiar
          </button>
        )}
      </div>

      <CameraView />
      <PlateForm />
      <ResultCard />

    </div>
  )
}
