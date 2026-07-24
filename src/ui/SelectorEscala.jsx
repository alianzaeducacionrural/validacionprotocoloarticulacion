import { useId, useRef } from 'react'
import { NIVELES } from '../datos/escala'
import estilos from './SelectorEscala.module.css'

/**
 * Selector de valoración 1–4. Aparece 29 veces en el formulario, así que
 * define la experiencia completa.
 *
 * Accesibilidad:
 * - `role="radiogroup"` con opciones `role="radio"`, navegables con flechas
 *   (patrón APG: una sola parada de tabulación para todo el grupo).
 * - Cada opción muestra número + etiqueta, nunca solo color.
 * - Objetivo táctil de 44px de alto mínimo.
 */
export function SelectorEscala({ etiqueta, valor, onChange, error = false, descritoPor }) {
  const idGrupo = useId()
  const refs = useRef([])

  const indiceActual = NIVELES.findIndex((nivel) => nivel.valor === valor)

  function alPresionarTecla(evento) {
    const teclas = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }
    const paso = teclas[evento.key]

    if (paso) {
      evento.preventDefault()
      // Sin selección previa: la primera flecha entra por el extremo correspondiente.
      const base = indiceActual === -1 ? (paso > 0 ? -1 : NIVELES.length) : indiceActual
      const siguiente = (base + paso + NIVELES.length) % NIVELES.length
      onChange(NIVELES[siguiente].valor)
      refs.current[siguiente]?.focus()
      return
    }

    if (evento.key === 'Home' || evento.key === 'End') {
      evento.preventDefault()
      const indice = evento.key === 'Home' ? 0 : NIVELES.length - 1
      onChange(NIVELES[indice].valor)
      refs.current[indice]?.focus()
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      aria-describedby={descritoPor}
      aria-invalid={error || undefined}
      className={`${estilos.grupo} ${error ? estilos.conError : ''}`}
      onKeyDown={alPresionarTecla}
    >
      {NIVELES.map((nivel, indice) => {
        const seleccionado = valor === nivel.valor
        return (
          <button
            key={nivel.valor}
            ref={(elemento) => {
              refs.current[indice] = elemento
            }}
            type="button"
            role="radio"
            aria-checked={seleccionado}
            id={`${idGrupo}-${nivel.valor}`}
            // Una sola parada de tabulación: la opción activa, o la primera si no hay.
            tabIndex={seleccionado || (indiceActual === -1 && indice === 0) ? 0 : -1}
            onClick={() => onChange(nivel.valor)}
            className={`${estilos.opcion} ${seleccionado ? estilos.activa : ''}`}
            style={seleccionado ? { '--color-nivel': nivel.color } : undefined}
          >
            <span className={estilos.numero} aria-hidden="true">
              {nivel.valor}
            </span>
            <span className={estilos.texto}>{nivel.corta}</span>
            <span className="sr-only">
              {nivel.valor} — {nivel.etiqueta}
            </span>
          </button>
        )
      })}
    </div>
  )
}
