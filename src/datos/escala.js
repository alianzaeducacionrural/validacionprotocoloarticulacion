/**
 * Escala de valoración del documento fuente.
 *
 * Los colores están verificados contra WCAG AA sobre fondo blanco (todos ≥ 4.5:1),
 * y sirven igual como texto sobre blanco que como relleno con texto blanco encima.
 * Ver design-system/validacion-protocolo-articulacion/MASTER.md.
 *
 * REGLA: el color nunca comunica solo. Todo nivel se muestra siempre con su
 * número y su etiqueta, en la interfaz, en las gráficas y en el PDF.
 */

export const NIVELES = [
  {
    valor: 1,
    etiqueta: 'No cumple',
    corta: 'No cumple',
    color: 'var(--nivel-1)',
    hex: '#C0392B',
  },
  {
    valor: 2,
    etiqueta: 'Cumple parcialmente',
    corta: 'Parcial',
    color: 'var(--nivel-2)',
    hex: '#B45309',
  },
  {
    valor: 3,
    etiqueta: 'Cumple con ajustes menores',
    corta: 'Ajustes menores',
    color: 'var(--nivel-3)',
    hex: '#8A6A00',
  },
  {
    valor: 4,
    etiqueta: 'Cumple plenamente',
    corta: 'Pleno',
    color: 'var(--nivel-4)',
    hex: '#006C84',
  },
]

export const VALOR_MINIMO = 1
export const VALOR_MAXIMO = 4

/** Umbral por debajo del cual un aspecto se considera crítico en el panel. */
export const UMBRAL_CRITICO = 2.5

export function nivelPorValor(valor) {
  return NIVELES.find((nivel) => nivel.valor === Number(valor)) ?? null
}

/** Color de un promedio (número real), redondeando al nivel más cercano. */
export function colorDePromedio(promedio) {
  if (promedio == null || Number.isNaN(promedio)) return 'var(--nivel-0)'
  const nivel = nivelPorValor(Math.round(promedio))
  return nivel ? nivel.color : 'var(--nivel-0)'
}

export function hexDePromedio(promedio) {
  if (promedio == null || Number.isNaN(promedio)) return '#9AA5B1'
  const nivel = nivelPorValor(Math.round(promedio))
  return nivel ? nivel.hex : '#9AA5B1'
}

/** Promedio con un decimal, o '—' si no hay datos. */
export function formatearPromedio(promedio) {
  if (promedio == null || Number.isNaN(promedio)) return '—'
  return promedio.toFixed(1)
}
