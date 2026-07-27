# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Qué es

Herramienta de validación técnica del Protocolo de Articulación de la Educación
Media con la Educación Superior (Proyecto La Universidad en el Campo, Comité de
Cafeteros de Caldas). Formulario público de 29 aspectos + panel de consolidación
+ un acta en PDF por cada respuesta.

Contexto funcional y de uso: [README.md](README.md).
Backend e instalación: [GAS.md](GAS.md).

**Es un proyecto independiente.** No heredes estructura, paleta ni convenciones
de las otras plataformas del Comité que viven en carpetas hermanas — se decidió
explícitamente que este tuviera identidad propia.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173/validacionprotocoloarticulacion/
npm run build    # a dist/
npm run preview
npm run lint     # oxlint
```

Requiere `.env` con `VITE_GAS_URL` (copiar de `.env.example`).
**No hay tests configurados — no inventes un comando de test.**

## Estructura

```
gas/                     backend Apps Script (Codigo, Pdf, Instalacion)
design-system/           MASTER.md — tokens, reglas de UX, anti-patrones
src/
  datos/matriz.js        ⭐ 10 criterios / 29 aspectos — fuente única de verdad
  datos/escala.js        niveles 1–4 con color y etiqueta
  servicios/gas.js       cliente HTTP del backend
  styles/                tokens.css, base.css, fuentes.css
  ui/                    componentes transversales (SelectorEscala, Campo, Boton…)
  validacion/            formulario público, 12 pasos
  panel/                 administración, 4 vistas
```

Nomenclatura en español, coherente con el dominio. Componentes en PascalCase,
hooks con prefijo `use`, CSS Modules coubicados (`Componente.module.css`).

## Invariantes — no romper

### `src/datos/matriz.js` es la fuente única de verdad

Formulario, PDF y panel se construyen a partir de él. Los ids de aspecto
(`1.1`, `2.4`, …) **no existen en el Word original**: se agregaron aquí y son la
llave con la hoja `valoraciones`. Cambiarlos rompe los datos ya guardados.

Son **29** aspectos, no 26. El Word no los numera y es fácil contar de menos.

### El POST va con `Content-Type: text/plain`

En `src/servicios/gas.js`. Apps Script no responde preflight de CORS y
`application/json` lo dispara. El cuerpo sigue siendo JSON serializado.

### El panel no se enlaza desde el formulario

Sin credenciales, su única protección es no estar enlazado. No agregues enlaces,
botones ni menciones a `/admin` en nada que vea el validador.

### El workflow copia `index.html` a `404.html`

GitHub Pages no reescribe rutas. Sin ese paso, entrar directo a `/admin` da 404 —
y escribir la URL es la única forma de llegar al panel.

### Solo la valoración 1–4 es obligatoria

Son 116 campos de matriz. Observaciones, ajustes y responsable son opcionales por
diseño; volverlos obligatorios haría que nadie termine el formulario.

### El panel se carga con `lazy()`

Arrastra Recharts (~112 KB gzip). El formulario lo llenan desde zonas rurales con
conexión inestable y no debe descargar código que nunca ejecuta. Si agregas algo
pesado, que sea del lado del panel.

### El PDF nunca bloquea el guardado

En `gas/Codigo.gs`, `guardarValidacion()` escribe las filas y **después** intenta
el PDF en un `try/catch`. Si falla, la respuesta se conserva y queda regenerable.
No muevas la generación del PDF antes de la escritura.

## Sistema de diseño

Definido en
[design-system/validacion-protocolo-articulacion/MASTER.md](design-system/validacion-protocolo-articulacion/MASTER.md).
Léelo antes de tocar cualquier cosa visual. Lo esencial:

- **Grafito + teal**, pero el teal ya no vive solo en la escala: también es
  franja izquierda de acento, insignias de índice y degradado de la barra de
  progreso. Las tarjetas se mantienen en blanco (`--fondo`) — se probó un
  lavado de color de fondo completo y se descartó por sentirse pesado en un
  formulario largo.
- **La escala nunca comunica solo por color:** siempre número + etiqueta. Los
  cuatro hex están verificados ≥ 4.5:1 sobre blanco; si cambias uno, recalcula.
- IBM Plex Sans (interfaz) + IBM Plex Mono (cifras), auto-hospedadas. Sin CDN.
- Iconos Phosphor outline, `weight="regular"`. **Cero emojis como iconos.**
- Transiciones 150–300ms solo en `opacity`/`transform`, con
  `prefers-reduced-motion` respetado.
- Objetivos táctiles ≥ 44×44px. Foco siempre visible.
- Errores junto al campo con `role="alert"`, nunca agrupados arriba.

## Componentes que merecen cuidado

**`ui/SelectorEscala.jsx`** — aparece 29 veces y define la experiencia. Patrón
APG de radiogroup: una sola parada de tabulación, flechas para cambiar de valor,
Home/End a los extremos. Si lo tocas, pruébalo con teclado y a 375px.

**`validacion/useBorrador.js`** — autoguardado en localStorage. **En el paso 0 no
escribe a propósito:** guardar el estado vacío de la portada borraría el borrador
de una sesión anterior antes de que el validador decida si quiere continuarla.

**`panel/vistas/Aspectos.jsx`** — es la vista con la que el equipo edita el
protocolo. Prioriza que se pueda leer todo comentario de un aspecto de corrido.

## Al cambiar el esquema de datos

Los encabezados de las hojas están duplicados en `gas/Codigo.gs`
(`ENCABEZADOS_RESPUESTAS`, `ENCABEZADOS_VALORACIONES`) y las lecturas del panel
dependen de esos nombres. Si agregas una columna: actualiza el array, corre
`crearEstructura()` en una hoja nueva o añade la columna a mano en la existente,
y publica versión nueva de la Web App (guardar no basta — ver GAS.md).
