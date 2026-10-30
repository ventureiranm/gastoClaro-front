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
