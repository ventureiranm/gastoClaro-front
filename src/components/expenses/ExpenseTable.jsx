import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate, formatPurchaseChannel } from '../../utils/format';

// Listado de gastos en el orden en que llegan. `caption` nombra la tabla para lectores de pantalla.
export default function ExpenseTable({ caption, expenses }) {
  const { t } = useTranslation();

  return (
    <div className="table-wrapper">
      <table className="data-table">
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
              <td>
                <time dateTime={expense.date}>{formatDate(expense.date)}</time>
              </td>
              <td>
                {expense.description || (
                  <span className="muted">{t('expenses.list.noDescription')}</span>
                )}
                {expense.isFixed && (
                  <>
                    {' '}
                    <span className="badge">{t('expenses.list.fixed')}</span>
                  </>
                )}
              </td>
              <td>{expense.category?.name}</td>
              <td>
                {expense.purchaseChannel ? (
                  formatPurchaseChannel(expense.purchaseChannel, t)
                ) : (
                  <span className="muted">{t('expenses.list.noChannel')}</span>
                )}
              </td>
              <td className="numeric">{formatAmount(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
