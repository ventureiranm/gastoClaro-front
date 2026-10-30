import { AMOUNT_MAX_DECIMALS, AMOUNT_MIN_EXCLUSIVE } from '../config/constants';
import { isValidISODate, todayISO } from '../utils/dates';

// Número sin separador de miles, con coma o punto para los decimales: "1500", "1500,5", "1500.50".
// Que no acepte "1.500" es a propósito: sería ambiguo entre mil quinientos y uno con cincuenta.
const AMOUNT_PATTERN = new RegExp(`^\\d+([.,]\\d{1,${AMOUNT_MAX_DECIMALS}})?$`);

// Devuelve el monto escrito como número, o NaN si no tiene un formato válido.
export function parseAmount(text) {
  const value = text.trim();
  return AMOUNT_PATTERN.test(value) ? Number(value.replace(',', '.')) : NaN;
}

// Devuelve { campo: [mensajes] } solo con los campos que tienen problemas; `t` es la función de
// traducción. `today` ('YYYY-MM-DD') es el último día aceptado: un gasto no puede ser futuro.
export function validateExpense({ date, categoryId, amount }, t, today = todayISO()) {
  const errors = {};

  if (date === '') errors.date = [t('validation.required')];
  else if (!isValidISODate(date)) errors.date = [t('validation.date')];
  // Las fechas 'YYYY-MM-DD' se ordenan igual como texto que como fechas.
  else if (date > today) errors.date = [t('validation.dateFuture')];

  if (categoryId === '') errors.categoryId = [t('validation.required')];

  if (amount.trim() === '') errors.amount = [t('validation.required')];
  else {
    const value = parseAmount(amount);
    if (Number.isNaN(value)) {
      errors.amount = [t('validation.amount', { count: AMOUNT_MAX_DECIMALS })];
    } else if (value <= AMOUNT_MIN_EXCLUSIVE) {
      errors.amount = [t('validation.amountPositive', { min: AMOUNT_MIN_EXCLUSIVE })];
    }
  }
  return errors;
}

// Pasa los valores del formulario (texto) a los tipos que espera createExpense.
export function toNewExpense({ categoryId, amount, ...values }) {
  return { ...values, categoryId: Number(categoryId), amount: parseAmount(amount) };
}
