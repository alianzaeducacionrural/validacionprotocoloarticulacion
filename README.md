# Validación Técnica del Protocolo de Articulación

Herramienta para recoger y consolidar la validación técnica del **Protocolo de
Articulación de la Educación Media con la Educación Superior**.

Proyecto La Universidad en el Campo — Alcaldía de Manizales · Secretaría de
Educación de Manizales · Colombia Evidencia Potencial en Educación · Comité de
Cafeteros de Caldas.

## Qué reemplaza

La matriz vivía en un Word que cada validador debía descargar, llenar a mano y
devolver por correo, dejando al equipo consolidando decenas de tablas. Ahora:

1. Cada validador llena un **formulario web** con los 10 criterios y 29 aspectos.
2. Al llegar cada respuesta se genera **un acta en PDF** con los logos
   institucionales, guardada en Drive.
3. El equipo entra a un **panel** y ve el consolidado en tiempo real: promedios
   por criterio, aspectos críticos y todas las observaciones agrupadas listas
   para ajustar el protocolo.

## Cómo se usa

**Validadores** → la URL del formulario. Nada más; no hay que crear cuenta.
Sus respuestas se guardan solas en su navegador mientras llenan, así que pueden
cerrar y volver.

**Equipo coordinador** → la misma URL con `/admin` al final.

| Vista | Para qué sirve |
|---|---|
| Resumen | Cuántas validaciones van, promedio general, qué criterios están más bajos y qué aspectos son críticos |
| Aspectos | **La vista de trabajo.** Cada uno de los 29 aspectos con su promedio y todas las observaciones, ajustes y responsables agrupados |
| Respuestas | Listado de validaciones, con búsqueda y orden. Cada una lleva a su detalle con el PDF incrustado |

Las vistas de Aspectos y Respuestas exportan a CSV, listo para Excel.

## Sobre la seguridad

Por decisión del proyecto, **el panel no tiene credenciales**. Su única
protección es que no está enlazado desde ninguna parte y que el sitio pide a los
buscadores no indexarlo (`robots.txt` + `noindex`).

Consecuencias que conviene tener claras:

- **Cualquiera que conozca o adivine la URL `/admin` puede ver todas las
  validaciones.** No compartas ese enlace fuera del equipo coordinador.
- **Los PDF en Drive quedan como «cualquiera con el enlace puede ver».** Es lo
  que permite verlos desde el panel sin iniciar sesión.
- No se recoge correo electrónico de los validadores, pero sí nombre, entidad y
  cargo, y esos datos son visibles para cualquiera que llegue al panel.

Si en algún momento se quiere cerrar el acceso, lo más barato es añadir una clave
en la URL (`/admin?k=…`) que el backend valide antes de devolver datos.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compila a dist/
npm run preview  # sirve el build compilado
npm run lint     # oxlint
```

Requiere un `.env` en la raíz (copia `.env.example`) con la URL de la Web App de
Apps Script. Sin ella el formulario se ve y se puede llenar, pero el envío falla
con un mensaje explícito.

**No hay suite de tests configurada** — no inventes un comando de test.

## Arquitectura

```
React 19 + Vite  →  GitHub Pages
   ├── /            Formulario de validación (público)
   └── /admin/*     Panel de consolidación (sin enlace desde el formulario)

        ↓ fetch

Google Apps Script Web App
   ├── Google Sheets   hojas `respuestas` y `valoraciones`
   └── Google Drive    un PDF por validación
```

El backend y su instalación están documentados en **[GAS.md](GAS.md)**.
Las convenciones del código, en **[CLAUDE.md](CLAUDE.md)**.
El sistema de diseño, en
**[design-system/validacion-protocolo-articulacion/MASTER.md](design-system/validacion-protocolo-articulacion/MASTER.md)**.

## Despliegue

Repositorio:
[alianzaeducacionrural/validacionprotocoloarticulacion](https://github.com/alianzaeducacionrural/validacionprotocoloarticulacion).
URL pública una vez publicado:
`https://alianzaeducacionrural.github.io/validacionprotocoloarticulacion/`.

Automático: cada push a `main` dispara
[.github/workflows/deploy.yml](.github/workflows/deploy.yml), que compila y
publica en la rama `gh-pages`.

Hace falta configurar una vez:

1. El secret `VITE_GAS_URL` del repositorio (Settings → Secrets and variables →
   Actions), con la URL de la Web App de Apps Script.
2. GitHub Pages sirviendo desde la rama `gh-pages` (Settings → Pages).

El `base` de [vite.config.js](vite.config.js) ya está fijado a
`/validacionprotocoloarticulacion/` para coincidir con el nombre exacto del
repositorio. Si el repo se renombra, hay que actualizarlo ahí también.

El workflow copia `index.html` a `404.html` después de compilar. **No quites ese
paso:** GitHub Pages no reescribe rutas y sin él entrar directo a `/admin`
devolvería un 404 — que es precisamente la única forma de llegar al panel.

## La matriz

10 criterios y 29 aspectos, transcritos literalmente del documento original en
[src/datos/matriz.js](src/datos/matriz.js). Ese archivo es la fuente única de
verdad: el formulario, el PDF y el panel se construyen a partir de él.

Escala: **4** Cumple plenamente · **3** Cumple con ajustes menores ·
**2** Cumple parcialmente · **1** No cumple.

Cada aspecto recoge los cuatro campos del Word (valoración, observaciones,
ajustes requeridos y responsable), pero **solo la valoración es obligatoria**:
son 116 campos y exigirlos todos garantizaría el abandono a mitad de camino.
