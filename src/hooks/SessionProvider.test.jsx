import { act, screen } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { api } from '../api/client';
import { getToken, saveToken } from '../api/tokenStorage';
import { ROUTES } from '../config/constants';
import es from '../locales/es.json';
import { apiErrors, fetchCall, jsonResponse, mockFetch, TEST_TOKEN } from '../test/api';
import { renderApp } from '../test/renderApp';

const BACK = 'atrás';

// Simula el botón "atrás" del navegador.
function BackButton() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>{BACK}</button>;
}

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

  it('después del logout, volver atrás no muestra la pantalla protegida', async () => {
    saveToken(TEST_TOKEN);
    mockFetch(jsonResponse(204));
    const { user } = renderApp(ROUTES.DASHBOARD, { extra: <BackButton /> });

    await user.click(screen.getByRole('button', { name: es.nav.logout }));
    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: BACK }));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: es.dashboard.title })).not.toBeInTheDocument();
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
