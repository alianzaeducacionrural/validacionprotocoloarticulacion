import { useCallback, useEffect, useState } from 'react'

const CLAVE = 'validacion-protocolo:borrador-v1'

/** Estado inicial vacío del formulario. */
export function estadoInicial() {
  return {
    identificacion: {
      // Fijo: por ahora solo circula la versión 1 del protocolo. No es un
      // campo editable, se muestra como dato informativo (ver Identificacion.jsx).
      version_documento: '1',
      fecha_validacion: '',
      // Una validación puede ser diligenciada por varias personas a la vez
      // (una sesión de comité, un grupo de trabajo). Siempre hay al menos una.
      validadores: [{ nombre: '', entidad: '', cargo: '' }],
    },
    // Por id de aspecto: { valoracion, observaciones, ajustes_requeridos, responsable }
    valoraciones: {},
    consolidado: {
      fortalezas: '',
      aspectos_mejorar: '',
      ajustes_prioritarios: '',
      recomendaciones: '',
    },
  }
}

/** Lee el borrador guardado, o null si no hay o está corrupto. */
export function leerBorrador() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return null
    const guardado = JSON.parse(crudo)
    if (!guardado?.datos) return null
    return guardado
  } catch {
    // localStorage bloqueado o JSON inválido: se ignora y se empieza limpio.
    return null
  }
}

export function borrarBorrador() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Sin almacenamiento disponible: no hay nada que borrar.
  }
}

/**
 * Estado del formulario con autoguardado en localStorage.
 *
 * Es lo que hace viable un formulario de 116 campos: nadie pierde 40 minutos
 * de trabajo por cerrar la pestaña o quedarse sin batería.
 */
export function useBorrador() {
  const [datos, setDatos] = useState(estadoInicial)
  const [paso, setPaso] = useState(0)

  // Guarda en cada cambio. El volumen es pequeño (~30 KB) y la escritura
  // es síncrona pero imperceptible frente a la cadencia de tecleo.
  //
  // En el paso 0 (portada) NO se escribe: el estado todavía está vacío y
  // guardarlo borraría el borrador de una sesión anterior antes de que el
  // validador alcance a decidir si quiere continuarla.
  useEffect(() => {
    if (paso === 0) return
    try {
      localStorage.setItem(
        CLAVE,
        JSON.stringify({ datos, paso, guardadoEn: new Date().toISOString() }),
      )
    } catch {
      // Modo privado o cuota llena: el formulario sigue funcionando sin respaldo.
    }
  }, [datos, paso])

  const actualizarIdentificacion = useCallback((campo, valor) => {
    setDatos((previo) => ({
      ...previo,
      identificacion: { ...previo.identificacion, [campo]: valor },
    }))
  }, [])

  const actualizarValidador = useCallback((indice, campo, valor) => {
    setDatos((previo) => ({
      ...previo,
      identificacion: {
        ...previo.identificacion,
        validadores: previo.identificacion.validadores.map((validador, i) =>
          i === indice ? { ...validador, [campo]: valor } : validador,
        ),
      },
    }))
  }, [])

  const agregarValidador = useCallback(() => {
    setDatos((previo) => ({
      ...previo,
      identificacion: {
        ...previo.identificacion,
        validadores: [
          ...previo.identificacion.validadores,
          { nombre: '', entidad: '', cargo: '' },
        ],
      },
    }))
  }, [])

  const quitarValidador = useCallback((indice) => {
    setDatos((previo) => ({
      ...previo,
      identificacion: {
        ...previo.identificacion,
        validadores: previo.identificacion.validadores.filter((_, i) => i !== indice),
      },
    }))
  }, [])

  const actualizarAspecto = useCallback((aspectoId, campo, valor) => {
    setDatos((previo) => ({
      ...previo,
      valoraciones: {
        ...previo.valoraciones,
        [aspectoId]: { ...previo.valoraciones[aspectoId], [campo]: valor },
      },
    }))
  }, [])

  const actualizarConsolidado = useCallback((campo, valor) => {
    setDatos((previo) => ({
      ...previo,
      consolidado: { ...previo.consolidado, [campo]: valor },
    }))
  }, [])

  const restaurar = useCallback((guardado) => {
    setDatos(guardado.datos)
    setPaso(guardado.paso ?? 0)
  }, [])

  const reiniciar = useCallback(() => {
    borrarBorrador()
    setDatos(estadoInicial())
    setPaso(0)
  }, [])

  return {
    datos,
    paso,
    setPaso,
    actualizarIdentificacion,
    actualizarValidador,
    agregarValidador,
    quitarValidador,
    actualizarAspecto,
    actualizarConsolidado,
    restaurar,
    reiniciar,
  }
}
