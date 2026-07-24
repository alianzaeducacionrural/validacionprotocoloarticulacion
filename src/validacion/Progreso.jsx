import { TOTAL_ASPECTOS } from '../datos/matriz'
import estilos from './Progreso.module.css'

/**
 * Barra de progreso fija en la parte superior.
 * Muestra a la vez dónde va el usuario ("Criterio 4 de 10") y cuánto
 * lleva realmente valorado, que es lo que determina si puede enviar.
 */
export function Progreso({ etiquetaPaso, valorados, porcentaje }) {
  return (
    <div className={estilos.contenedor}>
      <div className={estilos.interior}>
        <div className={estilos.textos}>
          <span className={estilos.paso}>{etiquetaPaso}</span>
          <span className={estilos.conteo}>
            <span className={estilos.numero}>{valorados}</span>
            <span className={estilos.deTotal}> / {TOTAL_ASPECTOS} aspectos</span>
          </span>
        </div>

        <div
          className={estilos.barra}
          role="progressbar"
          aria-valuenow={valorados}
          aria-valuemin={0}
          aria-valuemax={TOTAL_ASPECTOS}
          aria-label={`${valorados} de ${TOTAL_ASPECTOS} aspectos valorados`}
        >
          <div className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
        </div>
      </div>
    </div>
  )
}
