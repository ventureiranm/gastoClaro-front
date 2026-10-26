import { useTranslation } from 'react-i18next';
import EmptyState from '../components/ui/EmptyState';

export default function DashboardPage() {
  const { t } = useTranslation();

  // El listado real de gastos llega en su propia tarjeta.
  return (
    <section className="page">
      <h1>{t('dashboard.title')}</h1>
      <EmptyState title={t('dashboard.emptyTitle')} description={t('dashboard.emptyDescription')} />
    </section>
  );
}
