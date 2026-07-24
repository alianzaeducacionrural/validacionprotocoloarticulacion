import { ArrowRight, ClockCounterClockwise, FloppyDisk } from '@phosphor-icons/react'
import { MarcaInstitucional } from '../../ui/MarcaInstitucional'
import { Boton } from '../../ui/Boton'
import { NIVELES } from '../../datos/escala'
import { TOTAL_ASPECTOS, TOTAL_CRITERIOS } from '../../datos/matriz'
import estilos from './Portada.module.css'

export function Portada({ onComenzar, borradorDisponible, onContinuar }) {
  return (
    <div className={estilos.portada}>
      <MarcaInstitucional />

      <header className={estilos.encabezado}>
        <p className={estilos.antetitulo}>Proyecto La Universidad en el Campo</p>
        <h1 className={estilos.titulo}>
          Matriz de validación técnica del Protocolo de Articulación de la Educación Media con la
          Educación Superior
        </h1>
        <p className={estilos.entrada}>
          Este instrumento recoge tu valoración técnica del protocolo. Vas a revisar{' '}
          <strong>{TOTAL_ASPECTOS} aspectos</strong> agrupados en{' '}
          <strong>{TOTAL_CRITERIOS} criterios</strong>, y al final registrarás una apreciación
          general del documento.
        </p>
      </header>

      {borradorDisponible && (
        <div className={estilos.retomar}>
          <ClockCounterClockwise size={20} weight="regular" aria-hidden="true" />
          <div>
            <p className={estilos.retomarTitulo}>Tienes una validación en curso</p>
            <p className={estilos.retomarTexto}>
              Guardamos lo que llevabas escrito. Puedes continuar donde quedaste.
            </p>
          </div>
          <Boton onClick={onContinuar}>Continuar</Boton>
        </div>
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-escala">
        <h2 id="titulo-escala" className={estilos.tituloSeccion}>
          Escala de valoración
        </h2>
        <ul className={estilos.escala}>
          {NIVELES.map((nivel) => (
            <li key={nivel.valor} className={estilos.nivel}>
              <span className={estilos.nivelNumero} style={{ background: nivel.color }}>
                {nivel.valor}
              </span>
              <span className={estilos.nivelEtiqueta}>{nivel.etiqueta}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-antes">
        <h2 id="titulo-antes" className={estilos.tituloSeccion}>
          Antes de empezar
        </h2>
        <ul className={estilos.notas}>
          <li>
            <FloppyDisk size={18} weight="regular" aria-hidden="true" />
            <span>
              Tus respuestas se guardan solas en este dispositivo a medida que escribes. Puedes
              cerrar y volver después.
            </span>
          </li>
          <li>
            <ClockCounterClockwise size={18} weight="regular" aria-hidden="true" />
            <span>
              Toma entre 40 y 60 minutos si comentas con detalle. Solo la valoración de 1 a 4 es
              obligatoria; las observaciones son opcionales.
            </span>
          </li>
        </ul>
      </section>

      <div className={estilos.acciones}>
        <Boton
          onClick={onComenzar}
          iconoDerecha={<ArrowRight size={18} weight="regular" aria-hidden="true" />}
        >
          {borradorDisponible ? 'Empezar una validación nueva' : 'Comenzar validación'}
        </Boton>
      </div>
    </div>
  )
}
