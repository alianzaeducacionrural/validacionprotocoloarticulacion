import { CheckCircle, DownloadSimple } from '@phosphor-icons/react'
import { MarcaInstitucional } from '../../ui/MarcaInstitucional'
import { TOTAL_ASPECTOS } from '../../datos/matriz'
import estilosBoton from '../../ui/Boton.module.css'
import estilos from './Enviado.module.css'

export function Enviado({ nombre, pdfFileId }) {
  return (
    <div className={estilos.enviado}>
      <MarcaInstitucional />

      <div className={estilos.contenido}>
        <CheckCircle size={48} weight="regular" className={estilos.icono} aria-hidden="true" />
        <h1 className={estilos.titulo}>Validación registrada</h1>
        <p className={estilos.texto}>
          {nombre ? `Gracias, ${nombre}. ` : 'Gracias. '}
          Recibimos tu valoración de los {TOTAL_ASPECTOS} aspectos del protocolo.
        </p>
        <p className={estilos.nota}>
          El equipo coordinador del Proyecto La Universidad en el Campo consolidará tus
          observaciones junto con las del resto de validadores. Ya puedes cerrar esta página.
        </p>

        {pdfFileId && (
          <a
            className={`${estilosBoton.boton} ${estilosBoton.primario}`}
            href={`https://drive.google.com/uc?export=download&id=${pdfFileId}`}
          >
            <DownloadSimple size={18} weight="regular" aria-hidden="true" />
            <span>Descargar mi acta en PDF</span>
          </a>
        )}
      </div>
    </div>
  )
}
