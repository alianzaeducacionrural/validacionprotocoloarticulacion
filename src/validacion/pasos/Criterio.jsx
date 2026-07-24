import { useState } from 'react'
import { Plus, Minus } from '@phosphor-icons/react'
import { SelectorEscala } from '../../ui/SelectorEscala'
import { AreaTexto, Campo } from '../../ui/Campo'
import estilos from './Criterio.module.css'

const CAMPOS_DETALLE = [
  {
    clave: 'observaciones',
    etiqueta: 'Observaciones',
    ayuda: 'Qué encontraste al revisar este aspecto.',
  },
  {
    clave: 'ajustes_requeridos',
    etiqueta: 'Ajustes requeridos',
    ayuda: 'Qué habría que cambiar en el documento.',
  },
]

/** Una fila de la matriz: el aspecto, su valoración y sus campos de detalle. */
function Aspecto({ aspecto, indice, datos = {}, onCambio, pendiente, refPrimerPendiente }) {
  const tieneContenido =
    Boolean(datos.observaciones) || Boolean(datos.ajustes_requeridos) || Boolean(datos.responsable)

  // Progressive disclosure: los campos de texto arrancan plegados y solo se
  // despliegan si el validador los pide o si ya traen contenido guardado.
  const [abierto, setAbierto] = useState(tieneContenido)

  const idAviso = `aviso-${aspecto.id}`

  return (
    <li
      className={`${estilos.aspecto} ${pendiente ? estilos.pendiente : ''}`}
      ref={refPrimerPendiente}
      tabIndex={-1}
    >
      <div className={estilos.enunciado}>
        <span className={estilos.indice} aria-hidden="true">
          {indice}
        </span>
        <p className={estilos.texto}>{aspecto.texto}</p>
      </div>

      <div className={estilos.selector}>
        <SelectorEscala
          etiqueta={aspecto.texto}
          valor={datos.valoracion}
          onChange={(valor) => onCambio(aspecto.id, 'valoracion', valor)}
          error={pendiente}
          descritoPor={pendiente ? idAviso : undefined}
        />
      </div>

      {pendiente && (
        <p className={estilos.aviso} id={idAviso} role="alert">
          Falta valorar este aspecto.
        </p>
      )}

      <button
        type="button"
        className={estilos.alternador}
        onClick={() => setAbierto((previo) => !previo)}
        aria-expanded={abierto}
        aria-controls={`detalle-${aspecto.id}`}
      >
        {abierto ? (
          <Minus size={14} weight="bold" aria-hidden="true" />
        ) : (
          <Plus size={14} weight="bold" aria-hidden="true" />
        )}
        <span>
          {abierto ? 'Ocultar observaciones' : 'Agregar observaciones'}
          {!abierto && tieneContenido && <span className={estilos.marca}> · con contenido</span>}
        </span>
      </button>

      {abierto && (
        <div className={estilos.detalle} id={`detalle-${aspecto.id}`}>
          {CAMPOS_DETALLE.map((campo) => (
            <AreaTexto
              key={campo.clave}
              etiqueta={campo.etiqueta}
              ayuda={campo.ayuda}
              filas={2}
              valor={datos[campo.clave]}
              onChange={(valor) => onCambio(aspecto.id, campo.clave, valor)}
            />
          ))}
          <Campo
            etiqueta="Responsable"
            ayuda="Quién debe realizar el ajuste."
            valor={datos.responsable}
            onChange={(valor) => onCambio(aspecto.id, 'responsable', valor)}
          />
        </div>
      )}
    </li>
  )
}

export function Criterio({
  criterio,
  posicion,
  total,
  valoraciones,
  onCambio,
  pendientes,
  refPrimerPendiente,
}) {
  const primerPendiente = pendientes[0]

  return (
    <div className={estilos.paso}>
      <header className={estilos.encabezado}>
        <p className={estilos.contador}>
          Criterio {posicion} de {total}
        </p>
        <h1 className={estilos.titulo}>{criterio.nombre}</h1>
        <p className={estilos.descripcion}>
          {criterio.aspectos.length === 1
            ? 'Un aspecto por valorar.'
            : `${criterio.aspectos.length} aspectos por valorar.`}{' '}
          Solo la valoración es obligatoria.
        </p>
      </header>

      <ol className={estilos.lista}>
        {criterio.aspectos.map((aspecto, indice) => (
          <Aspecto
            key={aspecto.id}
            aspecto={aspecto}
            indice={`${criterio.id}.${indice + 1}`}
            datos={valoraciones[aspecto.id]}
            onCambio={onCambio}
            pendiente={pendientes.includes(aspecto.id)}
            refPrimerPendiente={aspecto.id === primerPendiente ? refPrimerPendiente : undefined}
          />
        ))}
      </ol>
    </div>
  )
}
