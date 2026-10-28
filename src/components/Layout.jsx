import { NavLink, Outlet, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../config/constants';
import { useSession } from '../hooks/useSession';
import Button from './ui/Button';

const MAIN_CONTENT_ID = 'main-content';

export default function Layout() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useSession();
  const navigate = useNavigate();

  // logout() borra la sesión local al instante; el aviso al servidor sigue en segundo plano.
  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <>
      <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
        {t('nav.skipToContent')}
      </a>
      <header className="app-header">
        <span className="app-header__brand">{t('app.name')}</span>
        <nav aria-label={t('nav.label')}>
          <ul className="app-nav">
            {isAuthenticated ? (
              <>
                <li>
                  <NavLink to={ROUTES.DASHBOARD}>{t('nav.dashboard')}</NavLink>
                </li>
                <li>
                  <Button variant="link" onClick={handleLogout}>
                    {t('nav.logout')}
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to={ROUTES.LOGIN}>{t('nav.login')}</NavLink>
                </li>
                <li>
                  <NavLink to={ROUTES.REGISTER}>{t('nav.register')}</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main id={MAIN_CONTENT_ID} className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
