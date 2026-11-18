import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ScanLine, ClockArrowUp, Settings2 } from 'lucide-react'
import ScanPage     from './pages/ScanPage.jsx'
import HistoryPage  from './pages/HistoryPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

const NAV_ITEMS = [
  { to: '/',         label: 'Escanear',  Icon: ScanLine     },
  { to: '/history',  label: 'Historial', Icon: ClockArrowUp },
  { to: '/settings', label: 'Ajustes',   Icon: Settings2    },
]

export default function App() {
  return (
    <BrowserRouter>
      {/*
       * Layout de tres capas fijas:
       *   header  — fixed, top-0,    altura var(--header-h) = 56 px
       *   main    — scroll independiente, ocupa el espacio entre header y nav
       *   nav     — fixed, bottom-0, altura var(--nav-h) + safe-area-inset-bottom
       *
       * Usar position:fixed en header y nav garantiza que nunca se mueven
       * al hacer scroll, independientemente del contenido de <main>.
       * El <main> lleva padding-top y padding-bottom exactos para que su
       * primer y último elemento nunca queden bajo el chrome de la app.
       */}

      {/* ── Header fijo ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-30
                   flex items-center gap-3 px-4
                   bg-slate-900/95 backdrop-blur-sm border-b border-slate-800"
        style={{ height: 'var(--header-h)' }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shrink-0">
          <ScanLine size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase leading-none">
            Sistema de Fiscalización
          </p>
          <p className="text-sm font-bold leading-tight">Copiloto Vehicular</p>
        </div>
      </header>

      {/* ── Área de contenido con scroll ────────────────────────────────── */}
      <main
        className="overflow-y-auto bg-slate-950"
        style={{
          /*
           * top  = altura del header
           * bottom = altura de la nav + safe-area-inset-bottom de iOS
           * Así el scroll empieza y termina exactamente donde corresponde,
           * sin que ningún elemento quede oculto bajo el chrome fijo.
           */
          position: 'fixed',
          top:    'var(--header-h)',
          left:   0,
          right:  0,
          bottom: 'calc(var(--nav-h) + var(--nav-safe))',
        }}
      >
        <Routes>
          <Route path="/"         element={<ScanPage />}     />
          <Route path="/history"  element={<HistoryPage />}  />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* ── Nav fija en el fondo ─────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30
                   flex justify-around items-center
                   bg-slate-900/95 backdrop-blur-sm border-t border-slate-800"
        style={{
          height: 'calc(var(--nav-h) + var(--nav-safe))',
          paddingBottom: 'var(--nav-safe)',
        }}
      >
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-400 bg-blue-950/60'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </BrowserRouter>
  )
}
