import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate, formatPercentage } from '../../utils/format';
import Button from '../ui/Button';

// Listado de metas en el orden en que llegan. `caption` nombra la tabla para lectores de pantalla.
// Si no entra a lo ancho, cada fila se muestra como tarjeta: `data-label` es el rótulo de cada dato.
// onEdit(goal) y onDelete(goal) los resuelve quien llama; onDelete devuelve una promesa que no
// falla (maneja sus propios errores). Borrar pide confirmación en la misma fila.
export default function SavingsGoalTable({ caption, goals, onEdit, onDelete }) {
  const { t } = useTranslation();
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(goal) {
    setDeletingId(goal.id);
    await onDelete(goal);
    setDeletingId(null);
    setConfirmingId(null);
  }

  function renderActions(goal) {
    if (confirmingId !== goal.id) {
      return (
        <>
          <Button
            variant="secondary"
            aria-label={t('savingsGoals.list.editLabel', { name: goal.name })}
            onClick={() => onEdit(goal)}
          >
            {t('savingsGoals.list.edit')}
          </Button>{' '}
          <Button
            variant="secondary"
            aria-label={t('savingsGoals.list.deleteLabel', { name: goal.name })}
            onClick={() => setConfirmingId(goal.id)}
          >
            {t('savingsGoals.list.delete')}
          </Button>
        </>
      );
    }
    const isDeleting = deletingId === goal.id;
    return (
      <>
        <span>{t('savingsGoals.list.confirmDelete', { name: goal.name })}</span>{' '}
        <Button variant="secondary" isLoading={isDeleting} onClick={() => handleDelete(goal)}>
          {t('savingsGoals.list.confirmYes')}
        </Button>{' '}
        <Button
          ref={(button) => button?.focus()}
          variant="secondary"
          disabled={isDeleting}
          onClick={() => setConfirmingId(null)}
        >
          {t('savingsGoals.list.confirmNo')}
        </Button>
      </>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table data-table--stack">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t('savingsGoals.fields.name')}</th>
            <th scope="col">{t('savingsGoals.fields.deadline')}</th>
            <th scope="col" className="numeric">
              {t('savingsGoals.fields.savedAmount')}
            </th>
            <th scope="col" className="numeric">
              {t('savingsGoals.fields.progress')}
            </th>
            <th scope="col">
              <span className="visually-hidden">{t('savingsGoals.fields.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <tr key={goal.id}>
              <td data-label={t('savingsGoals.fields.name')} className="free-text">
                <span>{goal.name}</span>
              </td>
              <td data-label={t('savingsGoals.fields.deadline')}>
                {goal.deadline ? (
                  <time dateTime={goal.deadline}>{formatDate(goal.deadline)}</time>
                ) : (
                  <span className="muted">{t('savingsGoals.list.noDeadline')}</span>
                )}
              </td>
              <td data-label={t('savingsGoals.fields.savedAmount')} className="numeric">
                {t('savingsGoals.list.savedOfTarget', {
                  saved: formatAmount(goal.savedAmount),
                  target: formatAmount(goal.targetAmount),
                })}
              </td>
              <td data-label={t('savingsGoals.fields.progress')} className="numeric">
                {formatPercentage(goal.progressPercentage / 100)}
              </td>
              <td data-label={t('savingsGoals.fields.actions')}>{renderActions(goal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
