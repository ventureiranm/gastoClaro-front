import { useTranslation } from 'react-i18next';
import GoalArt from '../ui/GoalArt';

// Cierre de Inicio: un paisaje con el lema de la marca.
export default function MottoBanner() {
  const { t } = useTranslation();

  return (
    <aside className="motto-banner">
      <GoalArt scene="mountain" />
      <p className="motto-banner__text">{t('brand.motto')}</p>
    </aside>
  );
}
