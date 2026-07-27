/**
 * Color compartido por las gráficas de barras del panel (no la escala 1–4):
 * amarillo por defecto, y solo se destaca el mejor y el peor promedio del
 * grupo que se esté mostrando. Los hex son los mismos de --exito y --nivel-1
 * en tokens.css.
 */
export const COLOR_AMARILLO = '#8A6A00'
export const COLOR_MEJOR = '#0F6B47'
export const COLOR_PEOR = '#C0392B'

/** Máximo y mínimo de un grupo de promedios, para saber a quién destacar. */
export function calcularExtremos(promedios) {
  const maximo = Math.max(...promedios)
  const minimo = Math.min(...promedios)
  return { maximo, minimo, hayVariacion: maximo !== minimo }
}

export function colorDeBarra(promedio, { maximo, minimo, hayVariacion }) {
  if (hayVariacion && promedio === maximo) return COLOR_MEJOR
  if (hayVariacion && promedio === minimo) return COLOR_PEOR
  return COLOR_AMARILLO
}
