import { useState } from 'react'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL ?? '')
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_API_KEY ?? '')
  const [saved, setSaved]   = useState(false)

  function handleSave(e) {
    e.preventDefault()
    // En producción estos valores vendrían de variables de entorno en build.
    // Durante desarrollo se pueden guardar en sessionStorage para pruebas rápidas.
    sessionStorage.setItem('apiBaseUrl', apiUrl)
    sessionStorage.setItem('apiKey', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-bold">Ajustes</h1>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">URL base de la API</span>
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://…execute-api…amazonaws.com/prod"
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-500 outline-none text-sm"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">API Key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="••••••••"
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-500 outline-none text-sm"
        />
      </label>

      <button type="submit" className="px-6 py-3 bg-blue-600 rounded-full font-semibold">
        {saved ? '¡Guardado!' : 'Guardar'}
      </button>
    </form>
  )
}
