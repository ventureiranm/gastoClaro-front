import { jsonResponse, mockFetch, TEST_TOKEN } from '../test/api';
import { login, register } from './auth';

const USER = { id: 5, user: 'nico', email: 'nico@example.com', admin: false };

describe('auth', () => {
  it('normaliza el user que hoy llega como string', async () => {
    mockFetch(jsonResponse(200, { token: TEST_TOKEN, user: 'nico' }));

    expect(await login({ user: 'nico', password: 'clave1234' })).toEqual({
      token: TEST_TOKEN,
      user: { id: null, user: 'nico', email: null, admin: null },
    });
  });

  it('acepta el user como objeto, la forma que trae GET /me', async () => {
    mockFetch(
      jsonResponse(201, { token: TEST_TOKEN, expires_at: '2026-10-28T03:14:00Z', user: USER }),
    );

    const session = await register({
      user: 'nico',
      email: 'nico@example.com',
      password: 'clave1234',
      passwordConfirmation: 'clave1234',
    });

    expect(session).toEqual({ token: TEST_TOKEN, user: USER });
  });
});
