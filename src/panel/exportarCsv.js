/**
 * Exportación a CSV.
 *
 * El BOM al inicio es lo que hace que Excel en Windows respete los acentos;
 * sin él "Coherencia pedagógica" se abre como "Coherencia pedagÃ³gica".
 */

function escapar(valor) {
  const texto = valor == null ? '' : String(valor)
  if (/[";\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

/** Descarga `filas` (array de arrays) como CSV separado por punto y coma. */
export function descargarCsv(nombreArchivo, encabezados, filas) {
  // Punto y coma: es el separador que espera Excel en configuración regional española.
  const contenido = [encabezados, ...filas].map((fila) => fila.map(escapar).join(';')).join('\r\n')

  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}

const HOY = () => new Date().toISOString().slice(0, 10)

export function exportarAspectos(aspectos) {
  descargarCsv(
    `aspectos-validacion-${HOY()}.csv`,
    [
      'Aspecto',
      'Criterio',
      'Texto del aspecto',
      'Promedio',
      'Valoraciones',
      'Nivel 1',
      'Nivel 2',
      'Nivel 3',
      'Nivel 4',
      'Observaciones',
      'Ajustes requeridos',
      'Responsables',
    ],
    aspectos.map((aspecto) => [
      aspecto.aspecto_id,
      aspecto.criterio,
      aspecto.aspecto,
      aspecto.promedio?.toFixed(2) ?? '',
      aspecto.conteo,
      aspecto.distribucion[1] ?? 0,
      aspecto.distribucion[2] ?? 0,
      aspecto.distribucion[3] ?? 0,
      aspecto.distribucion[4] ?? 0,
      aspecto.comentarios
        .filter((c) => c.observaciones)
        .map((c) => `[${c.entidad}] ${c.observaciones}`)
        .join(' | '),
      aspecto.comentarios
        .filter((c) => c.ajustes_requeridos)
        .map((c) => `[${c.entidad}] ${c.ajustes_requeridos}`)
        .join(' | '),
      aspecto.comentarios
        .filter((c) => c.responsable)
        .map((c) => c.responsable)
        .join(' | '),
    ]),
  )
}

export function exportarRespuestas(respuestas) {
  descargarCsv(
    `respuestas-validacion-${HOY()}.csv`,
    [
      'ID',
      'Fecha de registro',
      'Versión del documento',
      'Fecha de validación',
      'Validador',
      'Entidad',
      'Cargo',
      'Promedio',
      'PDF',
    ],
    respuestas.map((respuesta) => {
      const validadores = respuesta.validadores ?? []
      return [
        respuesta.id,
        respuesta.timestamp,
        respuesta.version_documento,
        respuesta.fecha_validacion,
        validadores.map((v) => v.nombre).join('; '),
        validadores.map((v) => v.entidad).join('; '),
        validadores.map((v) => v.cargo).join('; '),
        respuesta.promedio_general?.toFixed?.(2) ?? respuesta.promedio_general ?? '',
        respuesta.pdf_url || 'pendiente',
      ]
    }),
  )
}
