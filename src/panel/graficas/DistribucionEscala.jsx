import { NIVELES } from '../../datos/escala'
import estilos from './DistribucionEscala.module.css'

/**
 * Cuántas valoraciones cayó en cada nivel.
 *
 * Barra apilada hecha en CSS en vez de Recharts: son cuatro segmentos y así
 * cada uno lleva su número escrito al lado, sin depender del color ni del hover.
 */
export function DistribucionEscala({ distribucion, total }) {
  if (!total) return null

  return (
    <div className={estilos.contenedor}>
      <div className={estilos.barra}>
        {NIVELES.map((nivel) => {
          const cantidad = distribucion[nivel.valor] ?? 0
          if (cantidad === 0) return null
          return (
            <div
              key={nivel.valor}
              className={estilos.segmento}
              style={{
                width: `${(cantidad / total) * 100}%`,
                background: nivel.color,
              }}
              title={`${nivel.valor} — ${nivel.etiqueta}: ${cantidad}`}
            />
          )
        })}
      </div>

      <ul className={estilos.leyenda}>
        {NIVELES.map((nivel) => {
          const cantidad = distribucion[nivel.valor] ?? 0
          const porcentaje = total ? Math.round((cantidad / total) * 100) : 0
          return (
            <li key={nivel.valor} className={estilos.item}>
              <span className={estilos.marca} style={{ background: nivel.color }} aria-hidden="true">
                {nivel.valor}
              </span>
              <span className={estilos.etiqueta}>{nivel.etiqueta}</span>
              <span className={estilos.cifra}>
                {cantidad}
                <span className={estilos.porcentaje}> ({porcentaje}%)</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
