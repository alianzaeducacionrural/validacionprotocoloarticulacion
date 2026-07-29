import { CRITERIOS, ASPECTOS } from '../datos/matriz'

/**
 * Reglas de validación por paso.
 *
 * Principio: solo la valoración 1–4 es obligatoria. Observaciones, ajustes y
 * responsable son opcionales — exigir 116 campos garantizaría el abandono.
 */

/** Devuelve un objeto de errores por campo; vacío si el paso es válido. */
export function validarIdentificacion(identificacion) {
  const errores = {}

  // version_documento es fija (siempre "1"), no se valida: no es un campo editable.
  if (!identificacion.fecha_validacion) {
    errores.fecha_validacion = 'Indica la fecha de la validación.'
  }

  // Puede validar más de una persona a la vez; cada una necesita sus tres datos.
  const erroresValidadores = identificacion.validadores.map((validador) => {
    const erroresPersona = {}
    if (!validador.nombre.trim()) erroresPersona.nombre = 'Escribe el nombre completo.'
    if (!validador.entidad.trim()) {
      erroresPersona.entidad = 'Indica la entidad o institución que representa.'
    }
    if (!validador.cargo.trim()) erroresPersona.cargo = 'Indica el cargo o rol.'
    return erroresPersona
  })

  if (erroresValidadores.some((errorPersona) => Object.keys(errorPersona).length > 0)) {
    errores.validadores = erroresValidadores
  }

  return errores
}

/** Ids de los aspectos de un criterio que aún no tienen valoración. */
export function aspectosSinValorar(criterio, valoraciones) {
  return criterio.aspectos
    .filter((aspecto) => !valoraciones[aspecto.id]?.valoracion)
    .map((aspecto) => aspecto.id)
}

/** Cuántos de los 29 aspectos llevan valoración. */
export function contarValorados(valoraciones) {
  return ASPECTOS.filter((aspecto) => valoraciones[aspecto.id]?.valoracion).length
}

/** ¿Están los 29 aspectos valorados? */
export function estaCompleta(datos) {
  return contarValorados(datos.valoraciones) === ASPECTOS.length
}

/** Criterios que aún tienen aspectos pendientes, para el resumen final. */
export function criteriosIncompletos(valoraciones) {
  return CRITERIOS.filter((criterio) => aspectosSinValorar(criterio, valoraciones).length > 0).map(
    (criterio) => ({
      id: criterio.id,
      nombre: criterio.nombre,
      pendientes: aspectosSinValorar(criterio, valoraciones).length,
    }),
  )
}

/** Promedio general de las valoraciones registradas; null si no hay ninguna. */
export function promedioGeneral(valoraciones) {
  const valores = ASPECTOS.map((aspecto) => valoraciones[aspecto.id]?.valoracion).filter(Boolean)
  if (valores.length === 0) return null
  return valores.reduce((suma, valor) => suma + valor, 0) / valores.length
}
