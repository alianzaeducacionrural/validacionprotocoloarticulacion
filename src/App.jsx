import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RutaValidacion } from './validacion/RutaValidacion'
import { Cargando } from './ui/Estados'

/**
 * El panel se carga bajo demanda: arrastra Recharts y solo lo usa el equipo
 * coordinador. Así el formulario público —que se llena desde zonas rurales con
 * conexión inestable— no descarga código que nunca va a ejecutar.
 */
const RutaPanel = lazy(() =>
  import('./panel/RutaPanel').then((modulo) => ({ default: modulo.RutaPanel })),
)

/**
 * El panel vive en /admin y NO se enlaza desde el formulario: se llega
 * escribiendo la URL. Para que GitHub Pages no devuelva 404 al entrar directo,
 * el despliegue copia index.html a 404.html (ver .github/workflows/deploy.yml).
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<RutaValidacion />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<Cargando mensaje="Cargando el panel…" />}>
              <RutaPanel />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
