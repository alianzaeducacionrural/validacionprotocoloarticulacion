import estilos from './Boton.module.css'

/**
 * Botón. Variantes: `primario`, `secundario`, `texto`.
 * En estado de carga se deshabilita y anuncia el cambio por `aria-live`.
 */
export function Boton({
  children,
  variante = 'primario',
  tipo = 'button',
  cargando = false,
  disabled = false,
  iconoIzquierda,
  iconoDerecha,
  className,
  ...resto
}) {
  return (
    <button
      type={tipo}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${estilos.boton} ${estilos[variante]} ${className ?? ''}`}
      {...resto}
    >
      {cargando ? (
        <>
          <span className={estilos.girador} aria-hidden="true" />
          <span>Enviando…</span>
        </>
      ) : (
        <>
          {iconoIzquierda}
          <span>{children}</span>
          {iconoDerecha}
        </>
      )}
    </button>
  )
}
