import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { Cargando, Alerta } from '../../ui/Estados'
import { VisorPdf } from '../VisorPdf'
import { obtenerRespuesta } from '../../servicios/gas'
import { CRITERIOS, CAMPOS_CONSOLIDADO } from '../../datos/matriz'
import { nivelPorValor, colorDePromedio, formatearPromedio } from '../../datos/escala'
import estilos from './Vista.module.css'

function FilaValoracion({ valoracion }) {
  const nivel = nivelPorValor(valoracion.valoracion)

  return (
    <li className={estilos.filaValoracion}>
      <div className={estilos.filaCabecera}>
        <span className={estilos.filaId}>{valoracion.aspecto_id}</span>
        <p className={estilos.filaTexto}>{valoracion.aspecto}</p>
        <span className={estilos.filaNivel} style={{ background: nivel?.color }}>
          {valoracion.valoracion}
          <span className={estilos.filaNivelTexto}>{nivel?.corta}</span>
        </span>
      </div>

      {(valoracion.observaciones || valoracion.ajustes_requeridos || valoracion.responsable) && (
        <dl className={estilos.filaDetalle}>
          {valoracion.observaciones && (
            <div>
              <dt>Observaciones</dt>
              <dd>{valoracion.observaciones}</dd>
            </div>
          )}
          {valoracion.ajustes_requeridos && (
            <div>
              <dt>Ajustes requeridos</dt>
              <dd>{valoracion.ajustes_requeridos}</dd>
            </div>
          )}
          {valoracion.responsable && (
            <div>
              <dt>Responsable</dt>
              <dd>{valoracion.responsable}</dd>
            </div>
          )}
        </dl>
      )}
    </li>
  )
}

export function Respuesta() {
  const { id } = useParams()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setDatos(await obtenerRespuesta(id))
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (cargando) return <Cargando mensaje="Cargando la validación…" />
  if (error) return <Alerta tono="error" titulo="No se pudo cargar la validación">{error}</Alerta>
  if (!datos) return null

  const { respuesta, valoraciones } = datos
  const porCriterio = CRITERIOS.map((criterio) => ({
    ...criterio,
    filas: valoraciones.filter((valoracion) => Number(valoracion.criterio_id) === criterio.id),
  }))

  const validadores = respuesta.validadores ?? []
  const [primerValidador] = validadores
  const tituloValidadores =
    validadores.length <= 1
      ? primerValidador?.nombre || 'Sin nombre'
      : `${primerValidador?.nombre} y ${validadores.length - 1} persona${
          validadores.length - 1 === 1 ? '' : 's'
        } más`
  const subtituloValidadores =
    validadores.length <= 1
      ? [primerValidador?.cargo, primerValidador?.entidad].filter(Boolean).join(' · ')
      : `${validadores.length} personas validaron esta respuesta`

  const consolidadoConTexto = CAMPOS_CONSOLIDADO.filter(
    (campo) => respuesta[`consolidado_${campo.clave}`],
  )

  return (
    <div className={estilos.vista}>
      <Link to="/admin/respuestas" className={estilos.volver}>
        <ArrowLeft size={16} weight="regular" aria-hidden="true" />
        Volver a las respuestas
      </Link>

      <header className={estilos.detalleCabecera}>
        <div>
          <h2 className={estilos.detalleTitulo}>{tituloValidadores}</h2>
          <p className={estilos.detalleSubtitulo}>{subtituloValidadores}</p>
        </div>
        <span
          className={estilos.detallePromedio}
          style={{ background: colorDePromedio(respuesta.promedio_general) }}
        >
          {formatearPromedio(respuesta.promedio_general)}
          <span className={estilos.detallePromedioEtiqueta}>promedio</span>
        </span>
      </header>

      <dl className={estilos.metadatos}>
        <div>
          <dt>Versión del documento</dt>
          <dd>{respuesta.version_documento}</dd>
        </div>
        <div>
          <dt>Fecha de validación</dt>
          <dd>{respuesta.fecha_validacion}</dd>
        </div>
      </dl>

      {validadores.length > 1 && (
        <section className={estilos.tarjeta} aria-labelledby="titulo-personas">
          <h3 id="titulo-personas" className={estilos.tituloTarjeta}>
            Personas que validaron
          </h3>
          <ul className={estilos.listaPersonas}>
            {validadores.map((validador, indice) => (
              <li key={indice} className={estilos.filaPersona}>
                <span className={estilos.personaNombre}>{validador.nombre}</span>
                <span className={estilos.personaDetalle}>
                  {[validador.cargo, validador.entidad].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={estilos.tarjeta} aria-labelledby="titulo-acta">
        <h3 id="titulo-acta" className={estilos.tituloTarjeta}>
          Acta en PDF
        </h3>
        <VisorPdf
          respuestaId={respuesta.id}
          fileId={respuesta.pdf_file_id}
          onRegenerado={cargar}
        />
      </section>

      {consolidadoConTexto.length > 0 && (
        <section className={estilos.tarjeta} aria-labelledby="titulo-consolidado">
          <h3 id="titulo-consolidado" className={estilos.tituloTarjeta}>
            Consolidado de la validación
          </h3>
          <dl className={estilos.consolidado}>
            {consolidadoConTexto.map((campo) => (
              <div key={campo.clave}>
                <dt>{campo.etiqueta}</dt>
                <dd>{respuesta[`consolidado_${campo.clave}`]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="titulo-matriz">
        <h3 id="titulo-matriz" className={estilos.tituloSeccion}>
          Matriz completa
        </h3>

        {porCriterio.map((criterio) => (
          <div key={criterio.id} className={estilos.bloqueCriterio}>
            <h4 className={estilos.tituloCriterio}>
              {criterio.id}. {criterio.nombre}
            </h4>
            <ul className={estilos.listaValoraciones}>
              {criterio.filas.map((valoracion) => (
                <FilaValoracion key={valoracion.aspecto_id} valoracion={valoracion} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
