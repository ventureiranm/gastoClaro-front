import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/useCategories';
import { useDashboard } from '../hooks/useDashboard';
import { useExpenses } from '../hooks/useExpenses';
import { useToast } from '../hooks/useToast';
import { currentPeriod, isValidPeriod, periodOf } from '../utils/dates';
import { formatPeriod } from '../utils/format';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FormAlert from '../components/ui/FormAlert';
import FormField from '../components/ui/FormField';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import PageHeader from '../components/ui/PageHeader';
import Toast from '../components/ui/Toast';

// Sin conexión, el mensaje genérico de red; ante cualquier otro problema, el de esa carga.
function loadErrorMessage(error, messageKey, t) {
  return error.isNetworkError ? t('errors.network') : t(messageKey);
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const summaryTitleId = useId();
  const listTitleId = useId();
  const formTitleId = useId();
  const dateFieldRef = useRef(null);
  // La app es mensual: arranca en el mes en curso. `periodInput` es lo que está escrito en el
  // filtro (en navegadores sin selector de mes es texto libre); `period`, el último mes válido.
  const [period, setPeriod] = useState(currentPeriod);
  const [periodInput, setPeriodInput] = useState(period);
  const expenses = useExpenses(period);
  const categories = useCategories();
  const dashboard = useDashboard();
  const confirmation = useToast();

  function changePeriod(value) {
    setPeriodInput(value);
    if (isValidPeriod(value)) setPeriod(value);
  }

  // Al guardar se muestra la confirmación, y el gasto aparece recién cuando el aviso termina:
  // entonces se suma al listado y el filtro pasa a su mes, para que se vea dónde quedó. El resumen
  // se vuelve a pedir siempre: un gasto de un mes anterior también cambia la evolución de los 6
  // meses.
  async function handleCreate(newExpense) {
    const expense = await expenses.create(newExpense);
    confirmation.show(t('expenses.form.success')).then(() => {
      expenses.add(expense);
      changePeriod(periodOf(expense.date));
      dashboard.retry();
    });
  }

  function renderSummary() {
    if (dashboard.isLoading) return <LoadingIndicator label={t('dashboard.summary.loading')} />;
    if (dashboard.error) {
      return (
        <FormAlert
          messages={loadErrorMessage(dashboard.error, 'dashboard.summary.loadError', t)}
          onRetry={dashboard.retry}
        />
      );
    }
    return <DashboardSummary summary={dashboard.summary} />;
  }

  function renderList() {
    if (expenses.isLoading) return <LoadingIndicator label={t('expenses.list.loading')} />;
    if (expenses.error) {
      return (
        <FormAlert
          messages={loadErrorMessage(expenses.error, 'expenses.list.loadError', t)}
          onRetry={expenses.retry}
        />
      );
    }
    if (expenses.expenses.length === 0) {
      return (
        <EmptyState
          headingLevel={3}
          title={t('expenses.list.emptyTitle', { period: formatPeriod(period) })}
          description={t('expenses.list.emptyDescription')}
          action={
            <Button variant="secondary" onClick={() => dateFieldRef.current?.focus()}>
              {t('expenses.list.emptyAction')}
            </Button>
          }
        />
      );
    }
    return (
      <ExpenseTable
        caption={t('expenses.list.caption', { period: formatPeriod(period) })}
        expenses={expenses.expenses}
      />
    );
  }

  function renderForm() {
    if (categories.isLoading)
      return <LoadingIndicator label={t('expenses.form.loadingCategories')} />;
    if (categories.error) {
      return (
        <FormAlert
          messages={loadErrorMessage(categories.error, 'expenses.form.categoriesError', t)}
          onRetry={categories.retry}
        />
      );
    }
    return (
      <ExpenseForm
        categories={categories.categories}
        onSubmit={handleCreate}
        firstFieldRef={dateFieldRef}
      />
    );
  }

  return (
    <section className="page">
      <PageHeader eyebrow={t('nav.dashboard')} title={t('dashboard.title')} />
      <section aria-labelledby={summaryTitleId} className="dashboard-summary">
        <h2 id={summaryTitleId}>{t('dashboard.summary.title')}</h2>
        {renderSummary()}
      </section>
      <div className="dashboard">
        <section aria-labelledby={listTitleId} className="panel">
          <h2 id={listTitleId}>{t('expenses.list.title')}</h2>
          <div className="dashboard__filter">
            <FormField
              label={t('expenses.filter.label')}
              name="period"
              type="month"
              placeholder={t('expenses.filter.placeholder')}
              value={periodInput}
              onChange={(event) => changePeriod(event.target.value)}
              errors={isValidPeriod(periodInput) ? undefined : t('expenses.filter.invalid')}
            />
          </div>
          {renderList()}
        </section>
        <section aria-labelledby={formTitleId} className="panel dashboard__form">
          <h2 id={formTitleId}>{t('expenses.form.title')}</h2>
          {renderForm()}
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
