import { useTranslation } from 'react-i18next';
import { useSession } from '../../hooks/useSession';

function displayName(user) {
  const name = user?.user ?? '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Saludo de Inicio con el lema de la marca.
export default function GreetingBanner() {
  const { t } = useTranslation();
  const { user } = useSession();

  return (
    <div className="greeting">
      <p className="greeting__hello">{t('dashboard.greeting', { name: displayName(user) })}</p>
      <p className="greeting__sub">{t('dashboard.greetingSubtitle')}</p>
      <p className="greeting__motto">{t('brand.motto')}</p>
    </div>
  );
}
