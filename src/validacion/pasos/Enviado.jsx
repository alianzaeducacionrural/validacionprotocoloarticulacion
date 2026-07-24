import { CheckCircle } from '@phosphor-icons/react'
import { MarcaInstitucional } from '../../ui/MarcaInstitucional'
import { TOTAL_ASPECTOS } from '../../datos/matriz'
import estilos from './Enviado.module.css'

export function Enviado({ nombre }) {
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
      </div>
    </div>
  )
}
