import { useState } from 'react'
import { ArrowSquareOut, DownloadSimple, ArrowClockwise, FilePdf } from '@phosphor-icons/react'
import { Boton } from '../ui/Boton'
import { Alerta } from '../ui/Estados'
import { regenerarPdf } from '../servicios/gas'
import estilos from './VisorPdf.module.css'

/**
 * Visor del acta en PDF.
 *
 * Drive expone /preview para incrustar y /uc?export=download para descargar.
 * Si la generación falló al llegar la respuesta, el PDF no existe todavía y
 * se ofrece regenerarlo sin tener que entrar al editor de Apps Script.
 */
export function VisorPdf({ respuestaId, fileId, url, onRegenerado }) {
  const [regenerando, setRegenerando] = useState(false)
  const [error, setError] = useState(null)

  async function reintentar() {
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
          href={url ?? `https://drive.google.com/file/d/${fileId}/view`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
          Abrir en Drive
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>

      <iframe
        className={estilos.marco}
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        title="Acta de validación en PDF"
        loading="lazy"
      />

      <p className={estilos.nota}>
        <FilePdf size={16} weight="regular" aria-hidden="true" />
        Si el documento no carga, tu navegador está bloqueando el contenido incrustado de Drive. Usa
        «Abrir en Drive».
      </p>
    </div>
  )
}
