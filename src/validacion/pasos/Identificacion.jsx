import { FileText, UserCircle, UserPlus, Trash } from '@phosphor-icons/react'
import { Campo } from '../../ui/Campo'
import { Boton } from '../../ui/Boton'
import estilos from './Paso.module.css'

export function Identificacion({
  datos,
  onCambio,
  errores,
  onBlur,
  onCambioValidador,
  onBlurValidador,
  onAgregarValidador,
  onQuitarValidador,
}) {
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
          {datos.validadores.length > 1 && (
            <p className={estilos.descripcion}>
              Puedes registrar a todas las personas que participaron en esta validación.
            </p>
          )}

          {datos.validadores.map((validador, indice) => (
            <div className={estilos.persona} key={indice}>
              {datos.validadores.length > 1 && (
                <div className={estilos.personaEncabezado}>
                  <span className={estilos.personaNumero}>{indice + 1}</span>
                  <button
                    type="button"
                    className={estilos.quitarPersona}
                    onClick={() => onQuitarValidador(indice)}
                  >
                    <Trash size={16} weight="regular" aria-hidden="true" />
                    Quitar
                    <span className="sr-only"> a la persona {indice + 1}</span>
                  </button>
                </div>
              )}

              <Campo
                etiqueta="Nombre completo"
                valor={validador.nombre}
                onChange={(valor) => onCambioValidador(indice, 'nombre', valor)}
                onBlur={() => onBlurValidador(indice, 'nombre')}
                error={errores.validadores?.[indice]?.nombre}
                autoComplete="name"
                requerido
              />
              <Campo
                etiqueta="Entidad o institución"
                valor={validador.entidad}
                onChange={(valor) => onCambioValidador(indice, 'entidad', valor)}
                onBlur={() => onBlurValidador(indice, 'entidad')}
                error={errores.validadores?.[indice]?.entidad}
                ayuda="Institución educativa, secretaría, universidad u organización que representa."
                autoComplete="organization"
                requerido
              />
              <Campo
                etiqueta="Cargo o rol"
                valor={validador.cargo}
                onChange={(valor) => onCambioValidador(indice, 'cargo', valor)}
                onBlur={() => onBlurValidador(indice, 'cargo')}
                error={errores.validadores?.[indice]?.cargo}
                autoComplete="organization-title"
                requerido
              />
            </div>
          ))}

          <Boton
            variante="secundario"
            onClick={onAgregarValidador}
            iconoIzquierda={<UserPlus size={18} weight="regular" aria-hidden="true" />}
          >
            Agregar otra persona
          </Boton>
        </div>
      </fieldset>
    </div>
  )
}
