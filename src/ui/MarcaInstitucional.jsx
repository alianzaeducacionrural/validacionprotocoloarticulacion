import alcaldia from '../assets/logos/alcaldia-manizales.png'
import evidencia from '../assets/logos/evidencia-potencial.png'
import comite from '../assets/logos/comite-cafeteros.png'
import estilos from './MarcaInstitucional.module.css'

const LOGOS = [
  { src: alcaldia, alt: 'Alcaldía de Manizales', ancho: 680, alto: 217 },
  { src: evidencia, alt: 'Colombia Evidencia Potencial en Educación', ancho: 729, alto: 366 },
  { src: comite, alt: 'Comité de Cafeteros de Caldas', ancho: 802, alto: 281 },
]

/**
 * Franja con los tres logos institucionales.
 * `tamano="compacto"` para la barra del panel, `"normal"` para la portada.
 * Los `width`/`height` reservan el espacio para evitar salto de layout (CLS).
 */
export function MarcaInstitucional({ tamano = 'normal' }) {
  return (
    <div className={`${estilos.franja} ${estilos[tamano]}`}>
      {LOGOS.map((logo) => (
        <img
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          width={logo.ancho}
          height={logo.alto}
          className={estilos.logo}
          loading="eager"
          decoding="async"
        />
      ))}
    </div>
  )
}
