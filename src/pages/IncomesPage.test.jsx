import { screen, within } from '@testing-library/react';
import { saveToken } from '../api/tokenStorage';
import { AMOUNT_MIN_EXCLUSIVE, ROUTES } from '../config/constants';
import i18n from '../i18n';
import es from '../locales/es.json';
import {
  apiErrors,
  fetchCallsTo,
  heldResponse,
  jsonResponse,
  mockApi,
  TEST_TOKEN,
  TEST_USER,
} from '../test/api';
import { renderApp } from '../test/renderApp';
import { todayISO } from '../utils/dates';
import { formatDate } from '../utils/format';

function apiIncome(overrides = {}) {
  return {
    id: 1,
    amount: '450000.0',
    date: '2026-11-02',
    user: { id: 1, user: 'nico' },
    ...overrides,
  };
}

// Lo que respondería la API al crear el ingreso que se le manda.
function createdIncome({ body }) {
  return jsonResponse(201, apiIncome({ id: 99, amount: String(body.amount), date: body.date }));
}

function renderIncomes(routes = {}) {
  saveToken(TEST_TOKEN);
  const fetchMock = mockApi({
    'GET /me': jsonResponse(200, TEST_USER),
    'GET /incomes': jsonResponse(200, []),
    ...routes,
  });
  return { fetchMock, ...renderApp(ROUTES.INCOMES) };
}

function submitButton() {
  return screen.getByRole('button', { name: es.incomes.form.submit });
}

// El aviso de confirmación (toast) que aparece después de guardar.
function findConfirmation() {
  return screen.findByText(es.incomes.form.success, { selector: '.toast__message' });
}

describe('Listado de ingresos', () => {
  it('muestra los ingresos con la fecha y el monto formateados', async () => {
    // La respuesta queda pendiente hasta comprobar que se ve la carga.
    const held = heldResponse();
    renderIncomes({ 'GET /incomes': held.handler });

    expect(await screen.findByText(es.incomes.list.loading)).toBeInTheDocument();
    held.respond(
      jsonResponse(200, [
        apiIncome({ id: 2, amount: '150.5', date: '2026-11-03' }),
        apiIncome({ id: 1 }),
      ]),
    );

    const table = await screen.findByRole('table', { name: es.incomes.list.caption });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual([es.incomes.fields.date, es.incomes.fields.amount]);

    const [, first, second] = within(table).getAllByRole('row');
    expect(first).toHaveTextContent('03/11/2026');
    expect(first).toHaveTextContent('$ 150,50');
    expect(second).toHaveTextContent('02/11/2026');
    expect(second).toHaveTextContent('$ 450.000,00');
  });

  it('si no hay ingresos, muestra el estado vacío', async () => {
    renderIncomes();

    expect(
      await screen.findByRole('heading', { name: es.incomes.list.emptyTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(es.incomes.list.emptyDescription)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('Nuevo ingreso', () => {
  it('un alta correcta confirma y, al cerrar el aviso, suma el ingreso al listado', async () => {
    const { user, fetchMock } = renderIncomes({ 'POST /incomes': createdIncome });
    await screen.findByRole('heading', { name: es.incomes.list.emptyTitle });

    await user.type(screen.getByLabelText(es.incomes.fields.amount), '1500,50');
    await user.click(submitButton());

    // La confirmación se anuncia y el foco vuelve a la fecha para cargar otro ingreso. Mientras el
    // aviso está a la vista, el ingreso todavía no aparece.
    const confirmation = await findConfirmation();
    expect(confirmation).toHaveAttribute('role', 'status');
    expect(screen.getByLabelText(es.incomes.fields.date)).toHaveFocus();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: es.common.close }));

    const row = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(row).toHaveTextContent('$ 1.500,50');
    expect(row).toHaveTextContent(formatDate(todayISO()));

    const [call] = fetchCallsTo(fetchMock, 'POST /incomes');
    expect(call.body).toEqual({ amount: 1500.5, date: todayISO() });
    expect(fetchCallsTo(fetchMock, 'GET /incomes')).toHaveLength(1);
    expect(screen.getByLabelText(es.incomes.fields.amount)).toHaveValue('');
  });

  it('muestra el error de la API en el campo del monto', async () => {
    const message = 'debe ser mayor a 0';
    const { user } = renderIncomes({
      'POST /incomes': jsonResponse(422, apiErrors(['amount', message])),
    });
    await screen.findByRole('heading', { name: es.incomes.list.emptyTitle });

    await user.type(screen.getByLabelText(es.incomes.fields.amount), '1500');
    await user.click(submitButton());

    const amount = screen.getByLabelText(es.incomes.fields.amount);
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(amount).toHaveAccessibleDescription(expect.stringContaining(message));
    expect(amount).toHaveAttribute('aria-invalid', 'true');
    expect(amount).toHaveFocus();
  });

  it('valida antes de enviar: con monto 0 no hace ningún pedido', async () => {
    const { user, fetchMock } = renderIncomes();
    await screen.findByRole('heading', { name: es.incomes.list.emptyTitle });

    await user.type(screen.getByLabelText(es.incomes.fields.amount), '0');
    await user.click(submitButton());

    expect(screen.getByLabelText(es.incomes.fields.amount)).toHaveAccessibleDescription(
      expect.stringContaining(i18n.t('validation.amountPositive', { min: AMOUNT_MIN_EXCLUSIVE })),
    );
    expect(fetchCallsTo(fetchMock, 'POST /incomes')).toHaveLength(0);
  });
});
