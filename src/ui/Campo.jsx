import { useId } from 'react'
import estilos from './Campo.module.css'

/**
 * Campo de texto con etiqueta visible siempre asociada por `htmlFor`.
 * El error se muestra junto al campo (no agrupado arriba) y con `role="alert"`.
 */
export function Campo({
  etiqueta,
  valor,
  onChange,
  onBlur,
  tipo = 'text',
  ayuda,
  error,
  requerido = false,
  autoComplete,
  ...resto
}) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`

  const descrito = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ')

  return (
    <div className={estilos.campo}>
      <label className={estilos.etiqueta} htmlFor={id}>
        {etiqueta}
        {requerido && (
          <span className={estilos.requerido} aria-hidden="true">
            *
          </span>
        )}
        {requerido && <span className="sr-only"> (obligatorio)</span>}
      </label>

      {ayuda && (
        <p className={estilos.ayuda} id={idAyuda}>
          {ayuda}
        </p>
      )}

      <input
        id={id}
        type={tipo}
        value={valor ?? ''}
        onChange={(evento) => onChange(evento.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito || undefined}
        className={`${estilos.entrada} ${error ? estilos.conError : ''}`}
        {...resto}
      />

      {error && (
        <p className={estilos.error} id={idError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** Área de texto multilínea. Mismas reglas de etiqueta y error que `Campo`. */
export function AreaTexto({
  etiqueta,
  valor,
  onChange,
  onBlur,
  ayuda,
  error,
  requerido = false,
  filas = 3,
  placeholder,
  ...resto
}) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`

  const descrito = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ')

  return (
    <div className={estilos.campo}>
      <label className={estilos.etiqueta} htmlFor={id}>
        {etiqueta}
        {requerido && (
          <span className={estilos.requerido} aria-hidden="true">
            *
          </span>
        )}
        {requerido && <span className="sr-only"> (obligatorio)</span>}
      </label>

      {ayuda && (
        <p className={estilos.ayuda} id={idAyuda}>
          {ayuda}
        </p>
      )}

      <textarea
        id={id}
        rows={filas}
        value={valor ?? ''}
        onChange={(evento) => onChange(evento.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito || undefined}
        className={`${estilos.entrada} ${estilos.area} ${error ? estilos.conError : ''}`}
        {...resto}
      />

      {error && (
        <p className={estilos.error} id={idError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
