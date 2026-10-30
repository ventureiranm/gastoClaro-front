# Sistema visual

Estilo plano y editorial: **bordes oscuros marcados, esquinas poco redondeadas, nada de sombras ni
degradados.** Si aparece una sombra o un degradado, se desvió.

Los estilos son CSS plano, sin librerías:

- `src/styles/tokens.css`: todos los valores (color, tipografía, espaciado, radios, bordes).
- `src/index.css`: base, componentes y pantallas. Importa los tokens.

## Reglas

1. **Ningún color escrito a mano** fuera de `tokens.css`. Si hace falta uno nuevo, se agrega ahí
   primero y se verifica el contraste (4.5:1 para texto).
2. **Nada de sombras ni degradados.** La profundidad la dan los bordes.
3. **Monoespaciada** (`--font-mono`) para montos, fechas, cantidades y rutas de API. En tablas,
   `td.numeric` y `<time>` ya la aplican; en otro lugar, la clase `.mono`.
4. Montos **alineados a la derecha** (`.numeric`).
5. Medidas de espaciado en múltiplos de 4px: `--space-1` (4px) a `--space-12` (48px).
6. Controles de **40px** de alto como mínimo; en teléfono y pantallas táctiles, `--control-height`
   sube solo a 44px.
7. El foco se ve siempre (`:focus-visible`, 3px). No se le quita el `outline` a nada interactivo.
8. El color nunca es la única señal: un error lleva texto, un ítem activo cambia también el peso.
9. Animación solo en transiciones breves de hover y foco; con `prefers-reduced-motion` no hay
   ninguna.
10. Pantallas nuevas: se arman con los componentes de abajo y tienen que funcionar en 390px sin
    desplazamiento horizontal.

## Tokens

| Token                                         | Valor                 | Uso                                  |
| --------------------------------------------- | --------------------- | ------------------------------------ |
| `--color-text`                                | `#2B2B2B`             | Texto principal                      |
| `--color-text-muted`                          | `#5E5E5A`             | Texto secundario                     |
| `--color-primary`                             | `#2F4F4A`             | Botones, ítem activo, enlaces, foco  |
| `--color-primary-hover`                       | `#1C302C`             | Hover del verde                      |
| `--color-border`                              | `#2B2B2B`             | Bordes con identidad propia          |
| `--color-border-soft`                         | `#CFCFC8`             | Separadores suaves, filas de tabla   |
| `--color-fill`                                | `#E8E8E3`             | Relleno neutro, hover, deshabilitado |
| `--color-subdued`                             | `#F4F4F1`             | Barra lateral, código, estado vacío  |
| `--color-bg`                                  | `#EFEFEA`             | Fondo de la aplicación               |
| `--color-surface`                             | `#FFFFFF`             | Tarjetas y paneles                   |
| `--color-warning-bg` / `--color-warning-text` | `#FBF1DD` / `#6B4F1D` | Avisos                               |
| `--color-error`                               | `#8A3A32`             | Errores                              |

Tipografía: **Libre Franklin** (`--font-sans`) para todo el texto e **IBM Plex Mono**
(`--font-mono`) para los números; se cargan desde Google Fonts en `index.html`.

| Token                 | Tamaño | Uso                                          |
| --------------------- | ------ | -------------------------------------------- |
| `--font-size-eyebrow` | 10.5px | Línea en versales, encabezados de tabla      |
| `--font-size-label`   | 12px   | Etiquetas de campo                           |
| `--font-size-small`   | 12.5px | Ayudas, errores de campo, líneas de contexto |
| `--font-size-body`    | 14px   | Texto                                        |
| `--font-size-section` | 16px   | Títulos de sección (h2)                      |
| `--font-size-title`   | 22px   | Título de pantalla (h1)                      |
| `--font-size-figure`  | 28px   | Número de las tarjetas de resumen            |

Formas: `--radius-control` 6px (botones, campos, etiquetas), `--radius-card` 8px (tarjetas y
paneles), `--radius-pill` 999px (solo píldoras de pestañas). `--border-width` 1.5px en elementos con
identidad propia y `--border-width-thin` 1px en separadores de filas.

## Componentes

En `src/components/ui/`:

| Componente         | Uso                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------- |
| `PageHeader`       | Encabezado de pantalla: `eyebrow` (línea en versales, opcional) y `title` (el h1).    |
| `Button`           | `variant`: `primary` (por defecto), `secondary` o `link`. `isLoading` lo deshabilita. |
| `FormField`        | Etiqueta arriba, campo, ayuda y error debajo. `as="select"`, `type="checkbox"`.       |
| `FormAlert`        | Aviso arriba de un formulario. `tone`: `error` (por defecto) o `warning`.             |
| `ErrorMessage`     | Uno o varios errores, anunciados a lectores de pantalla.                              |
| `LoadingIndicator` | Indicador de carga con texto.                                                         |
| `EmptyState`       | Estado vacío: zona apagada con título, descripción y acción opcional.                 |
| `Toast`            | Confirmación flotante.                                                                |

Clases para lo que no tiene componente:

| Clase                                 | Qué es                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `.page` / `.page--narrow`             | Contenedor de pantalla; `--narrow` es una tarjeta centrada.                                    |
| `.panel`                              | Tarjeta o panel: blanco, borde oscuro, radio 8px.                                              |
| `.eyebrow`                            | Línea chica en versales.                                                                       |
| `.data-table`                         | Tabla: encabezado en versales, filas con línea de 1px.                                         |
| `.data-table--stack` / `--stack-wide` | Tabla que se apila en tarjetas cuando no entra (ver abajo).                                    |
| `.numeric`, `.mono`, `.muted`         | Alineado a la derecha / monoespaciada / texto secundario.                                      |
| `.badge`                              | Etiqueta chica (por ejemplo, «Fijo»).                                                          |
| `.summary-totals`, `.summary-total`   | Tarjetas de resumen: rótulo, número grande y línea de contexto.                                |
| `.pill-tabs`, `.pill`                 | Píldoras de pestañas; la activa se marca con `aria-selected`, `aria-current` o `aria-pressed`. |
| `.dropzone` / `.dropzone--active`     | Zona de carga de archivos: borde punteado, contenido centrado.                                 |
| `.visually-hidden`                    | Oculto a la vista, presente para lectores de pantalla.                                         |

## Responsive

- **Navegación.** Con sesión iniciada, barra lateral desde 56rem (896px); por debajo, barra arriba
  con la marca y los ítems en una fila que se acomoda si no entra. Sin sesión, siempre barra arriba.
- **Panel.** Listado y alta en dos columnas desde 80rem (1280px); por debajo, uno debajo del otro.
- **Tablas.** Las que pueden no entrar llevan `.data-table--stack` (se apila con menos de 34rem
  disponibles) o `.data-table--stack-wide` (menos de 46rem, para tablas con muchas columnas
  numéricas). Cada fila pasa a ser una tarjeta; cada celda necesita `data-label` con el nombre de
  su columna, y si tiene más de un elemento, se envuelve en un `<span>`. El corte depende del ancho
  del contenedor (container queries), no de la ventana: la misma tabla funciona en el panel angosto y
  a lo ancho.
- **Tarjetas de resumen.** Se acomodan solas (`auto-fit`): tres por fila si entran, si no, menos.
- **Teléfono (menos de 40rem).** Márgenes laterales de 16px, controles de 44px y campos en 16px
  (para que el teléfono no haga zoom al escribir).
