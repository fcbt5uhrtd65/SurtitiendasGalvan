function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

// Todavía no hay sistema de reseñas en el backend: derivamos una calificación
// estable (siempre la misma para un mismo producto, no aleatoria en cada
// render) a partir de su id, solo para el efecto visual del diseño — no
// representa datos reales de reseñas.
export function placeholderRating(id: string): { stars: number; count: number } {
  const hash = hashString(id);
  return { stars: 4 + (hash % 10) / 10, count: 15 + (hash % 240) };
}
