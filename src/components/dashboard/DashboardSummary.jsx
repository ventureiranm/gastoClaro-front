import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount, formatPercentage, formatPeriod } from '../../utils/format';
import EmptyState from '../ui/EmptyState';

// Un mes tuvo movimientos si entró o salió plata.
function hasActivity({ income, consumption }) {
  return income !== 0 || consumption !== 0;
}

function SummaryTotals({ summary }) {
  const { t } = useTranslation();
  const { income, consumption, savings, savingsGoalPercentage } = summary;

  // En el orden de la regla del panel: ingreso = consumo + ahorro.
  return (
    <dl className="summary-totals">
      <div className="summary-total">
        <dt>{t('dashboard.summary.income')}</dt>
        <dd className="summary-total__amount">{formatAmount(income)}</dd>
      </div>
      <div className="summary-total">
        <dt>{t('dashboard.summary.consumption')}</dt>
        <dd className="summary-total__amount">{formatAmount(consumption)}</dd>
      </div>
      <div className={`summary-total${savings < 0 ? ' summary-total--negative' : ''}`}>
        <dt>{t('dashboard.summary.savings')}</dt>
        <dd className="summary-total__amount">{formatAmount(savings)}</dd>
        {savingsGoalPercentage > 0 && (
          <dd className="muted summary-total__context">
            {t('dashboard.summary.savingsGoal', {
              percentage: formatPercentage(savingsGoalPercentage / 100),
            })}
          </dd>
        )}
      </div>
    </dl>
  );
}

// Del rubro en el que más se gastó al que menos, con la parte del consumo del mes que representa.
function CategoryBreakdown({ summary, period }) {
  const { t } = useTranslation();
  const titleId = useId();
  const categories = summary.consumptionByCategory.toSorted((a, b) => b.total - a.total);

  return (
    <section aria-labelledby={titleId} className="panel">
      <h3 id={titleId}>{t('dashboard.summary.byCategory.title')}</h3>
      {categories.length === 0 ? (
        <p className="muted">{t('dashboard.summary.byCategory.empty', { period })}</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table data-table--stack" aria-labelledby={titleId}>
            <thead>
              <tr>
                <th scope="col">{t('expenses.fields.category')}</th>
                <th scope="col" className="numeric">
                  {t('expenses.fields.amount')}
                </th>
                <th scope="col" className="numeric">
                  {t('dashboard.summary.byCategory.share')}
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map(({ category, total }) => (
                <tr key={category}>
                  <td data-label={t('expenses.fields.category')}>{category}</td>
                  <td data-label={t('expenses.fields.amount')} className="numeric">
                    {formatAmount(total)}
                  </td>
                  <td data-label={t('dashboard.summary.byCategory.share')} className="numeric">
                    {formatPercentage(total / summary.consumption)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MonthlySavings({ months }) {
  const { t } = useTranslation();
  const titleId = useId();
  const hintId = useId();

  return (
    <section aria-labelledby={titleId} className="panel">
      <h3 id={titleId}>{t('dashboard.summary.monthly.title')}</h3>
      <p id={hintId} className="muted">
        {t('dashboard.summary.monthly.hint')}
      </p>
      <div className="table-wrapper">
        <table
          className="data-table data-table--stack-wide"
          aria-labelledby={titleId}
          aria-describedby={hintId}
        >
          <thead>
            <tr>
              <th scope="col">{t('dashboard.summary.monthly.month')}</th>
              <th scope="col" className="numeric">
                {t('dashboard.summary.income')}
              </th>
              <th scope="col" className="numeric">
                {t('dashboard.summary.consumption')}
              </th>
              <th scope="col" className="numeric">
                {t('dashboard.summary.savings')}
              </th>
              <th scope="col" className="numeric">
                {t('dashboard.summary.monthly.accumulated')}
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.month}>
                <th scope="row">{formatPeriod(month.month)}</th>
                <td data-label={t('dashboard.summary.income')} className="numeric">
                  {formatAmount(month.income)}
                </td>
                <td data-label={t('dashboard.summary.consumption')} className="numeric">
                  {formatAmount(month.consumption)}
                </td>
                <td data-label={t('dashboard.summary.savings')} className="numeric">
                  {formatAmount(month.savings)}
                </td>
                <td data-label={t('dashboard.summary.monthly.accumulated')} className="numeric">
                  {formatAmount(month.accumulated)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Resumen del mes en curso que arma GET /dashboard. Si el mes no tuvo movimientos, lo dice en lugar
// de mostrar todo en cero; la evolución de los últimos meses aparece si alguno tuvo.
export default function DashboardSummary({ summary }) {
  const { t } = useTranslation();
  const period = formatPeriod(summary.period);

  return (
    <>
      <p className="muted">{period}</p>
      {hasActivity(summary) ? (
        <>
          <SummaryTotals summary={summary} />
          <CategoryBreakdown summary={summary} period={period} />
        </>
      ) : (
        <EmptyState
          headingLevel={3}
          title={t('dashboard.summary.emptyTitle', { period })}
          description={t('dashboard.summary.emptyDescription')}
        />
      )}
      {summary.monthlySavings.some(hasActivity) && (
        <MonthlySavings months={summary.monthlySavings} />
      )}
    </>
  );
}
