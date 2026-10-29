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

// Gastos del período 'YYYY-MM'.
// - create(newExpense) da de alta un gasto y lo devuelve, sin sumarlo al listado.
// - add(expense) suma al listado un gasto ya creado, sin volver a pedirlo. Solo si es del período
//   que está cargado y todavía no figura (pudo llegar en un pedido posterior al alta).
export function useExpenses(period) {
  // El dato guarda a qué período corresponde, para que add() no sume un gasto al listado de otro
  // mes aunque el filtro haya cambiado entre el alta y la llamada.
  const load = useCallback(
    async ({ signal }) => ({ period, expenses: await listExpenses({ period, signal }) }),
    [period],
  );
  const { data, isLoading, error, retry, setData } = useRemoteData(load);

  const add = useCallback(
    (expense) =>
      setData((current) => {
        if (current?.period !== periodOf(expense.date)) return current;
        if (current.expenses.some(({ id }) => id === expense.id)) return current;
        return { ...current, expenses: insertByDate(current.expenses, expense) };
      }),
    [setData],
  );

  return { expenses: data?.expenses, isLoading, error, retry, create: createExpense, add };
}
