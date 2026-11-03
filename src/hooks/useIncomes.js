import { useCallback } from 'react';
import { createIncome, listIncomes } from '../api/incomes';
import { useRemoteData } from './useRemoteData';

// Inserta el ingreso respetando el orden de la API: del más reciente al más antiguo. Entre
// ingresos del mismo día va primero, porque es el último que se cargó.
function insertByDate(incomes, income) {
  const index = incomes.findIndex(({ date }) => date <= income.date);
  return index === -1 ? [...incomes, income] : incomes.toSpliced(index, 0, income);
}

// Ingresos del usuario.
// - create(newIncome) da de alta un ingreso y lo devuelve, sin sumarlo al listado.
// - add(income) suma al listado un ingreso ya creado, sin volver a pedirlo. Si ya figura (pudo
//   llegar en un pedido posterior al alta), no lo duplica.
export function useIncomes() {
  // listIncomes es una función de módulo, así que es estable: el dato se pide una sola vez.
  const { data, isLoading, error, retry, setData } = useRemoteData(listIncomes);

  const add = useCallback(
    (income) =>
      setData((current) => {
        if (!current) return current;
        if (current.some(({ id }) => id === income.id)) return current;
        return insertByDate(current, income);
      }),
    [setData],
  );

  return { incomes: data, isLoading, error, retry, create: createIncome, add };
}
