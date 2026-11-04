import { api } from './client';

const ENDPOINTS = {
  CATEGORIES: '/categories',
};

// Las categorías son una lista plana: parent_id y tracks_installments quedaron fuera del TP2 y
// siempre valen null, así que no se pasan al resto de la app. Vienen ordenadas por nombre.
export async function listCategories({ signal } = {}) {
  const categories = await api.get(ENDPOINTS.CATEGORIES, { signal });
  return categories.map(({ id, name }) => ({ id, name }));
}

// Para la pantalla de categorías: además del nombre, a qué categoría pertenece cada una (parentId,
// null si es principal). tracks_installments sigue fuera de la app.
function normalizeCategory({ id, name, parent_id: parentId }) {
  return { id, name, parentId: parentId ?? null };
}

export async function listCategoryDetails({ signal } = {}) {
  const categories = await api.get(ENDPOINTS.CATEGORIES, { signal });
  return categories.map(normalizeCategory);
}

// Solo el administrador puede crear y editar categorías: las comparten todos los usuarios.
function toBody({ name, parentId }) {
  return { name: name.trim(), parent_id: parentId };
}

export async function createCategory(category) {
  return normalizeCategory(await api.post(ENDPOINTS.CATEGORIES, toBody(category)));
}

export async function updateCategory(id, category) {
  return normalizeCategory(await api.patch(`${ENDPOINTS.CATEGORIES}/${id}`, toBody(category)));
}
