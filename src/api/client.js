import {
  API_BASE_URL,
  BASE_ERROR_FIELD,
  HTTP_STATUS,
  NETWORK_ERROR_STATUS,
  REQUEST_TIMEOUT_MS,
} from '../config/constants';
import { getToken } from './tokenStorage';

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// Error uniforme para cualquier respuesta fallida. `errors` respeta el formato de la API:
// [{ field, message }]. Si no hubo respuesta (red o tiempo agotado), status vale
// NETWORK_ERROR_STATUS y errors viene vacío.
export class ApiError extends Error {
  constructor(status, errors = [], options) {
    super(errors[0]?.message ?? `API error ${status}`, options);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  get isNetworkError() {
    return this.status === NETWORK_ERROR_STATUS;
  }

  get isUnauthorized() {
    return this.status === HTTP_STATUS.UNAUTHORIZED;
  }
}

async function parseBody(response) {
  if (response.status === HTTP_STATUS.NO_CONTENT) return null;
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildSignal(signal) {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

export async function request(path, { method = 'GET', body, headers, signal } = {}) {
  if (!API_BASE_URL) {
    throw new Error('Falta VITE_API_URL: copiá .env.example a .env.');
  }

  const finalHeaders = { ...DEFAULT_HEADERS, ...headers };
  const token = getToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: buildSignal(signal),
    });
  } catch (cause) {
    // Una cancelación pedida por quien llama no es un error de red: se propaga tal cual.
    if (cause?.name === 'AbortError') throw cause;
    throw new ApiError(NETWORK_ERROR_STATUS, [], { cause });
  }

  const data = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, Array.isArray(data?.errors) ? data.errors : []);
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

// Convierte un error de la API en lo que consume un formulario:
//   { fieldErrors: { amount: ['debe ser mayor a 0'] }, baseErrors: ['...'] }
// Los mensajes ya vienen en español. Si el error no trae mensajes (red, 500 sin cuerpo),
// ambos quedan vacíos y el formulario muestra su mensaje genérico.
export function toFormErrors(error) {
  const result = { fieldErrors: {}, baseErrors: [] };
  const errors = error instanceof ApiError ? error.errors : [];

  for (const { field, message } of errors) {
    if (!field || field === BASE_ERROR_FIELD) {
      result.baseErrors.push(message);
    } else {
      (result.fieldErrors[field] ??= []).push(message);
    }
  }
  return result;
}
