# Copiloto de Fiscalización — Especificación del Proyecto

## Kiroween 2026 · Categoría: Frankenstein

---

## 1. Visión general

**Copiloto de Fiscalización** es una PWA móvil que permite a inspectores de tránsito escanear la placa de un vehículo con la cámara del dispositivo, extraer el número usando OCR local (Tesseract.js) y consultar en tiempo real el estado del vehículo contra una API REST alojada en AWS Lambda.

La categoría Frankenstein implica combinar piezas que "no deberían funcionar juntas": OCR en el navegador (sin servidor de visión), lógica serverless en AWS, y capacidades offline de PWA.

---

## 2. Objetivos funcionales

| ID  | Requisito |
|-----|-----------|
| F-01 | El usuario puede activar la cámara trasera y capturar un fotograma. |
| F-02 | Tesseract.js procesa el fotograma localmente y extrae el texto de la placa. |
| F-03 | El texto extraído es editable antes de enviarlo. |
| F-04 | La app consulta la API Lambda con la placa y muestra el resultado. |
| F-05 | La app funciona como PWA: instalable, con ícono y splash screen. |
| F-06 | Si no hay conexión, el resultado se encola y se envía al recuperar red. |
| F-07 | El historial de consultas se persiste en IndexedDB. |

---

## 3. Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     Navegador / PWA                     │
│                                                         │
│  ┌──────────┐   frame   ┌─────────────┐                 │
│  │  Camera  │ ────────► │ Tesseract.js│  (Web Worker)   │
│  │  (WebRTC)│           │   OCR       │                 │
│  └──────────┘           └──────┬──────┘                 │
│                                │ texto placa            │
│                         ┌──────▼──────┐                 │
│                         │  PlateForm  │  (editable)     │
│                         └──────┬──────┘                 │
│                                │ submit                 │
│                    ┌───────────▼────────────┐           │
│                    │   usePlateQuery hook   │           │
│                    │  (React Query + fetch) │           │
│                    └───────────┬────────────┘           │
│                                │                        │
│                    ┌───────────▼────────────┐           │
│                    │   Service Worker       │           │
│                    │  (offline queue)       │           │
│                    └───────────┬────────────┘           │
└────────────────────────────────┼────────────────────────┘
                                 │ HTTPS
                    ┌────────────▼────────────┐
                    │   API Gateway (AWS)     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   AWS Lambda            │
                    │   (Node.js 20.x)        │
                    │   handler: queryPlate   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   DynamoDB / RDS        │
                    │   (padrón vehicular)    │
                    └─────────────────────────┘
```

### 3.1 Frontend (React + Vite)

- **Framework:** React 18 con Vite como bundler.
- **PWA:** `vite-plugin-pwa` con Workbox para service worker y manifiesto.
- **OCR:** Tesseract.js v5 ejecutado en un Web Worker dedicado para no bloquear el hilo principal.
- **Estado del servidor:** TanStack Query (React Query) para caché, reintentos y estado de carga.
- **Estado local:** Zustand para el estado global de la sesión (placa activa, historial).
- **UI:** Tailwind CSS + shadcn/ui.
- **Routing:** React Router v6.

### 3.2 Backend (AWS Serverless)

- **API Gateway:** endpoint `POST /plate/query`.
- **Lambda:** función `queryPlate` en Node.js 20.x.
  - Valida el formato de placa (regex).
  - Consulta la base de datos del padrón vehicular.
  - Retorna: propietario, estado técnico, multas pendientes, SOAT.
- **Base de datos:** DynamoDB (clave: `plateId`) o RDS Aurora Serverless según volumen.
- **Auth:** API Key en header `x-api-key` para el hackatón; JWT en producción.

### 3.3 Service Worker y offline

- Estrategia **Network First** para la consulta de placas.
- Si la red falla, la consulta se encola en IndexedDB y se reintenta con `Background Sync`.
- Assets estáticos con estrategia **Cache First**.

---

## 4. Estructura de carpetas

```
copiloto-fiscalizacion/
├── spec.md                          ← este archivo
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── robots.txt
├── src/
│   ├── main.jsx                     ← entry point
│   ├── App.jsx                      ← router raíz
│   ├── sw.js                        ← service worker (Workbox)
│   ├── assets/
│   ├── components/
│   │   ├── CameraView/
│   │   │   ├── CameraView.jsx       ← acceso WebRTC, captura de frame
│   │   │   └── CameraView.css
│   │   ├── PlateForm/
│   │   │   ├── PlateForm.jsx        ← muestra/edita texto OCR, dispara consulta
│   │   │   └── PlateForm.css
│   │   ├── ResultCard/
│   │   │   ├── ResultCard.jsx       ← renderiza resultado de la API
│   │   │   └── ResultCard.css
│   │   └── ui/                      ← componentes genéricos (Button, Spinner…)
│   ├── hooks/
│   │   ├── useCamera.js             ← gestión de stream y captura
│   │   ├── useOCR.js                ← wrapper de Tesseract.js Worker
│   │   └── usePlateQuery.js         ← TanStack Query para POST /plate/query
│   ├── pages/
│   │   ├── ScanPage.jsx             ← flujo principal: cámara → OCR → resultado
│   │   ├── HistoryPage.jsx          ← historial desde IndexedDB
│   │   └── SettingsPage.jsx         ← URL de API, ajustes
│   ├── services/
│   │   ├── api.js                   ← fetch wrapper con base URL y headers
│   │   ├── ocrWorker.js             ← Tesseract Worker singleton
│   │   └── db.js                    ← IndexedDB via idb (historial + cola offline)
│   ├── store/
│   │   └── sessionStore.js          ← Zustand: estado de sesión
│   └── utils/
│       ├── plateValidator.js        ← regex para formatos de placa
│       └── imagePreprocess.js       ← recorte y contraste para mejorar OCR
├── lambda/
│   ├── queryPlate/
│   │   ├── handler.js               ← lógica principal Lambda
│   │   ├── validator.js             ← validación de entrada
│   │   └── dbClient.js              ← cliente DynamoDB/RDS
│   └── package.json
├── .kiro/
│   └── steering/
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 5. Flujo de usuario principal

```
1. Abrir app  →  ScanPage
2. Pulsar "Activar cámara"  →  useCamera inicia stream
3. Pulsar "Capturar"  →  frame PNG en canvas
4. useOCR procesa el frame  →  texto extraído
5. PlateForm muestra texto  →  usuario confirma o edita
6. Pulsar "Consultar"  →  usePlateQuery hace POST /plate/query
7. ResultCard muestra propietario, multas, SOAT
8. Consulta se guarda en IndexedDB (historial)
```

---

## 6. Contrato de la API

### `POST /plate/query`

**Request**
```json
{
  "plate": "ABC-1234"
}
```

**Response 200**
```json
{
  "plate": "ABC-1234",
  "owner": "Juan Pérez",
  "status": "active",
  "technicalReview": {
    "valid": true,
    "expiresAt": "2025-11-30"
  },
  "soat": {
    "valid": true,
    "expiresAt": "2025-08-15"
  },
  "pendingFines": 2,
  "fineAmountUSD": 150.00
}
```

**Response 404**
```json
{ "error": "PLATE_NOT_FOUND", "message": "Placa no registrada." }
```

**Response 422**
```json
{ "error": "INVALID_PLATE_FORMAT", "message": "Formato de placa inválido." }
```

---

## 7. Variables de entorno

```
# .env.example
VITE_API_BASE_URL=https://<id>.execute-api.<region>.amazonaws.com/prod
VITE_API_KEY=<tu-api-key>
```

---

## 8. Stack de tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Bundler | Vite | 5.x |
| UI framework | React | 18.x |
| PWA | vite-plugin-pwa + Workbox | 0.20.x |
| OCR | Tesseract.js | 5.x |
| Data fetching | TanStack Query | 5.x |
| Estado global | Zustand | 4.x |
| Estilos | Tailwind CSS + shadcn/ui | 3.x |
| Routing | React Router | 6.x |
| Persistencia local | idb | 8.x |
| Serverless | AWS Lambda + API Gateway | Node 20.x |
| Base de datos | AWS DynamoDB | — |
| IaC (opcional) | AWS SAM / Serverless Framework | — |

---

## 9. Criterios de aceptación (hackatón)

- [ ] La cámara abre y captura un fotograma en dispositivo móvil real.
- [ ] Tesseract extrae texto de una placa en menos de 5 segundos.
- [ ] La consulta a Lambda devuelve respuesta en menos de 2 segundos (p95).
- [ ] La app es instalable como PWA en Android/iOS.
- [ ] Sin conexión, la consulta se encola y se ejecuta al volver la red.
- [ ] El historial persiste entre sesiones.
- [ ] No se envían imágenes al servidor; el OCR es 100 % local.

---

## 10. Decisiones de diseño clave

**¿Por qué OCR local?** Elimina latencia de red para el paso de visión, reduce costos y protege la privacidad del conductor: la imagen nunca sale del dispositivo.

**¿Por qué Tesseract.js en Web Worker?** El reconocimiento OCR puede tardar 2-4 segundos. Ejecutarlo fuera del hilo principal evita que la UI se congele.

**¿Por qué DynamoDB?** El patrón de acceso es simple (clave única por placa), el volumen en un hackatón es bajo, y la latencia de DynamoDB es sub-milisegundo en lectura con caché DAX.

**¿Por qué no enviar la imagen al servidor?** Banda ancha en campo puede ser limitada; el OCR local reduce la carga a unos pocos bytes de texto.
