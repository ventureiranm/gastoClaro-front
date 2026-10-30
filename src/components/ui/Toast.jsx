import { useTranslation } from 'react-i18next';
import { TOAST_TONE } from '../../config/constants';
import Button from './Button';
import ErrorMessage from './ErrorMessage';

// Aviso flotante; lo maneja useToast. Una confirmación vive en una región role="status" que está
// siempre en la página: así los lectores de pantalla la anuncian al aparecer, sin mover el foco de
// donde está el usuario. Un error se muestra con ErrorMessage (role="alert"), que se anuncia apenas
// aparece, y puede traer varios mensajes.
export default function Toast({ toast, onClose, onPause, onResume }) {
  const { t } = useTranslation();
  const isError = toast?.tone === TOAST_TONE.ERROR;

  return (
    <div className="toast-region">
      <div
        className={toast ? `toast toast--${toast.tone}` : undefined}
        onMouseEnter={onPause}
        onMouseLeave={onResume}
        onFocus={onPause}
        onBlur={onResume}
      >
        <p className={isError ? 'visually-hidden' : 'toast__message'} role="status">
          {isError ? null : toast?.message}
        </p>
        {isError && (
          <div className="toast__message">
            <ErrorMessage messages={toast.message} />
          </div>
        )}
        {toast && (
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        )}
      </div>
    </div>
  );
}
