import { vi } from 'vitest';

export const TEST_TOKEN = 'token-de-prueba';

export function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function apiErrors(...errors) {
  return { errors: errors.map(([field, message]) => ({ field, message })) };
}

// Reemplaza fetch por un mock que responde en orden. Un Error en la lista simula la red caída.
export function mockFetch(...responses) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockImplementationOnce(() =>
      response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
    );
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// Devuelve { url, method, headers, body } del pedido número `index`.
export function fetchCall(fetchMock, index = 0) {
  const [url, options] = fetchMock.mock.calls[index];
  return {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body === undefined ? undefined : JSON.parse(options.body),
  };
}
