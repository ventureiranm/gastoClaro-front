import { useTranslation } from 'react-i18next';
import { BANNER_PHOTO } from '../../config/constants';
import GoalPhoto from '../ui/GoalPhoto';

// Cierre de Inicio: un paisaje con el lema de la marca.
export default function MottoBanner() {
  const { t } = useTranslation();

  return (
    <aside className="motto-banner">
      <GoalPhoto scene="mountain" src={BANNER_PHOTO} />
      <p className="motto-banner__text">{t('brand.motto')}</p>
    </aside>
  );
}
