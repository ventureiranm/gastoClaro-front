import { act, fireEvent, screen, within } from '@testing-library/react';
import { saveToken } from '../api/tokenStorage';
import { ROUTES, TOAST_DURATION_MS } from '../config/constants';
import i18n from '../i18n';
import es from '../locales/es.json';
import {
  apiDashboard,
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
import { formatPercentage, formatPeriod } from '../utils/format';

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

// El aviso de confirmación (toast) que aparece después de guardar.
function findConfirmation() {
  return screen.findByText(es.expenses.form.success, { selector: '.toast__message' });
}

// Espera la confirmación y la cierra: recién entonces aparece el gasto nuevo.
async function closeConfirmation(user) {
  await findConfirmation();
  await user.click(screen.getByRole('button', { name: es.common.close }));
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

  it('un alta correcta confirma y, al cerrar el aviso, suma el gasto al listado sin recargar', async () => {
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

    // La confirmación se anuncia sin mover el foco, que vuelve a la fecha para cargar otro gasto.
    // Mientras está a la vista, el gasto todavía no aparece.
    const confirmation = await findConfirmation();
    expect(confirmation).toHaveAttribute('role', 'status');
    expect(screen.getByLabelText(es.expenses.fields.date)).toHaveFocus();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: es.common.close }));
    expect(confirmation).toBeEmptyDOMElement();

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
    await closeConfirmation(user);

    expect(await screen.findByText('Gasto atrasado')).toBeInTheDocument();
    expect(screen.getByLabelText(es.expenses.filter.label)).toHaveValue(PAST_PERIOD);
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
    expect(await findConfirmation()).toBeInTheDocument();
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
    await closeConfirmation(user);

    expect(screen.getByRole('table')).toHaveTextContent('$ 250,00');
  });
});

describe('Confirmación al guardar', () => {
  afterEach(() => vi.useRealTimers());

  // Avanza el reloj simulado y deja que React procese lo que eso dispara.
  async function advance(ms) {
    await act(async () => {
      vi.advanceTimersByTime(ms);
    });
  }

  // Llena el formulario con los timers reales (user-event los usa) y recién después los simula,
  // para controlar cuánto dura el aviso. El envío se hace con fireEvent por el mismo motivo.
  async function submitWithFakeTimers() {
    const { user } = renderDashboard({ 'POST /expenses': createdExpense });
    await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) });
    await fillExpense(user, { amount: '250' });

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    fireEvent.click(submitButton());

    // Espera la confirmación sin mover el reloj simulado: findBy se traba con setTimeout simulado y
    // vi.waitFor lo adelanta. setImmediate (de Node) no está simulado.
    for (let attempt = 0; attempt < 50; attempt++) {
      const confirmation = screen.queryByText(es.expenses.form.success, {
        selector: '.toast__message',
      });
      if (confirmation) return confirmation;
      await act(() => new Promise((resolve) => globalThis.setImmediate(resolve)));
    }
    throw new Error('No apareció la confirmación');
  }

  it('se cierra sola y recién entonces aparece el gasto', async () => {
    await submitWithFakeTimers();

    await advance(TOAST_DURATION_MS - 1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await advance(1);
    expect(screen.getByRole('table')).toHaveTextContent('$ 250,00');
    expect(screen.queryByText(es.expenses.form.success)).not.toBeInTheDocument();
  });

  it('no se cierra mientras el puntero está sobre ella', async () => {
    const confirmation = await submitWithFakeTimers();

    fireEvent.mouseEnter(confirmation.parentElement);
    await advance(TOAST_DURATION_MS * 2);
    expect(confirmation).toHaveTextContent(es.expenses.form.success);

    fireEvent.mouseLeave(confirmation.parentElement);
    await advance(TOAST_DURATION_MS);
    expect(confirmation).toBeEmptyDOMElement();
    expect(screen.getByRole('table')).toHaveTextContent('$ 250,00');
  });
});

// Un mes con ingresos y gastos, y un mes anterior en el que se gastó más de lo que entró.
function activeDashboard() {
  return apiDashboard({
    income: '450000.0',
    consumption: '38101.0',
    savings: '411899.0',
    savings_goal_percentage: 10,
    consumption_by_category: [
      { category: 'Supermercado', total: '13101.0' },
      { category: 'Limpieza', total: '25000.0' },
    ],
    monthly_savings: [
      {
        month: PAST_PERIOD,
        income: '0.0',
        consumption: '1000.0',
        savings: '-1000.0',
        accumulated: '-1000.0',
      },
      {
        month: currentPeriod(),
        income: '450000.0',
        consumption: '38101.0',
        savings: '411899.0',
        accumulated: '410899.0',
      },
    ],
  });
}

function findSummary() {
  return screen.findByRole('region', { name: es.dashboard.summary.title });
}

// El término de uno de los totales (ingresos, consumo o ahorro). La tabla de los últimos meses
// repite esos nombres como encabezados, por eso se busca solo entre los términos.
function findTotal(summary, label) {
  return within(summary).findByText(label, { selector: 'dt' });
}

// El monto que acompaña a uno de los totales.
async function totalOf(summary, label) {
  return (await findTotal(summary, label)).nextElementSibling;
}

describe('Resumen del mes', () => {
  it('muestra ingreso, consumo y ahorro, el consumo por categoría y los últimos meses', async () => {
    // La respuesta queda pendiente hasta comprobar que se ve la carga.
    let respond;
    const { fetchMock } = renderDashboard({
      'GET /dashboard': () => new Promise((resolve) => (respond = resolve)),
    });

    expect(await screen.findByText(es.dashboard.summary.loading)).toBeInTheDocument();
    respond(jsonResponse(200, activeDashboard()));
    const summary = await findSummary();

    expect(await totalOf(summary, es.dashboard.summary.income)).toHaveTextContent('$ 450.000,00');
    expect(await totalOf(summary, es.dashboard.summary.consumption)).toHaveTextContent(
      '$ 38.101,00',
    );
    expect(await totalOf(summary, es.dashboard.summary.savings)).toHaveTextContent('$ 411.899,00');
    expect(
      within(summary).getByText(formatPeriod(currentPeriod()), { selector: 'p' }),
    ).toBeVisible();
    expect(summary).toHaveTextContent(
      i18n.t('dashboard.summary.savingsGoal', { percentage: formatPercentage(0.1) }),
    );

    // De la categoría en la que más se gastó a la que menos.
    const byCategory = screen.getByRole('table', { name: es.dashboard.summary.byCategory.title });
    const [, first, second] = within(byCategory).getAllByRole('row');
    expect(first).toHaveTextContent('Limpieza');
    expect(first).toHaveTextContent('$ 25.000,00');
    expect(first).toHaveTextContent(formatPercentage(25000 / 38101));
    expect(second).toHaveTextContent('Supermercado');

    const monthly = screen.getByRole('table', { name: es.dashboard.summary.monthly.title });
    expect(monthly).toHaveAccessibleDescription(es.dashboard.summary.monthly.hint);
    const [, past, current] = within(monthly).getAllByRole('row');
    expect(past).toHaveTextContent(formatPeriod(PAST_PERIOD));
    expect(past).toHaveTextContent('-$ 1.000,00');
    expect(current).toHaveTextContent('$ 410.899,00');

    expect(fetchCallsTo(fetchMock, 'GET /dashboard')).toHaveLength(1);
  });

  it('si el mes no tuvo movimientos, lo dice en lugar de mostrar todo en cero', async () => {
    renderDashboard();
    const summary = await findSummary();

    expect(
      await within(summary).findByRole('heading', {
        name: i18n.t('dashboard.summary.emptyTitle', { period: formatPeriod(currentPeriod()) }),
      }),
    ).toBeInTheDocument();
    expect(within(summary).queryByText(es.dashboard.summary.income)).not.toBeInTheDocument();
    expect(within(summary).queryByRole('table')).not.toBeInTheDocument();
  });

  it('si el mes tiene ingresos pero no gastos, lo aclara en el consumo por categoría', async () => {
    renderDashboard({
      'GET /dashboard': jsonResponse(
        200,
        apiDashboard({ income: '450000.0', savings: '450000.0' }),
      ),
    });
    const summary = await findSummary();

    expect(
      await within(summary).findByText(
        i18n.t('dashboard.summary.byCategory.empty', { period: formatPeriod(currentPeriod()) }),
      ),
    ).toBeInTheDocument();
    expect(await totalOf(summary, es.dashboard.summary.savings)).toHaveTextContent('$ 450.000,00');
  });

  it('si falla, avisa y permite reintentar sin afectar el listado de gastos', async () => {
    const { user } = renderDashboard({
      'GET /dashboard': [jsonResponse(500), jsonResponse(200, activeDashboard())],
    });
    const summary = await findSummary();

    expect(await within(summary).findByRole('alert')).toHaveTextContent(
      es.dashboard.summary.loadError,
    );
    expect(
      await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) }),
    ).toBeInTheDocument();

    await user.click(within(summary).getByRole('button', { name: es.common.retry }));

    expect(await findTotal(summary, es.dashboard.summary.income)).toBeInTheDocument();
    expect(within(summary).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('después de cargar un gasto vuelve a pedir el resumen', async () => {
    const { user, fetchMock } = renderDashboard({
      'POST /expenses': createdExpense,
      'GET /dashboard': [jsonResponse(200, apiDashboard()), jsonResponse(200, activeDashboard())],
    });
    await screen.findByRole('heading', { name: emptyTitle(currentPeriod()) });

    await fillExpense(user);
    await user.click(submitButton());
    await findConfirmation();
    expect(fetchCallsTo(fetchMock, 'GET /dashboard')).toHaveLength(1);
    await closeConfirmation(user);

    expect(await totalOf(await findSummary(), es.dashboard.summary.consumption)).toHaveTextContent(
      '$ 38.101,00',
    );
    expect(fetchCallsTo(fetchMock, 'GET /dashboard')).toHaveLength(2);
  });
});

describe('Aislamiento entre usuarios', () => {
  it('después de cerrar sesión no queda a la vista nada del usuario anterior', async () => {
    // La API responde según el token: A tiene un gasto, B ninguno.
    saveToken('token-a');
    const fetchMock = mockApi({
      'GET /me': jsonResponse(200, TEST_USER),
      'GET /dashboard': jsonResponse(200, apiDashboard()),
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
