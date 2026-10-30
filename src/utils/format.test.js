import i18n from '../i18n';
import es from '../locales/es.json';
import { formatAmount, formatDate, formatPeriod, formatPurchaseChannel } from './format';

describe('formato', () => {
  it('muestra los montos con punto para los miles y coma para los decimales', () => {
    expect(formatAmount(13101)).toMatch(/^\$\s13\.101,00$/);
    expect(formatAmount(1800.5)).toMatch(/1\.800,50$/);
  });

  it('muestra la fecha del calendario sin correrla por la zona horaria', () => {
    expect(formatDate('2026-09-01')).toBe('01/09/2026');
  });

  it('nombra el período con el mes y el año', () => {
    expect(formatPeriod('2026-09')).toBe('septiembre de 2026');
  });

  it('traduce el canal de compra y muestra tal cual un código desconocido', () => {
    expect(formatPurchaseChannel('retiro', i18n.t)).toBe(es.expenses.channels.retiro);
    expect(formatPurchaseChannel('online', i18n.t)).toBe('online');
  });
});
