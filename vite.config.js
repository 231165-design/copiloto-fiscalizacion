import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'robots.txt'],
      manifest: {
        name: 'Copiloto de Fiscalización',
        short_name: 'Fiscaliza',
        description: 'Escanea placas vehiculares y consulta el estado del vehículo.',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/plate'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'plate-api-cache',
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    // Fuerza a Vite a pre-empaquetar Tesseract.js (paquete CJS)
    // para que sea consumible como módulo ESM desde el navegador.
    include: ['tesseract.js']
  }
})
