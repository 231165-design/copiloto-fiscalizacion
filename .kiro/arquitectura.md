# Contexto de Arquitectura para Kiro

## Stack Tecnológico
- **Frontend:** React + Vite + Tailwind CSS (PWA)
- **OCR Local:** Tesseract.js (funciona sin internet para leer placas)
- **Backend:** AWS Lambda (Node.js) + API Gateway
- **Base de Datos:** Amazon DynamoDB (simulada localmente con mock-api.js para la demo)

## Reglas de Desarrollo
- El OCR debe ejecutarse en el dispositivo del sereno para garantizar respuesta en < 2 segundos.
- La API en AWS solo se usa para consultar la base de datos de multas.
- La interfaz debe ser accesible en celulares (mobile-first) y tener botones grandes para uso en la calle.