import { AreaTexto } from '../../ui/Campo'
import { Alerta } from '../../ui/Estados'
import { CAMPOS_CONSOLIDADO, TOTAL_ASPECTOS } from '../../datos/matriz'
import { formatearPromedio } from '../../datos/escala'
import estilos from './Paso.module.css'

export function Consolidado({ datos, onCambio, valorados, promedio, incompletos, onIrACriterio }) {
  const completa = valorados === TOTAL_ASPECTOS

  return (
    <div className={estilos.paso}>
      <header className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Consolidado de la validación</h1>
        <p className={estilos.descripcion}>
          Apreciación general del documento, más allá de aspecto por aspecto. Todos los campos son
          opcionales.
        </p>
      </header>

      <div className={estilos.resumen}>
        <div className={estilos.dato}>
          <span className={estilos.datoValor}>
            {valorados}
            <span className={estilos.datoTotal}>/{TOTAL_ASPECTOS}</span>
          </span>
          <span className={estilos.datoEtiqueta}>Aspectos valorados</span>
        </div>
        <div className={estilos.dato}>
          <span className={estilos.datoValor}>{formatearPromedio(promedio)}</span>
          <span className={estilos.datoEtiqueta}>Promedio general</span>
        </div>
      </div>

      {!completa && (
        <Alerta tono="error" titulo="Faltan aspectos por valorar">
          <p>Para enviar la validación debes valorar los {TOTAL_ASPECTOS} aspectos.</p>
          <ul className={estilos.faltantes}>
            {incompletos.map((criterio) => (
              <li key={criterio.id}>
                <button
                  type="button"
                  className={estilos.enlaceCriterio}
                  onClick={() => onIrACriterio(criterio.id)}
                >
                  {criterio.nombre}
                </button>
                <span className={estilos.faltantesConteo}>
                  {criterio.pendientes} pendiente{criterio.pendientes === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        </Alerta>
      )}

      <div className={estilos.rejillaConsolidado}>
        {CAMPOS_CONSOLIDADO.map((campo) => (
          <AreaTexto
            key={campo.clave}
            etiqueta={campo.etiqueta}
            ayuda={campo.ayuda}
            filas={4}
            valor={datos[campo.clave]}
            onChange={(valor) => onCambio(campo.clave, valor)}
          />
        ))}
      </div>
    </div>
  )
}
