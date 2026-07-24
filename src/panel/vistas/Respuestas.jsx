import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DownloadSimple, MagnifyingGlass, FilePdf, Clock } from '@phosphor-icons/react'
import { Cargando, EstadoVacio, Alerta } from '../../ui/Estados'
import { Boton } from '../../ui/Boton'
import { colorDePromedio, formatearPromedio } from '../../datos/escala'
import { exportarRespuestas } from '../exportarCsv'
import estilos from './Vista.module.css'

const COLUMNAS = [
  { clave: 'validador_nombre', etiqueta: 'Validador' },
  { clave: 'validador_entidad', etiqueta: 'Entidad' },
  { clave: 'fecha_validacion', etiqueta: 'Fecha' },
  { clave: 'promedio_general', etiqueta: 'Promedio', numerica: true },
]

export function Respuestas({ resumen, cargando, error }) {
  const [busqueda, setBusqueda] = useState('')
  const [ordenPor, setOrdenPor] = useState('fecha_validacion')
  const [ascendente, setAscendente] = useState(false)

  const filas = useMemo(() => {
    if (!resumen) return []

    const termino = busqueda.trim().toLowerCase()
    const filtradas = termino
      ? resumen.respuestas.filter((respuesta) =>
          [
            respuesta.validador_nombre,
            respuesta.validador_entidad,
            respuesta.validador_cargo,
          ]
            .join(' ')
            .toLowerCase()
            .includes(termino),
        )
      : resumen.respuestas

    return [...filtradas].sort((a, b) => {
      const valorA = a[ordenPor] ?? ''
      const valorB = b[ordenPor] ?? ''
      const comparacion =
        typeof valorA === 'number' && typeof valorB === 'number'
          ? valorA - valorB
          : String(valorA).localeCompare(String(valorB), 'es')
      return ascendente ? comparacion : -comparacion
    })
  }, [resumen, busqueda, ordenPor, ascendente])

  if (cargando) return <Cargando mensaje="Cargando las respuestas…" />
  if (error) return <Alerta tono="error" titulo="No se pudieron cargar las respuestas">{error}</Alerta>

  if (!resumen || resumen.total === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no hay validaciones"
        descripcion="Cada validación enviada aparecerá aquí, con su PDF generado automáticamente."
      />
    )
  }

  function alternarOrden(clave) {
    if (ordenPor === clave) {
      setAscendente((previo) => !previo)
    } else {
      setOrdenPor(clave)
      setAscendente(true)
    }
  }

  return (
    <div className={estilos.vista}>
      <div className={estilos.barraHerramientas}>
        <label className={estilos.buscador}>
          <MagnifyingGlass size={18} weight="regular" aria-hidden="true" />
          <span className="sr-only">Buscar validaciones</span>
          <input
            type="search"
            className={estilos.buscadorEntrada}
            placeholder="Buscar por validador, entidad o cargo"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </label>

        <Boton
          variante="secundario"
          onClick={() => exportarRespuestas(resumen.respuestas)}
          iconoIzquierda={<DownloadSimple size={18} weight="regular" aria-hidden="true" />}
        >
          Exportar CSV
        </Boton>
      </div>

      <p className={estilos.conteoResultados} role="status">
        {filas.length} de {resumen.total} validacion{resumen.total === 1 ? '' : 'es'}
      </p>

      <div className={estilos.tablaEnvoltura}>
        <table className={estilos.tabla}>
          <caption className="sr-only">
            Validaciones recibidas, con su promedio y el estado de su PDF
          </caption>
          <thead>
            <tr>
              {COLUMNAS.map((columna) => (
                <th
                  key={columna.clave}
                  scope="col"
                  aria-sort={
                    ordenPor === columna.clave
                      ? ascendente
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className={estilos.encabezadoBoton}
                    onClick={() => alternarOrden(columna.clave)}
                  >
                    {columna.etiqueta}
                    {ordenPor === columna.clave && (
                      <span aria-hidden="true">{ascendente ? ' ↑' : ' ↓'}</span>
                    )}
                  </button>
                </th>
              ))}
              <th scope="col">PDF</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((respuesta) => (
              <tr key={respuesta.id}>
                <td>
                  <span className={estilos.celdaPrincipal}>{respuesta.validador_nombre}</span>
                  <span className={estilos.celdaSecundaria}>{respuesta.validador_cargo}</span>
                </td>
                <td>{respuesta.validador_entidad}</td>
                <td className={estilos.celdaMono}>{respuesta.fecha_validacion}</td>
                <td>
                  <span
                    className={estilos.insignia}
                    style={{ background: colorDePromedio(respuesta.promedio_general) }}
                  >
                    {formatearPromedio(respuesta.promedio_general)}
                  </span>
                </td>
                <td>
                  {respuesta.pdf_url ? (
                    <span className={estilos.pdfListo}>
                      <FilePdf size={16} weight="regular" aria-hidden="true" /> Listo
                    </span>
                  ) : (
                    <span className={estilos.pdfPendiente}>
                      <Clock size={16} weight="regular" aria-hidden="true" /> Pendiente
                    </span>
                  )}
                </td>
                <td>
                  <Link className={estilos.enlaceDetalle} to={`/admin/respuestas/${respuesta.id}`}>
                    Ver detalle
                    <span className="sr-only"> de {respuesta.validador_nombre}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
