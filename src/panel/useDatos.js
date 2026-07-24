import { useCallback, useEffect, useState } from 'react'
import { obtenerResumen } from '../servicios/gas'

/**
 * Carga el consolidado una sola vez para todo el panel.
 *
 * Los promedios y la distribución los calcula el servidor: son ~29 × N
 * valoraciones y no tiene sentido traerlas todas al navegador solo para
 * promediarlas. Ver gas/Codigo.gs → construirResumen().
 */
export function useDatos() {
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const datos = await obtenerResumen()
      setResumen(datos)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { resumen, cargando, error, recargar }
}
