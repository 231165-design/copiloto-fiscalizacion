import {
  CheckCircle2, XCircle, AlertTriangle, Car,
  User, ShieldCheck, FileText, ReceiptText
} from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore.js'

// ── Componentes internos ───────────────────────────────────────────────────────

function StatusBadge({ active }) {
  return active
    ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                       bg-green-500/15 text-green-400 border border-green-500/30">
        <CheckCircle2 size={13} /> ACTIVO
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                       bg-red-500/15 text-red-400 border border-red-500/30">
        <XCircle size={13} /> SUSPENDIDO
      </span>
    )
}

function InfoRow({ icon: Icon, label, children, warning }) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-700/60 last:border-0 ${warning ? 'opacity-100' : ''}`}>
      <div className="flex items-center gap-2.5 text-slate-400">
        <Icon size={16} className={warning ? 'text-yellow-400' : 'text-slate-500'} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-right">{children}</div>
    </div>
  )
}

function ValidBadge({ valid, expiresAt }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={`inline-flex items-center gap-1 text-xs font-semibold
        ${valid ? 'text-green-400' : 'text-red-400'}`}>
        {valid ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {valid ? 'Vigente' : 'Vencido'}
      </span>
      {expiresAt && (
        <span className="text-[11px] text-slate-500">vence {expiresAt}</span>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function ResultCard() {
  const result = useSessionStore((s) => s.lastResult)
  if (!result) return null

  const { plate, owner, status, technicalReview, soat, pendingFines, fineAmountUSD } = result
  const isActive = status === 'active'

  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden animate-slide-up
                    border border-slate-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

      {/* Cabecera de la tarjeta */}
      <div className={`px-4 py-4 flex items-center justify-between
        ${isActive ? 'bg-gradient-to-r from-blue-950 to-slate-900' : 'bg-gradient-to-r from-red-950 to-slate-900'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl
            ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
            <Car size={22} />
          </div>
          <div>
            <p className="font-mono text-2xl font-black tracking-[0.2em]">{plate}</p>
            <p className="text-xs text-slate-400 mt-0.5">Vehículo registrado</p>
          </div>
        </div>
        <StatusBadge active={isActive} />
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="bg-slate-900 px-4 divide-y divide-slate-700/60">

        <InfoRow icon={User} label="Propietario">
          <span className="text-sm font-semibold text-white">{owner}</span>
        </InfoRow>

        <InfoRow icon={ShieldCheck} label="Revisión técnica" warning={!technicalReview?.valid}>
          <ValidBadge valid={technicalReview?.valid} expiresAt={technicalReview?.expiresAt} />
        </InfoRow>

        <InfoRow icon={FileText} label="SOAT" warning={!soat?.valid}>
          <ValidBadge valid={soat?.valid} expiresAt={soat?.expiresAt} />
        </InfoRow>

        <InfoRow icon={ReceiptText} label="Multas pendientes" warning={pendingFines > 0}>
          {pendingFines > 0
            ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                  <AlertTriangle size={12} /> {pendingFines} multa{pendingFines > 1 ? 's' : ''}
                </span>
                <span className="text-sm font-bold text-red-300">${fineAmountUSD.toFixed(2)}</span>
              </div>
            )
            : <span className="text-sm font-semibold text-green-400">Sin multas</span>
          }
        </InfoRow>

      </div>

      {/* Footer — alerta si hay problemas */}
      {(!isActive || pendingFines > 0 || !technicalReview?.valid || !soat?.valid) && (
        <div className="bg-red-950/60 border-t border-red-800/50 px-4 py-3
                        flex items-center gap-2 text-red-300 text-xs font-semibold">
          <AlertTriangle size={14} className="shrink-0" />
          Este vehículo presenta irregularidades. Proceda según el protocolo.
        </div>
      )}

    </div>
  )
}
