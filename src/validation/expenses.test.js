import { AMOUNT_MIN_EXCLUSIVE } from '../config/constants';
import i18n from '../i18n';
import es from '../locales/es.json';
import { parseAmount, validateExpense } from './expenses';

const { t } = i18n;
const TODAY = '2026-09-20';
const VALID = { date: '2026-09-12', categoryId: '1', amount: '1500,50' };

describe('validación de gastos', () => {
  it('acepta coma o punto para los decimales, pero no separador de miles', () => {
    expect(parseAmount('1500')).toBe(1500);
    expect(parseAmount(' 1500,5 ')).toBe(1500.5);
    expect(parseAmount('1500.50')).toBe(1500.5);
    expect(parseAmount('1.500')).toBeNaN();
    expect(parseAmount('1.500,50')).toBeNaN();
    expect(parseAmount('-5')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
  });

  it('un gasto completo no tiene errores', () => {
    expect(validateExpense(VALID, t, TODAY)).toEqual({});
  });

  it('pide fecha, categoría y monto', () => {
    expect(validateExpense({ date: '', categoryId: '', amount: '  ' }, t, TODAY)).toEqual({
      date: [es.validation.required],
      categoryId: [es.validation.required],
      amount: [es.validation.required],
    });
  });

  it('rechaza un monto de cero y una fecha que no existe', () => {
    expect(validateExpense({ ...VALID, date: '2026-02-30', amount: '0,00' }, t, TODAY)).toEqual({
      date: [es.validation.date],
      amount: [t('validation.amountPositive', { min: AMOUNT_MIN_EXCLUSIVE })],
    });
  });

  it('acepta la fecha de hoy pero no una futura', () => {
    expect(validateExpense({ ...VALID, date: TODAY }, t, TODAY)).toEqual({});
    expect(validateExpense({ ...VALID, date: '2026-09-21' }, t, TODAY)).toEqual({
      date: [es.validation.dateFuture],
    });
    expect(validateExpense({ ...VALID, date: '2027-01-01' }, t, TODAY)).toEqual({
      date: [es.validation.dateFuture],
    });
  });
});
