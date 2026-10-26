import { api } from './client';

// Firmas listas para la tarjeta de login; todavía no se usan en ninguna pantalla.
const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

export function login({ email, password }) {
  return api.post(ENDPOINTS.LOGIN, { email, password });
}

export function register({ name, email, password, passwordConfirmation }) {
  return api.post(ENDPOINTS.REGISTER, {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
}

export function logout() {
  return api.delete(ENDPOINTS.LOGOUT);
}

export function me() {
  return api.get(ENDPOINTS.ME);
}
