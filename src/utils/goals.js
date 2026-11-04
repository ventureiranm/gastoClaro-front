// Qué escena ilustra una meta, según lo que dice su nombre. Si no se reconoce, se reparte por id
// para que las tarjetas no salgan todas iguales.
export const GOAL_SCENES = ['mountain', 'sea', 'house'];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function goalScene({ id, name }) {
  const text = normalize(name);
  if (/casa|hogar|depto|departamento|vivienda|mudanza/.test(text)) return 'house';
  if (/\bmar\b|playa|vacacion|costa|isla/.test(text)) return 'sea';
  if (/monta|patagonia|viaje|trekking|aventura|sierra/.test(text)) return 'mountain';
  return GOAL_SCENES[Math.abs(Number(id) || 0) % GOAL_SCENES.length];
}
