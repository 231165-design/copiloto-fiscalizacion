import { useEffect, useState } from 'react'
import { Search, WifiOff, AlertTriangle } from 'lucide-react'
import { useSessionStore }  from '../../store/sessionStore.js'
import { usePlateQuery }    from '../../hooks/usePlateQuery.js'
import { validatePlate }    from '../../utils/plateValidator.js'

export default function PlateForm() {
  const activePlate   = useSessionStore((s) => s.activePlate)
  const setLastResult = useSessionStore((s) => s.setLastResult)
  const [input, setInput] = useState('')

  useEffect(() => { setInput(activePlate) }, [activePlate])

  const { mutate, isPending, error } = usePlateQuery()
  const { normalized, valid } = validatePlate(input)

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    mutate(normalized, { onSuccess: (data) => setLastResult(data) })
  }

  const isOfflineError = error?.code === 'OFFLINE'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 pt-4 w-full max-w-sm mx-auto">

      <label className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
        Número de placa
      </label>

      {/* Input de placa */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="ABC-1234"
          maxLength={8}
          className="w-full text-center text-3xl font-mono font-bold tracking-[0.25em]
                     px-4 py-4 rounded-2xl
                     bg-slate-800/80 border-2 border-slate-700
                     focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]
                     outline-none placeholder:text-slate-600
                     transition-all duration-200"
        />
        {/* Indicador de validez */}
        {input.length > 0 && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-colors ${
            valid ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
        )}
      </div>

      {/* Aviso formato */}
      {input.length > 0 && !valid && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl
                        bg-yellow-950/50 border border-yellow-700/50 text-yellow-300 text-xs">
          <AlertTriangle size={14} className="shrink-0" />
          Formato no reconocido — revisa la placa.
        </div>
      )}

      {/* Error de API */}
      {error && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm
          ${isOfflineError
            ? 'bg-orange-950/50 border border-orange-700/50 text-orange-300'
            : 'bg-red-950/50 border border-red-700/50 text-red-300'}`}
        >
          {isOfflineError
            ? <><WifiOff size={15} className="shrink-0" /> Sin conexión — la consulta se enviará cuando vuelva la red.</>
            : <><AlertTriangle size={15} className="shrink-0" /> {error.message}</>
          }
        </div>
      )}

      {/* Botón consultar */}
      <button
        type="submit"
        disabled={!valid || isPending}
        className="w-full flex items-center justify-center gap-2.5
                   py-4 rounded-2xl font-bold text-base tracking-wide
                   bg-gradient-to-r from-blue-700 to-blue-600
                   hover:from-blue-600 hover:to-blue-500
                   active:from-blue-800 active:to-blue-700
                   shadow-[0_4px_20px_rgba(37,99,235,0.4)]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-[0.98]"
      >
        {isPending
          ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Consultando…</>
          : <><Search size={20} /> Consultar placa</>
        }
      </button>

    </form>
  )
}
