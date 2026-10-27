import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ROUTES } from './config/constants';
import SessionProvider from './hooks/SessionProvider';
import App from './App';
import es from './locales/es.json';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('renderiza la pantalla de login', () => {
    renderAt(ROUTES.LOGIN);
    expect(screen.getByRole('heading', { name: es.login.title })).toBeInTheDocument();
  });

  it('redirige al login al entrar a una ruta protegida sin sesión', () => {
    renderAt(ROUTES.DASHBOARD);
    expect(screen.getByRole('heading', { name: es.login.title })).toBeInTheDocument();
  });
});
