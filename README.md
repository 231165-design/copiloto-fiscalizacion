# Copiloto de Fiscalización

PWA móvil para escanear placas vehiculares con OCR local (Tesseract.js) y consultar su estado contra una API serverless en AWS.

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Levantar el frontend](#2-levantar-el-frontend)
3. [Desplegar el backend en AWS con SAM](#3-desplegar-el-backend-en-aws-con-sam)
4. [Probar la Lambda localmente](#4-probar-la-lambda-localmente)
5. [Cargar datos de prueba en DynamoDB](#5-cargar-datos-de-prueba-en-dynamodb)
6. [Conectar el frontend con la API real](#6-conectar-el-frontend-con-la-api-real)
7. [Verificar la integración end-to-end](#7-verificar-la-integración-end-to-end)
8. [Referencia rápida de comandos](#8-referencia-rápida-de-comandos)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| AWS CLI | 2.x | `aws --version` |
| AWS SAM CLI | 1.118+ | `sam --version` |
| Cuenta AWS | — | acceso a Lambda, API Gateway, DynamoDB |

### Configurar credenciales AWS

```bash
aws configure
# AWS Access Key ID:     <tu-access-key>
# AWS Secret Access Key: <tu-secret-key>
# Default region name:   us-east-1          ← o la región que prefieras
# Default output format: json
```

> Si usas SSO o múltiples perfiles, agrega `--profile <nombre>` a cada comando `sam`.

---

## 2. Levantar el frontend

```bash
# En la raíz del proyecto
npm install
npm run dev
# → http://localhost:5173
```

---

## 3. Desplegar el backend en AWS con SAM

Todos los comandos se ejecutan desde la carpeta **`lambda/`**.

```bash
cd lambda
npm install          # instala @aws-sdk/client-dynamodb y @aws-sdk/util-dynamodb
```

### 3.1 Compilar

```bash
sam build
```

SAM empaqueta `queryPlate/` y sus dependencias en `.aws-sam/build/`.

### 3.2 Desplegar (primera vez)

```bash
sam deploy --guided
```

El asistente interactivo te pregunta:

| Pregunta | Valor recomendado |
|---|---|
| Stack Name | `copiloto-fiscalizacion` |
| AWS Region | `us-east-1` (o tu región) |
| Parameter StageName | `prod` |
| Confirm changes before deploy | `Y` |
| Allow SAM to create IAM roles | `Y` |
| Save arguments to config file | `Y` → guarda en `samconfig.toml` |

Al terminar, SAM imprime los **Outputs**:

```
Key         ApiBaseUrl
Value       https://abc123def.execute-api.us-east-1.amazonaws.com/prod
            ↑ copia esta URL

Key         ApiKeyId
Value       a1b2c3d4e5          ← usa este ID en el paso siguiente
```

### 3.3 Obtener el valor de la API Key

```bash
aws apigateway get-api-key \
  --api-key <ApiKeyId-del-output> \
  --include-value \
  --query 'value' \
  --output text
# → imprime algo como: AbCdEfGhIjKlMnOpQrStUvWxYz012345
```

Guarda ese valor; lo necesitas en el paso 6.

### 3.4 Despliegues posteriores

Una vez que `samconfig.toml` existe, solo necesitas:

```bash
sam build && sam deploy
```

---

## 4. Probar la Lambda localmente

SAM puede simular Lambda + API Gateway en tu máquina sin subir nada a AWS.

### 4.1 (Opcional) DynamoDB Local con Docker

```bash
docker run -d -p 8000:8000 amazon/dynamodb-local
```

Crea la tabla localmente:

```bash
aws dynamodb create-table \
  --table-name vehicles-prod \
  --attribute-definitions AttributeName=plateId,AttributeType=S \
  --key-schema AttributeName=plateId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

Carga datos de prueba contra DynamoDB Local:

```bash
TABLE=vehicles-prod DYNAMODB_ENDPOINT=http://localhost:8000 node seed-data.js
```

### 4.2 Levantar la API local

```bash
# Desde lambda/
sam build

# Con DynamoDB Local:
DYNAMODB_ENDPOINT=http://localhost:8000 sam local start-api --port 3001

# Sin DynamoDB Local (usa tu tabla real en AWS):
sam local start-api --port 3001
```

### 4.3 Enviar una petición de prueba

```bash
curl -X POST http://localhost:3001/plate/query \
  -H "Content-Type: application/json" \
  -d '{"plate": "ABC-1234"}'
```

Respuesta esperada:

```json
{
  "plateId": "ABC-1234",
  "owner": "Juan Pérez",
  "status": "active",
  "technicalReview": { "valid": true, "expiresAt": "2025-11-30" },
  "soat": { "valid": true, "expiresAt": "2025-08-15" },
  "pendingFines": 0,
  "fineAmountUSD": 0
}
```

> En local, `sam local start-api` no valida la API Key. En AWS sí es obligatoria.

---

## 5. Cargar datos de prueba en DynamoDB (AWS)

Una vez desplegada la tabla real:

```bash
cd lambda
TABLE=vehicles-prod node seed-data.js
```

El script inserta tres vehículos de prueba:

| Placa | Propietario | Estado | Multas |
|---|---|---|---|
| `ABC-1234` | Juan Pérez | Activo, todo al día | 0 |
| `XYZ-9876` | María González | Activo, revisión técnica vencida | 2 ($150) |
| `PQR-456` | Carlos Ruiz | Suspendido, SOAT y revisión vencidos | 5 ($420) |

---

## 6. Conectar el frontend con la API real

### 6.1 Crear el archivo `.env`

Copia la plantilla en la raíz del proyecto:

```bash
# En la raíz (no en lambda/)
cp .env.example .env
```

### 6.2 Completar los valores

Abre `.env` y pega los valores que obtuviste en los pasos 3.2 y 3.3:

```env
VITE_API_BASE_URL=https://abc123def.execute-api.us-east-1.amazonaws.com/prod
VITE_API_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz012345
```

**Reglas importantes:**
- El archivo `.env` **nunca** debe subirse a Git. Está en `.gitignore` por defecto (si no lo está, agrégalo).
- `VITE_` es el prefijo requerido por Vite para exponer la variable al navegador. Sin ese prefijo, `import.meta.env.VITE_API_KEY` devuelve `undefined`.
- La API Key viaja en el header `x-api-key` de cada petición; no aparece en la URL.

### 6.3 Reiniciar el servidor de desarrollo

Vite solo lee `.env` al arrancar, no en caliente:

```bash
npm run dev
```

---

## 7. Verificar la integración end-to-end

1. Abre `http://localhost:5173`.
2. Activa la cámara y captura (o escribe manualmente en el campo de placa).
3. Escribe `ABC-1234` y pulsa **Consultar placa**.
4. Deberías ver el `ResultCard` con los datos de Juan Pérez.

Para confirmar que la petición llega a AWS, abre la consola de AWS → **Lambda** → `copiloto-query-plate-prod` → pestaña **Monitor** → **View CloudWatch logs**.

### Errores comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `403 Forbidden` | API Key incorrecta o ausente | Revisa `VITE_API_KEY` en `.env` y reinicia `npm run dev` |
| `404` en la consulta | La URL base no termina en `/prod` o la ruta es distinta | Copia el Output `ApiBaseUrl` exactamente |
| `CORS error` en el navegador | La Lambda no devuelve headers CORS | Verifica que `sam deploy` terminó sin errores; revisa `handler.js` |
| `PLATE_NOT_FOUND` | Placa no está en DynamoDB | Ejecuta `seed-data.js` contra la tabla correcta |
| Variable `undefined` en runtime | Falta prefijo `VITE_` o no reiniciaste el servidor | Reinicia `npm run dev` tras editar `.env` |

---

## 8. Referencia rápida de comandos

```bash
# Frontend
npm run dev               # desarrollo local
npm run build             # build de producción (genera dist/)
npm run preview           # preview del build

# Backend (desde lambda/)
sam build                 # compila y empaqueta
sam deploy                # despliega a AWS (usa samconfig.toml)
sam local start-api --port 3001   # API local para pruebas

# DynamoDB
TABLE=vehicles-prod node seed-data.js                        # seed en AWS
TABLE=vehicles-prod DYNAMODB_ENDPOINT=http://localhost:8000 node seed-data.js  # seed local

# Ver API Key
aws apigateway get-api-key --api-key <ID> --include-value --query 'value' --output text

# Ver logs Lambda en tiempo real
aws logs tail /aws/lambda/copiloto-query-plate-prod --follow
```
