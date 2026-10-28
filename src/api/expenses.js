import { ApiError, api } from './client';

const ENDPOINTS = {
  EXPENSES: '/expenses',
};

// El back puede informar la categoría inexistente con field "category" en vez de "category_id".
// Se pidió normalizarlo, pero puede que todavía no esté: este es el único lugar que lo traduce,
// para que el error aparezca en el campo de la categoría en los dos casos.
const API_FIELD_ALIASES = { category: 'category_id' };

// Hacia adentro de la app un gasto es { id, amount, date, description, isFixed, purchaseChannel,
// category: { id, name } }. Los montos llegan como texto ("13101.0") y acá pasan a número, para
// que nadie más tenga que convertirlos. vendor_id y expense_items quedaron fuera del TP2: no se
// pasan; si un gasto tiene ítems, amount ya es su total.
function normalizeExpense(raw) {
  return {
    id: raw.id,
    amount: Number(raw.amount),
    date: raw.date,
    description: raw.description ?? '',
    isFixed: Boolean(raw.is_fixed),
    purchaseChannel: raw.purchase_channel ?? null,
    category: raw.category ? { id: raw.category.id, name: raw.category.name } : null,
  };
}

function normalizeErrorFields(error) {
  if (
    !(error instanceof ApiError) ||
    !error.errors.some(({ field }) => field in API_FIELD_ALIASES)
  ) {
    return error;
  }
  const errors = error.errors.map((item) => ({
    ...item,
    field: API_FIELD_ALIASES[item.field] ?? item.field,
  }));
  return new ApiError(error.status, errors, { cause: error });
}

// Gastos del usuario del token, del más reciente al más antiguo (como máximo 100). `period` es
// 'YYYY-MM'.
export async function listExpenses({ period, signal } = {}) {
  const query = period ? `?${new URLSearchParams({ period })}` : '';
  const expenses = await api.get(`${ENDPOINTS.EXPENSES}${query}`, { signal });
  return expenses.map(normalizeExpense);
}

// Recibe el gasto con los tipos de la app (amount y categoryId como números). La descripción viaja
// sin espacios en los extremos; los campos opcionales vacíos no se mandan. Devuelve el gasto creado.
export async function createExpense({
  date,
  categoryId,
  amount,
  description = '',
  isFixed = false,
  purchaseChannel = '',
}) {
  const body = { date, category_id: categoryId, amount, is_fixed: isFixed };
  if (description.trim()) body.description = description.trim();
  if (purchaseChannel) body.purchase_channel = purchaseChannel;

  try {
    return normalizeExpense(await api.post(ENDPOINTS.EXPENSES, body));
  } catch (error) {
    throw normalizeErrorFields(error);
  }
}
