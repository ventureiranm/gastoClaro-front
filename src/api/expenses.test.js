import { apiErrors, fetchCall, jsonResponse, mockFetch } from '../test/api';
import { listCategories } from './categories';
import { ApiError } from './client';
import { createExpense, listExpenses } from './expenses';

const API_EXPENSE = {
  id: 2,
  amount: '13101.0',
  date: '2026-09-12',
  description: 'Compra semanal',
  is_fixed: false,
  purchase_channel: 'presencial',
  user: { id: 1, user: 'nico' },
  vendor_id: 4,
  category: { id: 1, name: 'Supermercado' },
  expense_items: [
    {
      id: 1,
      name: 'Leche',
      quantity: 2,
      unit: 'unidad',
      unit_price: '1800.5',
      subtotal: '3601.0',
    },
  ],
};

const NEW_EXPENSE = {
  date: '2026-09-12',
  categoryId: 1,
  amount: 1500.5,
  description: '',
  isFixed: false,
  purchaseChannel: '',
};

describe('gastos', () => {
  it('convierte el monto a número y deja afuera lo que el TP2 no usa', async () => {
    const fetchMock = mockFetch(jsonResponse(200, [API_EXPENSE]));

    expect(await listExpenses({ period: '2026-09' })).toEqual([
      {
        id: 2,
        amount: 13101,
        date: '2026-09-12',
        description: 'Compra semanal',
        isFixed: false,
        purchaseChannel: 'presencial',
        category: { id: 1, name: 'Supermercado' },
      },
    ]);
    expect(fetchCall(fetchMock).url).toMatch(/\/expenses\?period=2026-09$/);
  });

  it('manda los tipos del contrato y omite los opcionales vacíos', async () => {
    const fetchMock = mockFetch(jsonResponse(201, API_EXPENSE), jsonResponse(201, API_EXPENSE));

    await createExpense(NEW_EXPENSE);
    await createExpense({
      ...NEW_EXPENSE,
      description: '  Café  ',
      isFixed: true,
      purchaseChannel: 'delivery',
    });

    expect(fetchCall(fetchMock, 0).body).toEqual({
      date: '2026-09-12',
      category_id: 1,
      amount: 1500.5,
      is_fixed: false,
    });
    expect(fetchCall(fetchMock, 1).body).toEqual({
      date: '2026-09-12',
      category_id: 1,
      amount: 1500.5,
      description: 'Café',
      is_fixed: true,
      purchase_channel: 'delivery',
    });
  });

  it('el error de categoría llega como category_id aunque el back diga category', async () => {
    mockFetch(
      jsonResponse(422, apiErrors(['category', 'tiene que existir'], ['amount', 'es inválido'])),
    );

    const error = await createExpense(NEW_EXPENSE).catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.errors).toEqual([
      { field: 'category_id', message: 'tiene que existir' },
      { field: 'amount', message: 'es inválido' },
    ]);
  });
});

describe('categorías', () => {
  it('devuelve una lista plana con id y nombre', async () => {
    mockFetch(
      jsonResponse(200, [{ id: 3, name: 'Servicios', parent_id: null, tracks_installments: null }]),
    );

    expect(await listCategories()).toEqual([{ id: 3, name: 'Servicios' }]);
  });
});
