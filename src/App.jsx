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
      <div className="flex flex-col min-h-screen bg-slate-950 text-white">

        {/* Barra superior institucional */}
        <header className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
            <ScanLine size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase">Sistema de Fiscalización</p>
            <p className="text-sm font-bold leading-none">Copiloto Vehicular</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"         element={<ScanPage />}     />
            <Route path="/history"  element={<HistoryPage />}  />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Barra de navegación inferior */}
        <nav className="flex justify-around items-center h-16 bg-slate-900 border-t border-slate-800 safe-area-inset-bottom">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
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

      </div>
    </BrowserRouter>
  )
}
