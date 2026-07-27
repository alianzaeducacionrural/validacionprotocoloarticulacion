import { useState } from 'react'
import { DownloadSimple, ArrowClockwise } from '@phosphor-icons/react'
import { Boton } from '../ui/Boton'
import { Alerta } from '../ui/Estados'
import { regenerarPdf } from '../servicios/gas'
import estilos from './VisorPdf.module.css'

/**
 * Visor del acta en PDF.
 *
 * Solo se ofrece descarga directa (/uc?export=download) — sin vista
 * incrustada ni enlace a "Abrir en Drive": el archivo no siempre queda
 * compartido como "cualquiera con el enlace" (falla intermitente de Drive al
 * compartir, ver GAS.md), así que ambos podían pedir un acceso que quien
 * mira el panel no tiene. Si la generación falló al llegar la respuesta, el
 * PDF no existe todavía y se ofrece regenerarlo sin tener que entrar al
 * editor de Apps Script.
 */
export function VisorPdf({ respuestaId, fileId, onRegenerado }) {
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
      </div>
    </div>
  )
}
