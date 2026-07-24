import { FileText, UserCircle } from '@phosphor-icons/react'
import { Campo } from '../../ui/Campo'
import estilos from './Paso.module.css'

export function Identificacion({ datos, onCambio, errores, onBlur }) {
  return (
    <div className={estilos.paso}>
      <header className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Identificación</h1>
        <p className={estilos.descripcion}>
          Datos del documento que estás validando y de quien realiza la validación.
        </p>
      </header>

      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>
          <FileText size={16} weight="bold" aria-hidden="true" />
          Documento validado
        </legend>

        <div className={estilos.grupoContenido}>
          <div className={estilos.campoFijo}>
            <span className={estilos.etiquetaFija}>Versión del documento</span>
            <span className={estilos.valorFijo}>
              <span className={estilos.valorFijoNumero} aria-hidden="true">
                1
              </span>
              <span className={estilos.valorFijoTexto}>Primera versión del protocolo</span>
            </span>
            <p className={estilos.notaFija}>
              Por ahora solo circula esta versión; no necesitas indicarla.
            </p>
          </div>

          <div className={estilos.rejilla}>
            <Campo
              etiqueta="Fecha de validación"
              tipo="date"
              valor={datos.fecha_validacion}
              onChange={(valor) => onCambio('fecha_validacion', valor)}
              onBlur={() => onBlur('fecha_validacion')}
              error={errores.fecha_validacion}
              requerido
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>
          <UserCircle size={16} weight="bold" aria-hidden="true" />
          Quien valida
        </legend>
        <div className={estilos.grupoContenido}>
          <Campo
            etiqueta="Nombre completo"
            valor={datos.validador_nombre}
            onChange={(valor) => onCambio('validador_nombre', valor)}
            onBlur={() => onBlur('validador_nombre')}
            error={errores.validador_nombre}
            autoComplete="name"
            requerido
          />
          <Campo
            etiqueta="Entidad o institución"
            valor={datos.validador_entidad}
            onChange={(valor) => onCambio('validador_entidad', valor)}
            onBlur={() => onBlur('validador_entidad')}
            error={errores.validador_entidad}
            ayuda="Institución educativa, secretaría, universidad u organización que representas."
            autoComplete="organization"
            requerido
          />
          <Campo
            etiqueta="Cargo o rol"
            valor={datos.validador_cargo}
            onChange={(valor) => onCambio('validador_cargo', valor)}
            onBlur={() => onBlur('validador_cargo')}
            error={errores.validador_cargo}
            autoComplete="organization-title"
            requerido
          />
        </div>
      </fieldset>
    </div>
  )
}
