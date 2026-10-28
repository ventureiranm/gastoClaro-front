import { act, screen } from '@testing-library/react';
import { api } from '../api/client';
import { getToken, saveToken } from '../api/tokenStorage';
import { ROUTES } from '../config/constants';
import es from '../locales/es.json';
import { apiErrors, fetchCall, jsonResponse, mockFetch, TEST_TOKEN } from '../test/api';
import { renderApp } from '../test/renderApp';

describe('Sesión', () => {
  it('logout llama a la API, limpia el token y vuelve al login', async () => {
    saveToken(TEST_TOKEN);
    const fetchMock = mockFetch(jsonResponse(204));
    const { user } = renderApp(ROUTES.DASHBOARD);

    await user.click(screen.getByRole('button', { name: es.nav.logout }));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(getToken()).toBeNull();
    const call = fetchCall(fetchMock);
    expect(call.url).toMatch(/\/logout$/);
    expect(call.method).toBe('DELETE');
    expect(call.headers.Authorization).toBe(`Bearer ${TEST_TOKEN}`);
  });

  it('logout cierra la sesión local aunque el servidor falle', async () => {
    saveToken(TEST_TOKEN);
    mockFetch(new TypeError('Failed to fetch'));
    const { user } = renderApp(ROUTES.DASHBOARD);

    await user.click(screen.getByRole('button', { name: es.nav.logout }));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(getToken()).toBeNull();
    expect(screen.queryByText(es.auth.sessionExpired)).not.toBeInTheDocument();
  });

  it('con token guardado, recargar mantiene al usuario adentro', () => {
    saveToken(TEST_TOKEN);
    mockFetch();
    renderApp(ROUTES.DASHBOARD);

    expect(screen.getByRole('heading', { name: es.dashboard.title })).toBeInTheDocument();
  });

  it('un 401 de cualquier endpoint cierra la sesión y avisa que venció', async () => {
    saveToken(TEST_TOKEN);
    mockFetch(
      jsonResponse(401, apiErrors(['base', 'No autorizado'])),
      jsonResponse(200, { token: 'token-nuevo', user: 'nico' }),
    );
    const { user } = renderApp(ROUTES.DASHBOARD);

    await act(() => api.get('/expenses').catch(() => {}));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(screen.getByText(es.auth.sessionExpired)).toBeInTheDocument();
    expect(getToken()).toBeNull();

    // Al volver a entrar, vuelve a la pantalla donde estaba y el aviso desaparece.
    await user.type(screen.getByLabelText(es.auth.user), 'nico');
    await user.type(screen.getByLabelText(es.auth.password), 'clave1234');
    await user.click(screen.getByRole('button', { name: es.login.submit }));

    expect(await screen.findByRole('heading', { name: es.dashboard.title })).toBeInTheDocument();
    expect(screen.queryByText(es.auth.sessionExpired)).not.toBeInTheDocument();
  });
});
