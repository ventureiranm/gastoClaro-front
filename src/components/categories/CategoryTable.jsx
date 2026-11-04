import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';

// Listado de categorías en el orden en que llega. `caption` nombra la tabla para lectores de
// pantalla. La categoría trae solo el id de su categoría principal: el nombre sale de la misma lista.
// onEdit(category) se llama al tocar Editar; editButtonRef(id, node) recibe el botón de cada fila
// (null cuando se va), para que quien llama pueda devolverle el foco.
export default function CategoryTable({ caption, categories, onEdit, editButtonRef }) {
  const { t } = useTranslation();
  const names = new Map(categories.map(({ id, name }) => [id, name]));

  return (
    <div className="table-wrapper">
      <table className="data-table data-table--stack">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t('categories.fields.name')}</th>
            <th scope="col">{t('categories.fields.parent')}</th>
            <th scope="col">
              <span className="visually-hidden">{t('categories.list.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const { name } = category;
            return (
              <tr key={category.id}>
                <td data-label={t('categories.fields.name')} className="free-text">
                  {name}
                </td>
                <td data-label={t('categories.fields.parent')}>
                  {category.parentId === null ? (
                    <span className="muted">{t('categories.list.noParent')}</span>
                  ) : (
                    (names.get(category.parentId) ?? t('categories.list.unknownParent'))
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <Button
                      ref={(node) => editButtonRef(category.id, node)}
                      variant="secondary"
                      aria-label={t('categories.list.editLabel', { name })}
                      onClick={() => onEdit(category)}
                    >
                      {t('categories.list.edit')}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
