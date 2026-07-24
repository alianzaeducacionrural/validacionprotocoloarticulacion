# Sistema de diseño — Validación Protocolo de Articulación

> **LÓGICA:** Al construir una página específica, revisa primero `design-system/validacion-protocolo-articulacion/pages/[nombre].md`.
> Si ese archivo existe, sus reglas **anulan** este archivo maestro. Si no, sigue estrictamente lo de abajo.

**Proyecto:** Validación Protocolo de Articulación
**Dials:** Variance 3/10 (centrado / minimal) · Motion 3/10 (sutil) · Density 7/10 (estándar-denso)

**Tipos de producto aplicables** (`--domain product`):
- Formulario público → **Survey / Form Builder** — Minimalismo + microinteracciones.
- Panel `/admin` → **Analytics Dashboard** (Response Analytics) — Data-Dense + Minimalismo.

> Este archivo reemplaza la salida cruda del generador. La paleta azul por defecto y el patrón
> "Real-Time / Operations Landing" **no aplican**: esto no es una landing page, es un instrumento
> de captura y un tablero de consolidación. Los tokens de abajo son los definitivos y sus
> contrastes están verificados.

---

## Paleta — Grafito + teal técnico

Neutro casi por completo. El color solo aparece en la escala de valoración y en los estados,
para que los datos manden sobre la decoración.

| Rol | Hex | Variable |
|---|---|---|
| Tinta / primario | `#1F2933` | `--grafito-700` |
| Tinta fuerte | `#111820` | `--grafito-900` |
| Texto secundario | `#52606D` | `--grafito-500` |
| Texto deshabilitado | `#9AA5B1` | `--grafito-300` |
| Borde | `#D9DDE3` | `--borde` |
| Superficie | `#F4F5F7` | `--superficie` |
| Fondo | `#FFFFFF` | `--fondo` |
| Acento | `#006C84` | `--teal-600` |
| Acento oscuro (hover) | `#00505F` | `--teal-700` |
| Acento tenue (fondo) | `#E6F2F5` | `--teal-050` |

### Escala de valoración — contraste verificado sobre blanco

| Nivel | Color | Contraste | Etiqueta |
|---|---|---|---|
| 1 | `#C0392B` | 5.53:1 | No cumple |
| 2 | `#B45309` | 5.02:1 | Cumple parcialmente |
| 3 | `#8A6A00` | 5.07:1 | Cumple con ajustes menores |
| 4 | `#006C84` | 6.03:1 | Cumple plenamente |

Los cuatro pasan AA como texto sobre blanco **y** como relleno con texto blanco encima.

> **Regla no negociable:** el color nunca comunica solo. Todo nivel muestra siempre su número
> y su etiqueta, en la interfaz, en las gráficas y en el PDF.

---

## Tipografía

- **Interfaz y cuerpo:** IBM Plex Sans (300/400/500/600)
- **Datos:** IBM Plex Mono (400/500/600) — valoraciones, promedios, identificadores, conteos

Auto-hospedadas en `public/fonts/*.woff2`, subconjunto latino. **Sin CDN**: los validadores rurales
tienen conexión inestable y la página debe cargar sin depender de un tercero.

Base 16px · interlineado 1.5 · ningún texto de cuerpo bajo 14px · medida máxima de lectura 68ch.

---

## Espaciado, radios y sombras

| Token | Valor |
|---|---|
| `--space-xs` … `--space-3xl` | 4 · 8 · 16 · 24 · 32 · 48 · 64 px |
| `--radio-sm` / `--radio-md` / `--radio-lg` | 4 / 8 / 12 px |
| `--sombra-sm` | `0 1px 2px rgba(17,24,32,.06)` |
| `--sombra-md` | `0 2px 8px rgba(17,24,32,.08)` |

Sombras al mínimo: la jerarquía la dan el borde y la superficie, no la elevación.

---

## Movimiento

Sutil. Solo `opacity` y `transform`, 150–300ms, `ease-out`. Nada de animación decorativa,
ni GSAP, ni scroll reveal — es un formulario largo, el movimiento estorba.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

---

## Iconos

**Phosphor Icons** (`@phosphor-icons/react`), `weight="regular"`, 20px por defecto.
SVG siempre. **Cero emojis como iconos.** Todo icono sin texto al lado lleva `aria-label`.

---

## Reglas de UX obligatorias

Prioridades 1, 2, 8 y 9 del skill:

- Indicador de progreso visible en todos los pasos ("Criterio 4 de 10").
- Etiquetas visibles asociadas con `htmlFor`. Nunca placeholder como única etiqueta.
- Validación en `onBlur`, no solo al enviar.
- El error aparece **junto al campo**, nunca agrupado arriba, y va con `role="alert"`.
- Envío: carga → éxito o error. Nunca un clic sin respuesta.
- Objetivos táctiles mínimo 44×44px con 8px de separación. Crítico en el selector 1–4.
- Sin scroll horizontal en ningún ancho. Probar 375 / 768 / 1024 / 1440.
- Foco siempre visible: `outline: 2px solid var(--teal-600); outline-offset: 2px`.
  Nunca `outline: none` sin reemplazo.
- Gráficas con etiqueta de valor siempre visible + exportación CSV como alternativa accesible.

---

## Anti-patrones

- ❌ Emojis como iconos
- ❌ Color como único portador de significado
- ❌ Contraste bajo (< 4.5:1 en texto)
- ❌ Cambios de estado instantáneos, sin transición
- ❌ Foco invisible
- ❌ Hovers que desplazan el layout
- ❌ Tipografía gigante tipo editorial: aquí manda la densidad de datos, no el impacto
- ❌ Tablas sin filtro ni orden en el panel

---

## Lista de verificación previa a entrega

- [ ] Ningún emoji usado como icono
- [ ] Todos los iconos de Phosphor, mismo `weight`
- [ ] `cursor: pointer` en todo lo clicable
- [ ] Transiciones de 150–300ms en los estados hover
- [ ] Contraste de texto ≥ 4.5:1
- [ ] Foco visible en recorrido completo por teclado
- [ ] `prefers-reduced-motion` respetado
- [ ] Responsive verificado a 375 / 768 / 1024 / 1440
- [ ] Sin scroll horizontal en móvil
- [ ] El selector 1–4 es operable con flechas del teclado
