import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../utils/format';

// Listado de ingresos en el orden en que llegan. `caption` nombra la tabla para lectores de
// pantalla. Si no entra a lo ancho, cada fila se muestra como tarjeta: `data-label` es el rótulo de
// cada dato.
export default function IncomeTable({ caption, incomes }) {
  const { t } = useTranslation();

  return (
    <div className="table-wrapper">
      <table className="data-table data-table--stack">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t('incomes.fields.date')}</th>
            <th scope="col" className="numeric">
              {t('incomes.fields.amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((income) => (
            <tr key={income.id}>
              <td data-label={t('incomes.fields.date')}>
                <time dateTime={income.date}>{formatDate(income.date)}</time>
              </td>
              <td data-label={t('incomes.fields.amount')} className="numeric">
                {formatAmount(income.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
