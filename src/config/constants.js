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
};

// Status que usa ApiError cuando no hubo respuesta (red caída o tiempo agotado).
export const NETWORK_ERROR_STATUS = 0;

export const REQUEST_TIMEOUT_MS = 15000;

// Deben coincidir con las validaciones del back-end.
export const PASSWORD_MIN_LENGTH = 8;
