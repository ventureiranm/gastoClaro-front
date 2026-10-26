# GastoClaro · front-end

Front-end de GastoClaro (TP de Programación IV): aplicación de gastos personales que consume la
API REST en Ruby on Rails, que vive en otro repositorio.

## Requisitos

- Node.js 20.19 o superior (probado con Node 24)

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajustá VITE_API_URL si tu API corre en otra dirección
npm run dev            # http://localhost:5173 (falla si el puerto está ocupado)
```

## Scripts

| Script                 | Qué hace                                   |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Servidor de desarrollo en el puerto 5173   |
| `npm run build`        | Build de producción en `dist/`             |
| `npm run lint`         | ESLint sin tolerar advertencias            |
| `npm run format`       | Formatea todo con Prettier                 |
| `npm run format:check` | Verifica el formato sin modificar archivos |
| `npm test`             | Corre las pruebas una vez (Vitest)         |
| `npm run test:watch`   | Pruebas en modo observación                |

Antes de cada commit, Husky corre lint-staged: ESLint y Prettier sobre los archivos en stage.

## Estructura

```
src/
  api/          solo habla con la API, no sabe nada de React
  hooks/        decide de dónde sale el dato y maneja los estados de carga y error
  pages/        las pantallas
  components/   componentes reutilizables; no saben de dónde viene el dato
  config/       constantes con nombre
  locales/      todos los textos
```

Reglas del proyecto:

- `src/api/tokenStorage.js` es el único archivo que toca `localStorage` (ESLint lo hace cumplir).
- Ningún texto visible se escribe en un componente: todo sale de `src/locales/es.json`.
- Nada de números sueltos: los límites viven en `src/config/constants.js`.
- Ninguna URL ni clave en el código: van en `.env` (que no se sube).
