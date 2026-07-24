import { Warning, CheckCircle, Info, Tray, CircleNotch } from '@phosphor-icons/react'
import estilos from './Estados.module.css'

const ICONOS = {
  error: Warning,
  exito: CheckCircle,
  info: Info,
}

/** Mensaje de estado. Los de error y éxito se anuncian por `role="alert"`. */
export function Alerta({ tono = 'info', titulo, children }) {
  const Icono = ICONOS[tono] ?? Info
  const esUrgente = tono === 'error' || tono === 'exito'

  return (
    <div
      className={`${estilos.alerta} ${estilos[tono]}`}
      role={esUrgente ? 'alert' : undefined}
    >
      <Icono size={20} weight="regular" className={estilos.icono} aria-hidden="true" />
      <div>
        {titulo && <p className={estilos.tituloAlerta}>{titulo}</p>}
        {children && <div className={estilos.cuerpo}>{children}</div>}
      </div>
    </div>
  )
}

/** Indicador de carga con texto — nunca un spinner mudo. */
export function Cargando({ mensaje = 'Cargando…' }) {
  return (
    <div className={estilos.cargando} role="status">
      <CircleNotch size={24} weight="regular" className={estilos.girando} aria-hidden="true" />
      <p>{mensaje}</p>
    </div>
  )
}

/** Estado vacío: explica qué falta y, si aplica, qué hacer. */
export function EstadoVacio({ titulo, descripcion, accion }) {
  return (
    <div className={estilos.vacio}>
      <Tray size={32} weight="regular" className={estilos.iconoVacio} aria-hidden="true" />
      <h3 className={estilos.tituloVacio}>{titulo}</h3>
      {descripcion && <p className={estilos.descripcionVacio}>{descripcion}</p>}
      {accion}
    </div>
  )
}
