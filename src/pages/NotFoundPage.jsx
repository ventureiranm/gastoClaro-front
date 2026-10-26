import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../config/constants';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="page">
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
      <Link to={ROUTES.HOME}>{t('notFound.goHome')}</Link>
    </section>
  );
}
