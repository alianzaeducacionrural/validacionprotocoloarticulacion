import { Warning } from '@phosphor-icons/react'
import { Cargando, EstadoVacio, Alerta } from '../../ui/Estados'
import { BarrasPorCriterio } from '../graficas/BarrasPorCriterio'
import { DetallePorAspecto } from '../graficas/DetallePorAspecto'
import { formatearPromedio, colorDePromedio, UMBRAL_CRITICO } from '../../datos/escala'
import { CRITERIOS, TOTAL_ASPECTOS } from '../../datos/matriz'
import estilos from './Vista.module.css'

const TOP_CRITICOS = 10

export function Resumen({ resumen, cargando, error }) {
  if (cargando) return <Cargando mensaje="Cargando el consolidado…" />
  if (error) return <Alerta tono="error" titulo="No se pudo cargar el consolidado">{error}</Alerta>

  if (!resumen || resumen.total === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no hay validaciones"
        descripcion="Cuando los validadores empiecen a enviar el formulario, aquí verás los promedios por criterio y los aspectos críticos."
      />
    )
  }

  const criticos = resumen.aspectos
    .filter((aspecto) => aspecto.conteo > 0 && aspecto.promedio < UMBRAL_CRITICO)
    .sort((a, b) => a.promedio - b.promedio)

  const topCriticos = [...resumen.aspectos]
    .filter((aspecto) => aspecto.conteo > 0)
    .sort((a, b) => a.promedio - b.promedio)
    .slice(0, TOP_CRITICOS)

  return (
    <div className={estilos.vista}>
      <section className={estilos.cifras} aria-label="Cifras generales">
        <div className={estilos.cifra}>
          <span className={estilos.cifraValor}>{resumen.total}</span>
          <span className={estilos.cifraEtiqueta}>
            Validacion{resumen.total === 1 ? '' : 'es'} recibida{resumen.total === 1 ? '' : 's'}
          </span>
        </div>
        <div className={estilos.cifra}>
          <span
            className={estilos.cifraValor}
            style={{ color: colorDePromedio(resumen.promedio_general) }}
          >
            {formatearPromedio(resumen.promedio_general)}
          </span>
          <span className={estilos.cifraEtiqueta}>Promedio general (de 4)</span>
        </div>
        <div className={estilos.cifra}>
          <span className={estilos.cifraValor} style={{ color: criticos.length ? 'var(--nivel-1)' : undefined }}>
            {criticos.length}
          </span>
          <span className={estilos.cifraEtiqueta}>
            Aspectos críticos (bajo {UMBRAL_CRITICO})
          </span>
        </div>
        <div className={estilos.cifra}>
          <span className={estilos.cifraValor}>{resumen.total * TOTAL_ASPECTOS}</span>
          <span className={estilos.cifraEtiqueta}>Valoraciones registradas</span>
        </div>
      </section>

      <section className={estilos.tarjeta} aria-labelledby="titulo-criterios">
        <h2 id="titulo-criterios" className={estilos.tituloTarjeta}>
          Promedio por criterio
        </h2>
        <p className={estilos.subtituloTarjeta}>
          En el orden del formulario. En verde el de mejor promedio, en rojo el que más atención
          necesita.
        </p>
        <BarrasPorCriterio criterios={resumen.criterios} />
      </section>

      <section className={estilos.tarjeta} aria-labelledby="titulo-detalle">
        <h2 id="titulo-detalle" className={estilos.tituloTarjeta}>
          Detalle por aspecto
        </h2>
        <p className={estilos.subtituloTarjeta}>
          Promedio de cada aspecto dentro del criterio seleccionado, a través de todas las
          respuestas.
        </p>
        <DetallePorAspecto criterios={CRITERIOS} aspectos={resumen.aspectos} />
      </section>

      <section className={estilos.tarjeta} aria-labelledby="titulo-criticos">
        <h2 id="titulo-criticos" className={estilos.tituloTarjeta}>
          <Warning size={18} weight="regular" aria-hidden="true" /> Aspectos críticos
        </h2>
        <p className={estilos.subtituloTarjeta}>
          Los {TOP_CRITICOS} aspectos con menor promedio, de todos los criterios. El 1 es el más
          crítico.
        </p>

        <ol className={estilos.listaCriticos}>
          {topCriticos.map((aspecto, indice) => (
            <li key={aspecto.aspecto_id} className={estilos.critico}>
              <span className={estilos.criticoRango} aria-hidden="true">
                {indice + 1}
              </span>
              <span
                className={estilos.criticoPromedio}
                style={{ background: colorDePromedio(aspecto.promedio) }}
              >
                {formatearPromedio(aspecto.promedio)}
              </span>
              <div>
                <p className={estilos.criticoTexto}>{aspecto.aspecto}</p>
                <p className={estilos.criticoCriterio}>
                  Criterio {aspecto.criterio_id} — {aspecto.criterio}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
