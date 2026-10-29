import { useCallback, useEffect, useRef, useState } from 'react';
import { TOAST_DURATION_MS } from '../config/constants';

// Aviso que se cierra solo a los TOAST_DURATION_MS, o antes si se cierra a mano. Se muestra con el
// componente Toast.
// - show(message) lo muestra y devuelve una promesa que se resuelve cuando el aviso termina. Si ya
//   había otro, ese termina primero.
// - pause() y resume() frenan la cuenta y la vuelven a arrancar, para que el aviso no desaparezca
//   mientras el puntero o el foco están sobre él.
// Si el componente se desmonta (por ejemplo, al cerrar sesión), el aviso no termina y lo que
// esperaba su cierre no se ejecuta.
export function useToast() {
  const [toast, setToast] = useState(null);
  // El aviso en pantalla: { timer, resolve }.
  const pendingRef = useRef(null);

  const close = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    clearTimeout(pending.timer);
    pendingRef.current = null;
    setToast(null);
    pending.resolve();
  }, []);

  const show = useCallback(
    (message) => {
      close();
      return new Promise((resolve) => {
        pendingRef.current = { resolve, timer: setTimeout(close, TOAST_DURATION_MS) };
        setToast({ message });
      });
    },
    [close],
  );

  const pause = useCallback(() => clearTimeout(pendingRef.current?.timer), []);

  const resume = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    clearTimeout(pending.timer);
    pending.timer = setTimeout(close, TOAST_DURATION_MS);
  }, [close]);

  // Al desmontarse, la cuenta se frena para siempre.
  useEffect(() => pause, [pause]);

  return { toast, show, close, pause, resume };
}
