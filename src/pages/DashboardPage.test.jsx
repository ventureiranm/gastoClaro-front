import { fireEvent, screen, within } from '@testing-library/react';
import { saveToken } from '../api/tokenStorage';
import { ROUTES } from '../config/constants';
import i18n from '../i18n';
import es from '../locales/es.json';
import {
  apiErrors,
  emptyDashboardRoutes,
  fetchCallsTo,
  jsonResponse,
  mockApi,
  TEST_TOKEN,
  TEST_USER,
} from '../test/api';
import { BACK, BackButton } from '../test/BackButton';
import { renderApp } from '../test/renderApp';
import { currentPeriod, todayISO } from '../utils/dates';
import { formatPeriod } from '../utils/format';

const CATEGORIES = [
  { id: 3, name: 'Servicios', parent_id: null, tracks_installments: null },
  { id: 1, name: 'Supermercado', parent_id: null, tracks_installments: null },
];
const PAST_PERIOD = '2025-01';

function apiExpense(overrides = {}) {
  return {
    id: 1,
    amount: '13101.0',
    date: `${currentPeriod()}-05`,
    description: 'Compra semanal',
    is_fixed: false,
    purchase_channel: 'presencial',
    user_id: 1,
    category: { id: 1, name: 'Supermercado' },
    expense_items: [],
    ...overrides,
  };
}

// Lo que respondería la API al crear el gasto que se le manda.
function createdExpense({ body }) {
  const category = CATEGORIES.find(({ id }) => id === body.category_id);
  return jsonResponse(
    201,
    apiExpense({
      id: 99,
      amount: String(body.amount),
      date: body.date,
      description: body.description ?? null,
      is_fixed: body.is_fixed,
      purchase_channel: body.purchase_channel ?? null,
      category: { id: category.id, name: category.name },
    }),
  );
}

function renderDashboard(routes = {}) {
  saveToken(TEST_TOKEN);
  const fetchMock = mockApi({
    ...emptyDashboardRoutes(),
    'GET /categories': jsonResponse(200, CATEGORIES),
    ...routes,
  });
  return { fetchMock, ...renderApp(ROUTES.DASHBOARD) };
}

async function fillExpense(user, { category = 'Supermercado', amount = '1500' } = {}) {
  await user.selectOptions(await screen.findByLabelText(es.expenses.fields.category), category);
  await user.type(screen.getByLabelText(es.expenses.fields.amount), amount);
}

function submitButton() {
  return screen.getByRole('button', { name: es.expenses.form.submit });
}

function emptyTitle(period) {
  return i18n.t('expenses.list.emptyTitle', { period: formatPeriod(period) });
}

describe('Listado de gastos', () => {
  it('muestra los gastos del mes en curso con el monto formateado', async () => {
    // La respuesta queda pendiente hasta comprobar que se ve la carga.
    let respond;
    const { fetchMock } = renderDashboard({
      'GET /expenses': () => new Promise((resolve) => (respond = resolve)),
    });

    expect(await screen.findByText(es.expenses.list.loading)).toBeInTheDocument();
    respond(
      jsonResponse(200, [
        apiExpense({ id: 2, is_fixed: true, purchase_channel: 'delivery' }),
        apiExpense({ amount: '1800.5', description: '', purchase_channel: null }),
      ]),
    );

    const table = await screen.findByRole('table', {
      name: i18n.t('expenses.list.caption', { period: formatPeriod(currentPeriod()) }),
    });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual([
      es.expenses.fields.date,
      es.expenses.fields.description,
      es.expenses.fields.category,
      es.expenses.fields.purchaseChannel,
      es.expenses.fields.amount,
    ]);

    const [, fixed, other] = within(table).getAllByRole('row');
    expect(fixed).toHaveTextContent('Compra semanal');
    expect(fixed).toHaveTextContent(es.expenses.list.fixed);
    expect(fixed).toHaveTextContent('Supermercado');
    expect(fixed).toHaveTextContent(es.expenses.channels.delivery);
    expect(fixed).toHaveTextContent('$ 13.101,00');
    expect(other).toHaveTextContent('$ 1.800,50');
    expect(other).toHaveTextContent(es.expenses.list.noDescription);
    expect(other).toHaveTextContent(es.expenses.list.noChannel);
    expect(other).not.toHaveTextContent(es.expenses.list.fixed);

    const [call] = fetchCallsTo(fetchMock, 'GET /expenses');
    expect(call.url).toMatch(new RegExp(`/expenses\\?period=${currentPeriod()}$`));
  });

  it('si el mes no tiene gastos, muestra el estado vacío e invita a cargar uno', async () => {
    const { user } = renderDashboard();

    expect(
      await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: es.expenses.list.emptyAction }));
    expect(screen.getByLabelText(es.expenses.fields.date)).toHaveFocus();
  });

  it('al cambiar de mes pide ese período y muestra sus gastos', async () => {
    const { fetchMock } = renderDashboard({
      'GET /expenses': ({ url }) =>
        jsonResponse(
          200,
          url.endsWith(`period=${PAST_PERIOD}`)
            ? [apiExpense({ date: `${PAST_PERIOD}-20`, description: 'Gasto viejo' })]
            : [],
        ),
    });
    await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) });

    fireEvent.change(screen.getByLabelText(es.expenses.filter.label), {
      target: { value: PAST_PERIOD },
    });

    expect(await screen.findByText('Gasto viejo')).toBeInTheDocument();
    expect(fetchCallsTo(fetchMock, 'GET /expenses').at(-1).url).toMatch(
      new RegExp(`period=${PAST_PERIOD}$`),
    );
  });

  it('si falla la carga, muestra el error de red y permite reintentar', async () => {
    const { user } = renderDashboard({
      'GET /expenses': [new TypeError('Failed to fetch'), jsonResponse(200, [apiExpense()])],
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.errors.network);
    await user.click(screen.getByRole('button', { name: es.common.retry }));

    expect(await screen.findByText('Compra semanal')).toBeInTheDocument();
    expect(screen.queryByText(es.errors.network)).not.toBeInTheDocument();
  });

  it('si fallan las categorías, lo avisa en lugar del formulario y permite reintentar', async () => {
    const { user } = renderDashboard({
      'GET /categories': [jsonResponse(500), jsonResponse(200, CATEGORIES)],
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.expenses.form.categoriesError);
    expect(screen.queryByRole('button', { name: es.expenses.form.submit })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: es.common.retry }));

    expect(await screen.findByLabelText(es.expenses.fields.category)).toBeInTheDocument();
  });
});

describe('Nuevo gasto', () => {
  it('sin categorías cargadas, el formulario avisa y no deja guardar', async () => {
    const { user, fetchMock } = renderDashboard({ 'GET /categories': jsonResponse(200, []) });

    const category = await screen.findByLabelText(es.expenses.fields.category);
    expect(category).toHaveAccessibleDescription(es.expenses.form.noCategories);
    expect(submitButton()).toBeDisabled();

    await user.type(screen.getByLabelText(es.expenses.fields.amount), '1500{Enter}');
    expect(fetchCallsTo(fetchMock, 'POST /expenses')).toHaveLength(0);
  });

  it('valida antes de enviar y lleva el foco al primer campo con problema', async () => {
    const { user, fetchMock } = renderDashboard();
    await screen.findByLabelText(es.expenses.fields.category);

    await user.type(screen.getByLabelText(es.expenses.fields.amount), '0');
    await user.click(submitButton());

    const category = screen.getByLabelText(es.expenses.fields.category);
    expect(category).toHaveAccessibleDescription(es.validation.required);
    expect(category).toHaveFocus();
    expect(screen.getByLabelText(es.expenses.fields.amount)).toHaveAccessibleDescription(
      expect.stringContaining(es.validation.amountPositive),
    );
    expect(fetchCallsTo(fetchMock, 'POST /expenses')).toHaveLength(0);
  });

  it('muestra el error de la API en el campo del monto', async () => {
    const message = 'debe ser mayor a 0';
    const { user } = renderDashboard({
      'POST /expenses': jsonResponse(422, apiErrors(['amount', message])),
    });

    await fillExpense(user);
    await user.click(submitButton());

    const amount = screen.getByLabelText(es.expenses.fields.amount);
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(amount).toHaveAccessibleDescription(expect.stringContaining(message));
    expect(amount).toHaveAttribute('aria-invalid', 'true');
    expect(amount).toHaveFocus();
  });

  it('muestra el error de categoría en su campo aunque la API lo mande como category', async () => {
    const message = 'tiene que existir';
    const { user } = renderDashboard({
      'POST /expenses': jsonResponse(422, apiErrors(['category', message])),
    });

    await fillExpense(user);
    await user.click(submitButton());

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText(es.expenses.fields.category)).toHaveAccessibleDescription(message);
  });

  it('un alta correcta confirma y suma el gasto al listado sin recargar', async () => {
    const { user, fetchMock } = renderDashboard({ 'POST /expenses': createdExpense });
    await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) });

    await fillExpense(user, { category: 'Servicios', amount: '1500,50' });
    await user.type(screen.getByLabelText(es.expenses.fields.description), 'Internet');
    await user.click(screen.getByLabelText(es.expenses.fields.isFixed));
    await user.selectOptions(
      screen.getByLabelText(es.expenses.fields.purchaseChannel),
      es.expenses.channels.delivery,
    );
    await user.click(submitButton());

    const confirmation = await screen.findByText(es.expenses.form.success);
    expect(confirmation.closest('[role="status"]')).toHaveFocus();

    const row = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(row).toHaveTextContent('Internet');
    expect(row).toHaveTextContent('Servicios');
    expect(row).toHaveTextContent('$ 1.500,50');
    expect(row).toHaveTextContent(es.expenses.list.fixed);

    const [call] = fetchCallsTo(fetchMock, 'POST /expenses');
    expect(call.body).toEqual({
      date: todayISO(),
      category_id: 3,
      amount: 1500.5,
      description: 'Internet',
      is_fixed: true,
      purchase_channel: 'delivery',
    });
    expect(fetchCallsTo(fetchMock, 'GET /expenses')).toHaveLength(1);
    expect(screen.getByLabelText(es.expenses.fields.amount)).toHaveValue('');
  });

  it('si el gasto es de otro mes, el filtro pasa a ese mes para mostrarlo', async () => {
    const { user } = renderDashboard({
      'POST /expenses': createdExpense,
      'GET /expenses': ({ url }) =>
        jsonResponse(
          200,
          url.endsWith(`period=${PAST_PERIOD}`)
            ? [apiExpense({ date: `${PAST_PERIOD}-15`, description: 'Gasto atrasado' })]
            : [],
        ),
    });
    await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) });

    fireEvent.change(screen.getByLabelText(es.expenses.fields.date), {
      target: { value: `${PAST_PERIOD}-15` },
    });
    await fillExpense(user);
    await user.click(submitButton());

    expect(await screen.findByText('Gasto atrasado')).toBeInTheDocument();
    expect(screen.getByLabelText(es.expenses.filter.label)).toHaveValue(PAST_PERIOD);
    expect(screen.getByText(es.expenses.form.success)).toBeInTheDocument();
  });

  it('deshabilita el botón mientras guarda', async () => {
    let respond;
    const { user, fetchMock } = renderDashboard({
      'POST /expenses': (call) =>
        new Promise((resolve) => (respond = () => resolve(createdExpense(call)))),
    });

    await fillExpense(user);
    await user.click(submitButton());

    expect(submitButton()).toBeDisabled();
    expect(screen.getByText(es.expenses.form.submitting)).toBeInTheDocument();
    await user.click(submitButton());
    expect(fetchCallsTo(fetchMock, 'POST /expenses')).toHaveLength(1);

    respond();
    expect(await screen.findByText(es.expenses.form.success)).toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  it('si se cae la red al guardar, avisa y permite reintentar', async () => {
    const { user } = renderDashboard({
      'POST /expenses': [new TypeError('Failed to fetch'), createdExpense],
    });

    await fillExpense(user, { amount: '250' });
    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(es.errors.network);
    await user.click(screen.getByRole('button', { name: es.common.retry }));

    expect(await screen.findByText(es.expenses.form.success)).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('$ 250,00');
  });
});

describe('Aislamiento entre usuarios', () => {
  it('después de cerrar sesión no queda a la vista nada del usuario anterior', async () => {
    // La API responde según el token: A tiene un gasto, B ninguno.
    saveToken('token-a');
    const fetchMock = mockApi({
      'GET /me': jsonResponse(200, TEST_USER),
      'GET /categories': jsonResponse(200, CATEGORIES),
      'GET /expenses': ({ headers }) =>
        jsonResponse(
          200,
          headers.Authorization === 'Bearer token-a'
            ? [apiExpense({ description: 'Gasto de A' })]
            : [],
        ),
      'DELETE /logout': jsonResponse(204),
      'POST /login': jsonResponse(200, {
        token: 'token-b',
        user: { id: 2, user: 'b', email: 'b@example.com', admin: false },
      }),
    });
    const { user } = renderApp(ROUTES.DASHBOARD, { extra: <BackButton /> });
    expect(await screen.findByText('Gasto de A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: es.nav.logout }));
    await screen.findByRole('heading', { name: es.login.title });

    await user.click(screen.getByRole('button', { name: BACK }));
    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(screen.queryByText('Gasto de A')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(es.auth.user), 'b');
    await user.type(screen.getByLabelText(es.auth.password), 'clave1234');
    await user.click(screen.getByRole('button', { name: es.login.submit }));

    expect(
      await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Gasto de A')).not.toBeInTheDocument();
    const lastList = fetchCallsTo(fetchMock, 'GET /expenses').at(-1);
    expect(lastList.headers.Authorization).toBe('Bearer token-b');
  });
});
