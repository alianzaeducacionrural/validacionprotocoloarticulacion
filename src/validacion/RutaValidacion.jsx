import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, PaperPlaneTilt } from '@phosphor-icons/react'
import { CRITERIOS, TOTAL_ASPECTOS, ASPECTOS } from '../datos/matriz'
import { enviarValidacion } from '../servicios/gas'
import { Boton } from '../ui/Boton'
import { Alerta } from '../ui/Estados'
import { Progreso } from './Progreso'
import { Portada } from './pasos/Portada'
import { Identificacion } from './pasos/Identificacion'
import { Criterio } from './pasos/Criterio'
import { Consolidado } from './pasos/Consolidado'
import { Enviado } from './pasos/Enviado'
import { useBorrador, leerBorrador, borrarBorrador } from './useBorrador'
import {
  validarIdentificacion,
  aspectosSinValorar,
  contarValorados,
  criteriosIncompletos,
  promedioGeneral,
} from './reglas'
import estilos from './RutaValidacion.module.css'

// Paso 0 = portada, 1 = identificación, 2..11 = criterios, 12 = consolidado.
const PASO_IDENTIFICACION = 1
const PASO_PRIMER_CRITERIO = 2
const PASO_CONSOLIDADO = PASO_PRIMER_CRITERIO + CRITERIOS.length

export function RutaValidacion() {
  const {
    datos,
    paso,
    setPaso,
    actualizarIdentificacion,
    actualizarAspecto,
    actualizarConsolidado,
    restaurar,
    reiniciar,
  } = useBorrador()

  const [erroresIdentificacion, setErroresIdentificacion] = useState({})
  const [pendientes, setPendientes] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [resultadoEnvio, setResultadoEnvio] = useState(null)
  const [borradorGuardado] = useState(() => leerBorrador())

  const principalRef = useRef(null)
  const primerPendienteRef = useRef(null)

  const valorados = contarValorados(datos.valoraciones)
  const porcentaje = Math.round((valorados / TOTAL_ASPECTOS) * 100)
  const criterioActual = CRITERIOS[paso - PASO_PRIMER_CRITERIO]

  // Cada cambio de paso vuelve al inicio del contenido y mueve el foco allí,
  // para que quien navega con teclado o lector de pantalla no quede perdido.
  useEffect(() => {
    if (paso === 0) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    principalRef.current?.focus()
  }, [paso])

  // Enfoca el primer aspecto sin valorar cuando el avance queda bloqueado.
  useEffect(() => {
    if (pendientes.length > 0) {
      primerPendienteRef.current?.focus()
    }
  }, [pendientes])

  function irA(nuevoPaso) {
    setPendientes([])
    setPaso(nuevoPaso)
  }

  function avanzar() {
    if (paso === PASO_IDENTIFICACION) {
      const errores = validarIdentificacion(datos.identificacion)
      setErroresIdentificacion(errores)
      if (Object.keys(errores).length > 0) return
    }

    if (criterioActual) {
      const faltantes = aspectosSinValorar(criterioActual, datos.valoraciones)
      if (faltantes.length > 0) {
        setPendientes(faltantes)
        return
      }
    }

    irA(paso + 1)
  }

  function retroceder() {
    irA(Math.max(paso - 1, PASO_IDENTIFICACION))
  }

  function validarCampoIdentificacion(campo) {
    const errores = validarIdentificacion(datos.identificacion)
    setErroresIdentificacion((previos) => ({ ...previos, [campo]: errores[campo] }))
  }

  async function enviar() {
    // El backend rechazaría una validación incompleta; se corta antes de la red.
    if (valorados < TOTAL_ASPECTOS) return

    setEnviando(true)
    setErrorEnvio(null)

    const payload = {
      identificacion: datos.identificacion,
      consolidado: datos.consolidado,
      valoraciones: ASPECTOS.map((aspecto) => {
        const registro = datos.valoraciones[aspecto.id] ?? {}
        return {
          criterio_id: aspecto.criterioId,
          criterio: aspecto.criterioNombre,
          aspecto_id: aspecto.id,
          aspecto: aspecto.texto,
          valoracion: registro.valoracion,
          observaciones: registro.observaciones ?? '',
          ajustes_requeridos: registro.ajustes_requeridos ?? '',
          responsable: registro.responsable ?? '',
        }
      }),
    }

    try {
      const resultado = await enviarValidacion(payload)
      borrarBorrador()
      setResultadoEnvio(resultado)
      setEnviado(true)
    } catch (error) {
      setErrorEnvio(error.message)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <main className={estilos.contenedorSimple}>
        <Enviado
          nombre={datos.identificacion.validador_nombre.split(' ')[0]}
          pdfFileId={resultadoEnvio?.pdf_file_id}
        />
      </main>
    )
  }

  if (paso === 0) {
    return (
      <main className={estilos.contenedorSimple}>
        <Portada
          borradorDisponible={Boolean(borradorGuardado) && borradorGuardado.paso > 0}
          onContinuar={() => restaurar(borradorGuardado)}
          onComenzar={() => {
            reiniciar()
            setPaso(PASO_IDENTIFICACION)
          }}
        />
      </main>
    )
  }

  const etiquetaPaso =
    paso === PASO_IDENTIFICACION
      ? 'Identificación'
      : paso === PASO_CONSOLIDADO
        ? 'Consolidado final'
        : `Criterio ${paso - PASO_PRIMER_CRITERIO + 1} de ${CRITERIOS.length}`

  const esUltimo = paso === PASO_CONSOLIDADO
  const completa = valorados === TOTAL_ASPECTOS

  return (
    <>
      <Progreso etiquetaPaso={etiquetaPaso} valorados={valorados} porcentaje={porcentaje} />

      <main className={estilos.contenedor} ref={principalRef} tabIndex={-1} id="contenido">
        {paso === PASO_IDENTIFICACION && (
          <Identificacion
            datos={datos.identificacion}
            onCambio={actualizarIdentificacion}
            onBlur={validarCampoIdentificacion}
            errores={erroresIdentificacion}
          />
        )}

        {criterioActual && (
          <Criterio
            criterio={criterioActual}
            posicion={paso - PASO_PRIMER_CRITERIO + 1}
            total={CRITERIOS.length}
            valoraciones={datos.valoraciones}
            onCambio={(aspectoId, campo, valor) => {
              actualizarAspecto(aspectoId, campo, valor)
              if (campo === 'valoracion') {
                setPendientes((previos) => previos.filter((id) => id !== aspectoId))
              }
            }}
            pendientes={pendientes}
            refPrimerPendiente={primerPendienteRef}
          />
        )}

        {esUltimo && (
          <Consolidado
            datos={datos.consolidado}
            onCambio={actualizarConsolidado}
            valorados={valorados}
            promedio={promedioGeneral(datos.valoraciones)}
            incompletos={criteriosIncompletos(datos.valoraciones)}
            onIrACriterio={(criterioId) => {
              const indice = CRITERIOS.findIndex((criterio) => criterio.id === criterioId)
              irA(PASO_PRIMER_CRITERIO + indice)
            }}
          />
        )}

        {errorEnvio && (
          <Alerta tono="error" titulo="No se pudo enviar la validación">
            <p>{errorEnvio}</p>
            <p>
              Tus respuestas siguen guardadas en este dispositivo. Revisa tu conexión e inténtalo de
              nuevo.
            </p>
          </Alerta>
        )}
      </main>

      <nav className={estilos.navegacion} aria-label="Navegación del formulario">
        <div className={estilos.navegacionInterior}>
          <Boton
            variante="secundario"
            onClick={retroceder}
            disabled={paso === PASO_IDENTIFICACION}
            iconoIzquierda={<ArrowLeft size={18} weight="regular" aria-hidden="true" />}
          >
            Anterior
          </Boton>

          {esUltimo ? (
            <Boton
              onClick={enviar}
              cargando={enviando}
              disabled={!completa}
              iconoDerecha={<PaperPlaneTilt size={18} weight="regular" aria-hidden="true" />}
            >
              Enviar validación
            </Boton>
          ) : (
            <Boton
              onClick={avanzar}
              iconoDerecha={<ArrowRight size={18} weight="regular" aria-hidden="true" />}
            >
              Siguiente
            </Boton>
          )}
        </div>
      </nav>
    </>
  )
}
