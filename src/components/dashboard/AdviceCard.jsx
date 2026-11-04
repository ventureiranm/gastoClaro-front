import { useTranslation } from 'react-i18next';
import { BUDGET_STATUS, budgetStatus } from '../../utils/budget';
import { formatAmount } from '../../utils/format';

// Un consejo corto según cómo viene el mes. Se arma con lo que ya trae el resumen (lo consumido y
// lo planificado por categoría): no hay un pedido aparte.
function pickTip(summary, t) {
  const withStatus = summary.consumptionByCategory.map(({ category, total, planned }) => ({
    category,
    status: budgetStatus(total, planned),
  }));
  const names = (status) =>
    withStatus
      .filter((item) => item.status === status)
      .map(({ category }) => category)
      .join(', ');

  if (names(BUDGET_STATUS.OVER)) {
    return t('dashboard.tips.over', { categories: names(BUDGET_STATUS.OVER) });
  }
  if (names(BUDGET_STATUS.NEAR)) {
    return t('dashboard.tips.near', { categories: names(BUDGET_STATUS.NEAR) });
  }
  if (summary.savings > 0) {
    return t('dashboard.tips.saving', { amount: formatAmount(summary.savings) });
  }
  return t('dashboard.tips.empty');
}

export default function AdviceCard({ summary }) {
  const { t } = useTranslation();

  return (
    <aside className="advice-card">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <h3>{t('dashboard.tips.title')}</h3>
        <p>{pickTip(summary, t)}</p>
      </div>
    </aside>
  );
}
