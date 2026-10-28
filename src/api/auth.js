import { api } from './client';

// Las rutas cuelgan directo de la URL base (/api/v1), sin prefijo.
const ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  ME: '/me',
};

// Hacia adentro de la app el usuario es siempre { id, user, email, admin }. Hoy login y register
// devuelven `user` como string con el nombre de usuario; hay una propuesta para que pase a ser el
// objeto completo. Este es el único lugar que conoce esa diferencia. Lo que la API no trae queda
// en null.
function normalizeUser(raw) {
  if (raw && typeof raw === 'object') {
    const { id = null, user = null, email = null, admin = null } = raw;
    return { id, user, email, admin };
  }
  return { id: null, user: raw ?? null, email: null, admin: null };
}

function normalizeSession({ token, user }) {
  return { token, user: normalizeUser(user) };
}

// Usuario y email viajan sin espacios en los extremos; la contraseña va tal cual se escribió.

// Devuelve { token, user }.
export async function login({ user, password }) {
  return normalizeSession(await api.post(ENDPOINTS.LOGIN, { user: user.trim(), password }));
}

// Devuelve { token, user }.
export async function register({ user, email, password, passwordConfirmation }) {
  const session = await api.post(ENDPOINTS.REGISTER, {
    user: user.trim(),
    email: email.trim(),
    password,
    password_confirmation: passwordConfirmation,
  });
  return normalizeSession(session);
}

// Responde 204 sin cuerpo. Recibe el token explícito porque quien la llama ya borró la sesión
// local antes de avisarle al servidor.
export function logout(token) {
  return api.delete(ENDPOINTS.LOGOUT, { token });
}

// Devuelve el usuario del token.
export async function me({ signal } = {}) {
  return normalizeUser(await api.get(ENDPOINTS.ME, { signal }));
}
