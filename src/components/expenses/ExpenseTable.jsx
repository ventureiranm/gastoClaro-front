import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate, formatPurchaseChannel } from '../../utils/format';

// Listado de gastos en el orden en que llegan. `caption` nombra la tabla para lectores de pantalla.
// Si no entra a lo ancho, cada fila se muestra como tarjeta: `data-label` es el rótulo de cada dato.
export default function ExpenseTable({ caption, expenses }) {
  const { t } = useTranslation();

  return (
    <div className="table-wrapper">
      <table className="data-table data-table--stack">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t('expenses.fields.date')}</th>
            <th scope="col">{t('expenses.fields.description')}</th>
            <th scope="col">{t('expenses.fields.category')}</th>
            <th scope="col">{t('expenses.fields.purchaseChannel')}</th>
            <th scope="col" className="numeric">
              {t('expenses.fields.amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td data-label={t('expenses.fields.date')}>
                <time dateTime={expense.date}>{formatDate(expense.date)}</time>
              </td>
              <td data-label={t('expenses.fields.description')} className="free-text">
                {/* Un solo hijo: apilada, la celda es una grilla de rótulo y valor. */}
                <span>
                  {expense.description || (
                    <span className="muted">{t('expenses.list.noDescription')}</span>
                  )}
                  {expense.isFixed && (
                    <>
                      {' '}
                      <span className="badge">{t('expenses.list.fixed')}</span>
                    </>
                  )}
                </span>
              </td>
              <td data-label={t('expenses.fields.category')}>{expense.category?.name}</td>
              <td data-label={t('expenses.fields.purchaseChannel')}>
                {expense.purchaseChannel ? (
                  formatPurchaseChannel(expense.purchaseChannel, t)
                ) : (
                  <span className="muted">{t('expenses.list.noChannel')}</span>
                )}
              </td>
              <td data-label={t('expenses.fields.amount')} className="numeric">
                {formatAmount(expense.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
