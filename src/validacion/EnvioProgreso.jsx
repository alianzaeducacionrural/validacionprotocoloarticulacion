import { useEffect, useState } from 'react'
import { CloudArrowUp, FilePdf, Check } from '@phosphor-icons/react'
import { MarcaInstitucional } from '../ui/MarcaInstitucional'
import estilos from './EnvioProgreso.module.css'

const PASOS = [
  { id: 'guardar', etiqueta: 'Guardando tu validación', icono: CloudArrowUp },
  { id: 'pdf', etiqueta: 'Generando el acta en PDF', icono: FilePdf },
]

/**
 * El backend hace esto en un solo request (no hay progreso real que leer del
 * servidor): primero escribe las 29 filas en Sheets, después arma el PDF.
 * Lo primero es rápido y consistente, así que el paso 1 avanza solo con un
 * temporizador en vez de esperar respuesta — nunca se adelanta al segundo
 * paso, que sí se queda animado hasta que el fetch real resuelve (lo
 * desmonta RutaValidacion cuando llega la respuesta).
 */
const DURACION_PASO_GUARDAR = 1100

export function EnvioProgreso() {
  const [pasoActivo, setPasoActivo] = useState(0)

  useEffect(() => {
    const temporizador = setTimeout(() => setPasoActivo(1), DURACION_PASO_GUARDAR)
    return () => clearTimeout(temporizador)
  }, [])

  return (
    <div className={estilos.contenedor}>
      <MarcaInstitucional />

      <div className={estilos.cuerpo} role="status" aria-live="polite">
        <ol className={estilos.pasos}>
          {PASOS.map((paso, indice) => {
            const Icono = paso.icono
            const completado = indice < pasoActivo
            const activo = indice === pasoActivo

            return (
              <li key={paso.id} className={estilos.paso}>
                {indice > 0 && (
                  <span
                    className={`${estilos.linea} ${completado || activo ? estilos.lineaRecorrida : ''}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`${estilos.circulo} ${activo ? estilos.activo : ''} ${completado ? estilos.completado : ''}`}
                >
                  {completado ? (
                    <Check size={20} weight="bold" aria-hidden="true" />
                  ) : (
                    <Icono size={20} weight="regular" aria-hidden="true" />
                  )}
                </span>
                <span className={estilos.etiqueta}>{paso.etiqueta}</span>
              </li>
            )
          })}
        </ol>

        <p className={estilos.nota}>Esto puede tardar unos segundos. No cierres esta página.</p>
      </div>
    </div>
  )
}
