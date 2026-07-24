# Backend en Google Apps Script

Guía de instalación del backend. Se hace una sola vez; después solo se vuelve
aquí para publicar una versión nueva o para resolver un PDF que no se generó.

## Qué hace el backend

- Recibe las validaciones del formulario y las guarda en dos hojas de cálculo.
- Genera un **acta en PDF** por cada validación que llega y la deja en una
  carpeta de Drive.
- Devuelve al panel el consolidado ya calculado (promedios por criterio y por
  aspecto, distribución de la escala, comentarios agrupados).

Archivos en [gas/](gas/):

| Archivo | Contenido |
|---|---|
| `Codigo.gs` | Router HTTP, guardado y lectura de las hojas |
| `Pdf.gs` | Maqueta del acta, logos en base64 y escritura en Drive |
| `Instalacion.gs` | `crearEstructura()`, `verificarInstalacion()` y el menú de la hoja |

## Instalación paso a paso

### 1. La hoja de cálculo

Ya existe: **[Validación protocolo de articulación](https://docs.google.com/spreadsheets/d/1ocRlIG5t0GAVHHe1X66MInjrKel7HLbn-fqOQn_XjjE/edit)**.
No crees pestañas a mano: las crea el script con los encabezados correctos.

El id de esa hoja (`1ocRlIG5t0GAVHHe1X66MInjrKel7HLbn-fqOQn_XjjE`) ya está
escrito en `gas/Codigo.gs` como la constante `ID_HOJA`. El backend siempre abre
la hoja por ese id (`SpreadsheetApp.openById(ID_HOJA)`), nunca con
`getActiveSpreadsheet()` — así funciona igual sin importar cómo montes el
proyecto de Apps Script en el paso siguiente.

Si en algún momento cambias de hoja de cálculo, actualiza `ID_HOJA` con el id
de la nueva.

### 2. Pegar el código

Hay dos formas de montar el proyecto de Apps Script; el backend funciona igual
en ambas porque siempre abre la hoja por id, no por «hoja activa»:

- **Vinculado a la hoja** (más simple): abre la hoja de cálculo →
  **Extensiones → Apps Script**.
- **Proyecto independiente**: crea uno nuevo en
  [script.google.com](https://script.google.com).

En cualquiera de los dos, el editor se abre con un `Código.gs` vacío. Crea un
archivo por cada uno de los tres de `gas/` (el botón **+** junto a «Archivos»),
con el mismo nombre, y pega el contenido. Borra el `Código.gs` vacío que venía
por defecto si te sobra.

Guarda con **Ctrl+S**.

> Si el proyecto es **vinculado**, aparecerá un menú **Validación** en la hoja
> (con «Crear estructura», «Verificar instalación», etc.) apenas la recargues.
> Si es **independiente**, ese menú nunca aparece —no hay hoja que lo dispare—
> y en su lugar ejecutas cada función desde el propio editor: elígela en el
> desplegable de funciones de la barra superior y pulsa **Ejecutar** (▷). El
> resultado no sale como ventana emergente sino en **Ver → Registro de
> ejecución**.

### 3. Crear las hojas y la carpeta de actas

Ejecuta `crearEstructura()` — desde el menú **Validación** si el proyecto quedó
vinculado, o desde el editor (desplegable de funciones → `crearEstructura` →
Ejecutar) si es independiente.

La primera vez Google pedirá autorización: acepta los permisos de hoja de
cálculo y de Drive. En la pantalla «Google no ha verificado esta aplicación»,
entra por **Configuración avanzada → Ir a (nombre del proyecto)**. Es tu propio
script, no un tercero.

Al terminar habrá:
- las pestañas `respuestas` y `valoraciones` con sus encabezados;
- una subcarpeta llamada **«Actas de validación — Protocolo de Articulación»**
  dentro de la
  [carpeta del proyecto](https://drive.google.com/drive/folders/1QJdHFH5xZMNMfk2ABnycAWfriImDzR0h)
  (la misma que contiene la hoja de cálculo), con su id ya registrado.

Revisa el resultado en la alerta (vinculado) o en **Ver → Registro de
ejecución** (independiente).

### 4. Subir los logos

Sube los tres PNG de la carpeta `Logos/` a la
[carpeta del proyecto](https://drive.google.com/drive/folders/1QJdHFH5xZMNMfk2ABnycAWfriImDzR0h)
(no es obligatorio que queden ahí, pero mantiene todo junto). Para cada uno,
clic derecho → **Compartir → Copiar vínculo**. El id es el tramo largo
entre `/d/` y `/view`:

```
https://drive.google.com/file/d/1a2B3cD4eF5gH6iJ7kL8/view?usp=sharing
                                 └────── este es el id ──────┘
```

En el editor de Apps Script: **Configuración del proyecto** (el engranaje) →
**Propiedades del script** → **Añadir propiedad**, y registra las tres:

| Propiedad | Valor |
|---|---|
| `LOGO_ALCALDIA_ID` | id de `3.png` (Alcaldía de Manizales) |
| `LOGO_EVIDENCIA_ID` | id de `1.png` (Colombia Evidencia Potencial) |
| `LOGO_COMITE_ID` | id de `2.png` (Comité de Cafeteros) |

Los logos deben quedar visibles para el script; como son tuyos, ya lo están.

### 5. Verificar

**Validación → Verificar instalación**. Comprueba las hojas, la carpeta y los
tres logos, y genera un acta de prueba que envía a la papelera. Si algo falta,
te dice exactamente qué.

No sigas hasta que diga «✓ Instalación correcta».

### 6. Publicar la Web App

En el editor: **Implementar → Nueva implementación → Tipo: Aplicación web**.

| Campo | Valor |
|---|---|
| Descripción | `v1` |
| Ejecutar como | **Yo** (tu cuenta) |
| Quién tiene acceso | **Cualquier usuario** |

«Cualquier usuario» es obligatorio: los validadores no inician sesión con
Google. La app corre con tus permisos, así que solo puede tocar tu hoja y tu
carpeta de actas.

Copia la **URL de la aplicación web**. Termina en `/exec`.

### 7. Conectar el formulario

En local, crea un archivo `.env` en la raíz del proyecto:

```env
VITE_GAS_URL=https://script.google.com/macros/s/AKfy.../exec
```

Para producción, en GitHub: **Settings → Secrets and variables → Actions → New
repository secret**, con el nombre `VITE_GAS_URL` y la misma URL.

## Publicar cambios del backend

Al editar los `.gs` **no basta con guardar**: la URL sigue sirviendo la versión
anterior. Hay que ir a **Implementar → Gestionar implementaciones →** (lápiz) →
**Versión: Nueva versión → Implementar**.

Si en cambio creas una implementación *nueva* en vez de actualizar la existente,
la URL cambia y hay que actualizarla en `.env` y en el secret de GitHub.

## Detalles técnicos que importan

### Content-Type de los POST

El frontend envía `Content-Type: text/plain`, no `application/json`, aunque el
cuerpo sea JSON. Apps Script no responde peticiones preflight de CORS y
`application/json` las dispara, con lo que el envío falla desde el navegador.
El backend lo parsea igual con `JSON.parse(e.postData.contents)`.

**No cambies esto** en `src/servicios/gas.js` sin probar un envío real.

### Escritura en bloque

Las 29 valoraciones se escriben con un solo `setValues()`. Con 29 `appendRow()`
la ejecución tarda tanto que varios envíos simultáneos agotarían la cuota.

### El PDF no bloquea el guardado

`guardarValidacion()` escribe primero las filas y luego intenta el PDF dentro de
un `try/catch`. Si la generación falla, la validación **no se pierde**: las
columnas `pdf_file_id` y `pdf_url` quedan vacías y el panel muestra «Pendiente»
con un botón para regenerar. También existe **Validación → Generar PDF
faltantes** para resolverlos en lote.

### Caché de los logos

Convertir tres PNG a base64 en cada envío sería lento, así que se hace una vez y
se guarda en las propiedades del script. Como `PropertiesService` admite 9 KB por
valor y el base64 los supera, se parte en trozos y se recompone al leer.

Si reemplazas un logo: **Validación → Limpiar caché de logos**.

### Permisos de los PDF

Cada acta se comparte como «cualquier persona con el enlace puede ver». Es lo que
permite verla desde el panel, que no tiene credenciales. **Quien tenga el enlace
de un PDF puede abrirlo sin iniciar sesión.** Ver la advertencia del
[README](README.md#sobre-la-seguridad).

## Contrato de la API

### `GET ?action=resumen`

```json
{
  "ok": true,
  "total": 5,
  "promedio_general": 3.21,
  "respuestas": [
    { "id": "20260724-143052-a4f9", "timestamp": "...", "version_documento": "1",
      "fecha_validacion": "2026-07-24",
      "validador_nombre": "...", "validador_entidad": "...", "validador_cargo": "...",
      "promedio_general": 3.4, "pdf_file_id": "1a2B...", "pdf_url": "https://..." }
  ],
  "aspectos": [
    { "aspecto_id": "1.1", "aspecto": "...", "criterio_id": 1, "criterio": "...",
      "promedio": 3.4, "conteo": 5, "distribucion": { "1": 0, "2": 1, "3": 1, "4": 3 },
      "comentarios": [ { "respuesta_id": "...", "validador": "...", "entidad": "...",
                        "valoracion": 4, "observaciones": "...",
                        "ajustes_requeridos": "...", "responsable": "..." } ] }
  ],
  "criterios": [ { "criterio_id": 1, "criterio": "...", "promedio": 3.4, "conteo": 15 } ],
  "distribucion": { "1": 2, "2": 9, "3": 40, "4": 94 }
}
```

### `GET ?action=respuesta&id=<id>`

```json
{
  "ok": true,
  "respuesta": { "...": "fila completa de la hoja respuestas" },
  "valoraciones": [ { "criterio_id": 1, "criterio": "...", "aspecto_id": "1.1",
                      "aspecto": "...", "valoracion": 4, "observaciones": "...",
                      "ajustes_requeridos": "...", "responsable": "..." } ]
}
```

### `POST` — guardar validación

```json
{
  "identificacion": { "version_documento": "1", "fecha_validacion": "",
                      "validador_nombre": "",
                      "validador_entidad": "", "validador_cargo": "" },
  "consolidado": { "fortalezas": "", "aspectos_mejorar": "",
                   "ajustes_prioritarios": "", "recomendaciones": "" },
  "valoraciones": [ { "criterio_id": 1, "criterio": "", "aspecto_id": "1.1",
                      "aspecto": "", "valoracion": 4, "observaciones": "",
                      "ajustes_requeridos": "", "responsable": "" } ]
}
```

Se rechaza si `valoraciones` no trae exactamente 29 elementos.

### `POST` — regenerar un PDF

```json
{ "accion": "regenerar_pdf", "id": "20260724-143052-a4f9" }
```

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| «Failed to fetch» al enviar | La implementación no está como «Cualquier usuario», o la URL del `.env` no termina en `/exec`. |
| Los cambios del `.gs` no surten efecto | Guardaste pero no publicaste versión nueva. Ver «Publicar cambios del backend». |
| «Falta la propiedad LOGO_…_ID» | Faltan los ids de los logos. Paso 4. |
| El PDF sale sin logos | Los ids apuntan a archivos que el script no puede leer. Corre **Verificar instalación**. |
| El panel muestra «Pendiente» en el PDF | La generación falló en ese envío. Usa el botón «Generar el PDF» del detalle, o el menú **Generar PDF faltantes**. |
| Acentos rotos en el CSV | Ábrelo con Excel, no con el Bloc de notas. El archivo lleva BOM UTF-8. |
