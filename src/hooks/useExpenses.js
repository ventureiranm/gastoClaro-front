import { useCallback } from 'react';
import { createExpense, listExpenses } from '../api/expenses';
import { periodOf } from '../utils/dates';
import { useRemoteData } from './useRemoteData';

// Inserta el gasto respetando el orden de la API: del más reciente al más antiguo. Entre gastos del
// mismo día va primero, porque es el último que se cargó.
function insertByDate(expenses, expense) {
  const index = expenses.findIndex(({ date }) => date <= expense.date);
  return index === -1 ? [...expenses, expense] : expenses.toSpliced(index, 0, expense);
}

// Gastos del período 'YYYY-MM'. create() da de alta un gasto y, si es del período que se está
// mostrando, lo suma al listado sin volver a pedirlo. Devuelve el gasto creado.
export function useExpenses(period) {
  const load = useCallback(({ signal }) => listExpenses({ period, signal }), [period]);
  const { data, isLoading, error, retry, setData } = useRemoteData(load);

  const create = useCallback(
    async (newExpense) => {
      const expense = await createExpense(newExpense);
      if (periodOf(expense.date) === period) {
        setData((expenses) => expenses && insertByDate(expenses, expense));
      }
      return expense;
    },
    [period, setData],
  );

  return { expenses: data, isLoading, error, retry, create };
}
