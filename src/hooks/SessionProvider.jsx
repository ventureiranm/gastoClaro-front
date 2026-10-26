import { useCallback, useMemo, useState } from 'react';
import { clearToken, getToken } from '../api/tokenStorage';
import { SessionContext } from './sessionContext';

function notImplemented() {
  throw new Error('Pendiente: se implementa en la tarjeta de login.');
}

// Por ahora solo define la forma de la sesión. La sesión se considera activa si hay token
// guardado; cargar el usuario con me(), login y register llegan en la tarjeta de login.
export default function SessionProvider({ children }) {
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setHasToken(false);
  }, []);

  const value = useMemo(
    () => ({
      user: null,
      isAuthenticated: hasToken,
      isLoading: false,
      error: null,
      login: notImplemented,
      register: notImplemented,
      logout,
    }),
    [hasToken, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
