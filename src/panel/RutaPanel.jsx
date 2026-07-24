import { useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { ChartBar, ListChecks, Table } from '@phosphor-icons/react'
import { MarcaInstitucional } from '../ui/MarcaInstitucional'
import { Resumen } from './vistas/Resumen'
import { Aspectos } from './vistas/Aspectos'
import { Respuestas } from './vistas/Respuestas'
import { Respuesta } from './vistas/Respuesta'
import { useDatos } from './useDatos'
import estilos from './RutaPanel.module.css'

const SECCIONES = [
  { a: '', etiqueta: 'Resumen', Icono: ChartBar, exacta: true },
  { a: 'aspectos', etiqueta: 'Aspectos', Icono: ListChecks, exacta: false },
  { a: 'respuestas', etiqueta: 'Respuestas', Icono: Table, exacta: false },
]

/**
 * Panel de consolidación. Sin credenciales y sin enlace desde el formulario:
 * se llega escribiendo /admin. El `noindex` se refuerza aquí además del
 * index.html y del robots.txt.
 */
export function RutaPanel() {
  useEffect(() => {
    const anterior = document.title
    document.title = 'Panel de validación — Protocolo de Articulación'
    return () => {
      document.title = anterior
    }
  }, [])

  const datos = useDatos()

  return (
    <div className={estilos.panel}>
      <header className={estilos.cabecera}>
        <div className={estilos.cabeceraInterior}>
          <MarcaInstitucional tamano="compacto" />
          <div>
            <p className={estilos.antetitulo}>Panel de consolidación</p>
            <h1 className={estilos.titulo}>Validación técnica del Protocolo de Articulación</h1>
          </div>
        </div>

        <nav className={estilos.navegacion} aria-label="Secciones del panel">
          <div className={estilos.navegacionInterior}>
            {SECCIONES.map(({ a, etiqueta, Icono, exacta }) => (
              <NavLink
                key={etiqueta}
                to={a ? `/admin/${a}` : '/admin'}
                end={exacta}
                className={({ isActive }) =>
                  `${estilos.enlace} ${isActive ? estilos.enlaceActivo : ''}`
                }
              >
                <Icono size={18} weight="regular" aria-hidden="true" />
                <span>{etiqueta}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className={estilos.contenido}>
        <Routes>
          <Route index element={<Resumen {...datos} />} />
          <Route path="aspectos" element={<Aspectos {...datos} />} />
          <Route path="respuestas" element={<Respuestas {...datos} />} />
          <Route path="respuestas/:id" element={<Respuesta />} />
        </Routes>
      </main>
    </div>
  )
}
