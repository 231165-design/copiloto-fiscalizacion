import { useEffect, useState } from 'react'
import { getHistory, clearHistory } from '../services/db.js'

export default function HistoryPage() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    getHistory().then(setEntries)
  }, [])

  async function handleClear() {
    await clearHistory()
    setEntries([])
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">Historial</h1>
        {entries.length > 0 && (
          <button onClick={handleClear} className="text-xs text-red-400 underline">
            Borrar todo
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <p className="text-slate-500 text-sm mt-8 text-center">No hay consultas aún.</p>
      )}

      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="bg-slate-800 rounded-lg px-4 py-3">
            <div className="flex justify-between">
              <span className="font-mono font-bold">{e.plate}</span>
              <span className="text-xs text-slate-500">{new Date(e.timestamp).toLocaleString()}</span>
            </div>
            {e.result?.owner && (
              <p className="text-sm text-slate-400">{e.result.owner}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
