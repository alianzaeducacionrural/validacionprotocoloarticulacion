import { Link } from 'react-router-dom'
import { Warning } from '@phosphor-icons/react'
import { Cargando, EstadoVacio, Alerta } from '../../ui/Estados'
import { BarrasPorCriterio } from '../graficas/BarrasPorCriterio'
import { DistribucionEscala } from '../graficas/DistribucionEscala'
import { formatearPromedio, colorDePromedio, UMBRAL_CRITICO } from '../../datos/escala'
import { TOTAL_ASPECTOS } from '../../datos/matriz'
import estilos from './Vista.module.css'

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
          Ordenado de menor a mayor: lo que más atención necesita aparece primero.
        </p>
        <BarrasPorCriterio criterios={resumen.criterios} />
      </section>

      <section className={estilos.tarjeta} aria-labelledby="titulo-distribucion">
        <h2 id="titulo-distribucion" className={estilos.tituloTarjeta}>
          Distribución de las valoraciones
        </h2>
        <p className={estilos.subtituloTarjeta}>
          Cómo se repartieron las {resumen.total * TOTAL_ASPECTOS} valoraciones entre los cuatro
          niveles de la escala.
        </p>
        <DistribucionEscala
          distribucion={resumen.distribucion}
          total={resumen.total * TOTAL_ASPECTOS}
        />
      </section>

      <section className={estilos.tarjeta} aria-labelledby="titulo-criticos">
        <h2 id="titulo-criticos" className={estilos.tituloTarjeta}>
          <Warning size={18} weight="regular" aria-hidden="true" /> Aspectos críticos
        </h2>
        <p className={estilos.subtituloTarjeta}>
          Aspectos cuyo promedio quedó por debajo de {UMBRAL_CRITICO}. Son los ajustes que el
          protocolo necesita con prioridad.
        </p>

        {criticos.length === 0 ? (
          <p className={estilos.sinCriticos}>
            Ningún aspecto quedó por debajo del umbral. Revisa la vista{' '}
            <Link to="/admin/aspectos">Aspectos</Link> para el detalle completo.
          </p>
        ) : (
          <ul className={estilos.listaCriticos}>
            {criticos.map((aspecto) => (
              <li key={aspecto.aspecto_id} className={estilos.critico}>
                <span
                  className={estilos.criticoPromedio}
                  style={{ background: colorDePromedio(aspecto.promedio) }}
                >
                  {formatearPromedio(aspecto.promedio)}
                </span>
                <div>
                  <p className={estilos.criticoTexto}>{aspecto.aspecto}</p>
                  <p className={estilos.criticoCriterio}>
                    {aspecto.aspecto_id} · {aspecto.criterio}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
