import { api } from './client';

// Firmas listas para la tarjeta de login; todavía no se usan en ninguna pantalla.
// Las rutas cuelgan directo de la URL base (/api/v1), sin prefijo.
const ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  ME: '/me',
};

// Responde { token, user }.
export function login({ user, password }) {
  return api.post(ENDPOINTS.LOGIN, { user, password });
}

// Responde { token, user }.
export function register({ user, email, password, passwordConfirmation }) {
  return api.post(ENDPOINTS.REGISTER, {
    user,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
}

// Responde 204 sin cuerpo.
export function logout() {
  return api.delete(ENDPOINTS.LOGOUT);
}

// Responde { id, user, email, admin }.
export function me() {
  return api.get(ENDPOINTS.ME);
}
