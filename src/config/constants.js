// La URL de la API sale del entorno (.env); nunca se escribe en el código.
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
};

export const TOKEN_STORAGE_KEY = 'gastoclaro.token';

// Campo que usa la API para los errores que no pertenecen a un campo puntual.
export const BASE_ERROR_FIELD = 'base';

export const HTTP_STATUS = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_CONTENT: 422,
};

// Status que usa ApiError cuando no hubo respuesta (red caída o tiempo agotado).
export const NETWORK_ERROR_STATUS = 0;

export const REQUEST_TIMEOUT_MS = 15000;

// Cuánto tiempo queda a la vista un aviso de confirmación (toast) si nadie lo cierra antes. Los
// avisos de error no se cierran solos: quedan hasta que se cierran o se vuelve a enviar.
export const TOAST_DURATION_MS = 4000;

export const TOAST_TONE = {
  SUCCESS: 'success',
  ERROR: 'error',
};

// Validar la sesión guardada con GET /me al arrancar la app: así, al recargar la página, se
// recupera el usuario del token. Si el token ya no sirve, el 401 cierra la sesión.
export const VALIDATE_SESSION_ON_START = true;

// Límites de los formularios. Deben coincidir con las validaciones del back-end.
export const PASSWORD_MIN_LENGTH = 8;
// El monto de un gasto tiene que ser estrictamente mayor que este valor. La fecha de un gasto no
// puede ser posterior a hoy.
export const AMOUNT_MIN_EXCLUSIVE = 0;

// Montos y fechas se muestran con formato argentino: punto para los miles, coma para los decimales.
export const LOCALE = 'es-AR';
export const CURRENCY = 'ARS';
export const AMOUNT_MAX_DECIMALS = 2;

// Códigos de canal de compra que acepta la API. Las etiquetas visibles están en es.json.
export const PURCHASE_CHANNELS = ['presencial', 'delivery', 'retiro'];
