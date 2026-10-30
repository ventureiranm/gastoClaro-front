import { useTranslation } from 'react-i18next';
import Button from './Button';

// Aviso flotante de confirmación; lo maneja useToast. El mensaje vive en una región role="status"
// que está siempre en la página: así los lectores de pantalla lo anuncian al aparecer, sin mover el
// foco de donde está el usuario.
export default function Toast({ toast, onClose, onPause, onResume }) {
  const { t } = useTranslation();

  return (
    <div className="toast-region">
      <div
        className={toast ? 'toast' : undefined}
        onMouseEnter={onPause}
        onMouseLeave={onResume}
        onFocus={onPause}
        onBlur={onResume}
      >
        <p className="toast__message" role="status">
          {toast?.message}
        </p>
        {toast && (
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        )}
      </div>
    </div>
  );
}
