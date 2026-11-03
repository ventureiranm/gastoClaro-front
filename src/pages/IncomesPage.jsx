import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIncomes } from '../hooks/useIncomes';
import { useToast } from '../hooks/useToast';
import { statusMessage } from '../utils/errors';
import IncomeForm from '../components/incomes/IncomeForm';
import IncomeTable from '../components/incomes/IncomeTable';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FormAlert from '../components/ui/FormAlert';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import PageHeader from '../components/ui/PageHeader';
import Toast from '../components/ui/Toast';

// Sin conexión, el mensaje genérico de red; ante cualquier otro problema, el de esa carga y, si el
// estado HTTP lo explica (sin permiso, no existe), también ese motivo.
function loadErrorMessage(error, messageKey, t) {
  if (error.isNetworkError) return t('errors.network');
  return [t(messageKey), statusMessage(error, t)];
}

export default function IncomesPage() {
  const { t } = useTranslation();
  const listTitleId = useId();
  const formTitleId = useId();
  const dateFieldRef = useRef(null);
  const incomes = useIncomes();
  const confirmation = useToast();

  // Al guardar se muestra la confirmación, y el ingreso aparece en el listado recién cuando el aviso
  // termina.
  async function handleCreate(newIncome) {
    const income = await incomes.create(newIncome);
    confirmation.show(t('incomes.form.success')).then(() => incomes.add(income));
  }

  function renderList() {
    if (incomes.isLoading) return <LoadingIndicator label={t('incomes.list.loading')} />;
    if (incomes.error) {
      return (
        <FormAlert
          messages={loadErrorMessage(incomes.error, 'incomes.list.loadError', t)}
          onRetry={incomes.retry}
        />
      );
    }
    if (incomes.incomes.length === 0) {
      return (
        <EmptyState
          headingLevel={3}
          title={t('incomes.list.emptyTitle')}
          description={t('incomes.list.emptyDescription')}
          action={
            <Button variant="secondary" onClick={() => dateFieldRef.current?.focus()}>
              {t('incomes.list.emptyAction')}
            </Button>
          }
        />
      );
    }
    return <IncomeTable caption={t('incomes.list.caption')} incomes={incomes.incomes} />;
  }

  return (
    <section className="page">
      <PageHeader eyebrow={t('nav.incomes')} title={t('incomes.title')} />
      <div className="dashboard">
        <section aria-labelledby={listTitleId} className="panel">
          <h2 id={listTitleId}>{t('incomes.list.title')}</h2>
          {renderList()}
        </section>
        <section aria-labelledby={formTitleId} className="panel dashboard__form">
          <h2 id={formTitleId}>{t('incomes.form.title')}</h2>
          <IncomeForm onSubmit={handleCreate} firstFieldRef={dateFieldRef} toast={confirmation} />
        </section>
      </div>
      <Toast
        toast={confirmation.toast}
        onClose={confirmation.close}
        onPause={confirmation.pause}
        onResume={confirmation.resume}
      />
    </section>
  );
}
