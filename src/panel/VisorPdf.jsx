import { useState } from 'react'
import { DownloadSimple, ArrowSquareOut, ArrowClockwise } from '@phosphor-icons/react'
import { Boton } from '../ui/Boton'
import { Alerta } from '../ui/Estados'
import { regenerarPdf } from '../servicios/gas'
import estilos from './VisorPdf.module.css'

/**
 * Visor del acta en PDF.
 *
 * "Ver PDF" abre Drive en una pestaña nueva en vez de incrustarlo: el
 * archivo no siempre queda compartido como "cualquiera con el enlace" (falla
 * intermitente de Drive al compartir, ver GAS.md), pero quien administra el
 * panel es el dueño del archivo — a él Drive se lo abre igual aunque el
 * compartir público haya fallado. Si la generación falló al llegar la
 * respuesta, el PDF no existe todavía y se ofrece regenerarlo sin tener que
 * entrar al editor de Apps Script.
 */
export function VisorPdf({ respuestaId, fileId, onRegenerado }) {
  const [regenerando, setRegenerando] = useState(false)
  const [error, setError] = useState(null)

  async function reintentar() {
    // El botón ya se deshabilita con `cargando`, pero un doble clic muy
    // rápido puede disparar dos peticiones antes de que React vuelva a
    // renderizar: cada una crea su propio PDF en Drive, y la que termine de
    // última gana el enlace en la hoja aunque no sea la buena.
    if (regenerando) return
    setRegenerando(true)
    setError(null)
    try {
      const resultado = await regenerarPdf(respuestaId)
      onRegenerado?.(resultado)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setRegenerando(false)
    }
  }

  if (!fileId) {
    return (
      <div className={estilos.pendiente}>
        <Alerta tono="info" titulo="El PDF de esta validación no se generó">
          <p>
            La respuesta quedó guardada correctamente, pero la generación del acta falló. Puedes
            reintentarla ahora.
          </p>
        </Alerta>

        {error && <Alerta tono="error">{error}</Alerta>}

        <Boton
          variante="secundario"
          onClick={reintentar}
          cargando={regenerando}
          iconoIzquierda={<ArrowClockwise size={18} weight="regular" aria-hidden="true" />}
        >
          Generar el PDF
        </Boton>
      </div>
    )
  }

  return (
    <div className={estilos.visor}>
      <div className={estilos.acciones}>
        <a
          className={estilos.accion}
          href={`https://drive.google.com/uc?export=download&id=${fileId}`}
        >
          <DownloadSimple size={18} weight="regular" aria-hidden="true" />
          Descargar PDF
        </a>
        <a
          className={estilos.accion}
          href={`https://drive.google.com/file/d/${fileId}/view`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
          Ver PDF
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </div>
  )
}
