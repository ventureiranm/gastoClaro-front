import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import SessionProvider from '../hooks/SessionProvider';
import App from '../App';

// Monta la app completa en `path`, con la sesión real.
export function renderApp(path) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
  return { user };
}
