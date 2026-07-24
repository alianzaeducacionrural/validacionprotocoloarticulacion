import { useMemo, useState } from 'react'
import { DownloadSimple } from '@phosphor-icons/react'
import { Cargando, EstadoVacio, Alerta } from '../../ui/Estados'
import { Boton } from '../../ui/Boton'
import { CRITERIOS } from '../../datos/matriz'
import { NIVELES, colorDePromedio, formatearPromedio, UMBRAL_CRITICO } from '../../datos/escala'
import { exportarAspectos } from '../exportarCsv'
import estilos from './Vista.module.css'

const ORDENES = [
  { clave: 'promedio', etiqueta: 'Promedio más bajo primero' },
  { clave: 'matriz', etiqueta: 'Orden de la matriz' },
]

function Comentarios({ comentarios }) {
  const conContenido = comentarios.filter(
    (c) => c.observaciones || c.ajustes_requeridos || c.responsable,
  )

  if (conContenido.length === 0) {
    return <p className={estilos.sinComentarios}>Nadie dejó observaciones en este aspecto.</p>
  }

  return (
    <ul className={estilos.comentarios}>
      {conContenido.map((comentario, indice) => (
        <li key={`${comentario.respuesta_id}-${indice}`} className={estilos.comentario}>
          <p className={estilos.autor}>
            {comentario.validador}
            <span className={estilos.autorEntidad}> · {comentario.entidad}</span>
          </p>
          {comentario.observaciones && (
            <p className={estilos.comentarioTexto}>
              <span className={estilos.comentarioClave}>Observación:</span>{' '}
              {comentario.observaciones}
            </p>
          )}
          {comentario.ajustes_requeridos && (
            <p className={estilos.comentarioTexto}>
              <span className={estilos.comentarioClave}>Ajuste requerido:</span>{' '}
              {comentario.ajustes_requeridos}
            </p>
          )}
          {comentario.responsable && (
            <p className={estilos.comentarioTexto}>
              <span className={estilos.comentarioClave}>Responsable:</span> {comentario.responsable}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export function Aspectos({ resumen, cargando, error }) {
  const [filtroCriterio, setFiltroCriterio] = useState('todos')
  const [orden, setOrden] = useState('promedio')

  const aspectos = useMemo(() => {
    if (!resumen) return []
    const filtrados =
      filtroCriterio === 'todos'
        ? resumen.aspectos
        : resumen.aspectos.filter((a) => String(a.criterio_id) === filtroCriterio)

    if (orden === 'matriz') return filtrados
    return [...filtrados].sort((a, b) => (a.promedio ?? 99) - (b.promedio ?? 99))
  }, [resumen, filtroCriterio, orden])

  if (cargando) return <Cargando mensaje="Cargando los aspectos…" />
  if (error) return <Alerta tono="error" titulo="No se pudieron cargar los aspectos">{error}</Alerta>

  if (!resumen || resumen.total === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no hay validaciones"
        descripcion="Cuando lleguen respuestas, aquí verás cada aspecto con su promedio y todas las observaciones agrupadas."
      />
    )
  }

  return (
    <div className={estilos.vista}>
      <div className={estilos.barraHerramientas}>
        <div className={estilos.filtros}>
          <label className={estilos.filtro}>
            <span className={estilos.filtroEtiqueta}>Criterio</span>
            <select
              className={estilos.select}
              value={filtroCriterio}
              onChange={(evento) => setFiltroCriterio(evento.target.value)}
            >
              <option value="todos">Todos los criterios</option>
              {CRITERIOS.map((criterio) => (
                <option key={criterio.id} value={String(criterio.id)}>
                  {criterio.id}. {criterio.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className={estilos.filtro}>
            <span className={estilos.filtroEtiqueta}>Orden</span>
            <select
              className={estilos.select}
              value={orden}
              onChange={(evento) => setOrden(evento.target.value)}
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.clave} value={opcion.clave}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Boton
          variante="secundario"
          onClick={() => exportarAspectos(resumen.aspectos)}
          iconoIzquierda={<DownloadSimple size={18} weight="regular" aria-hidden="true" />}
        >
          Exportar CSV
        </Boton>
      </div>

      <p className={estilos.conteoResultados} role="status">
        {aspectos.length} aspecto{aspectos.length === 1 ? '' : 's'}
        {filtroCriterio !== 'todos' && ' en este criterio'}
      </p>

      <ul className={estilos.listaAspectos}>
        {aspectos.map((aspecto) => {
          const critico = aspecto.conteo > 0 && aspecto.promedio < UMBRAL_CRITICO
          return (
            <li
              key={aspecto.aspecto_id}
              className={`${estilos.fichaAspecto} ${critico ? estilos.fichaCritica : ''}`}
            >
              <div className={estilos.fichaCabecera}>
                <span
                  className={estilos.fichaPromedio}
                  style={{ background: colorDePromedio(aspecto.promedio) }}
                >
                  {formatearPromedio(aspecto.promedio)}
                </span>
                <div className={estilos.fichaTextos}>
                  <p className={estilos.fichaCriterio}>
                    {aspecto.aspecto_id} · {aspecto.criterio}
                  </p>
                  <p className={estilos.fichaTexto}>{aspecto.aspecto}</p>
                </div>
              </div>

              <ul className={estilos.conteos}>
                {NIVELES.map((nivel) => (
                  <li key={nivel.valor} className={estilos.conteoNivel}>
                    <span className={estilos.conteoMarca} style={{ background: nivel.color }}>
                      {nivel.valor}
                    </span>
                    <span className={estilos.conteoCifra}>
                      {aspecto.distribucion[nivel.valor] ?? 0}
                    </span>
                    <span className="sr-only">{nivel.etiqueta}</span>
                  </li>
                ))}
              </ul>

              <Comentarios comentarios={aspecto.comentarios} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
