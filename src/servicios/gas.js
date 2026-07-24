/**
 * Cliente del backend en Google Apps Script.
 *
 * IMPORTANTE — Content-Type en los POST:
 * Apps Script no responde peticiones preflight de CORS (OPTIONS). Un
 * `Content-Type: application/json` las dispara y la petición falla. Por eso el
 * envío va como `text/plain` aunque el cuerpo sea JSON serializado; el backend
 * lo parsea igual con JSON.parse(e.postData.contents).
 */

const URL_GAS = import.meta.env.VITE_GAS_URL

function verificarConfiguracion() {
  if (!URL_GAS) {
    throw new Error(
      'Falta la variable VITE_GAS_URL. Copia .env.example a .env y pon la URL de la Web App de Apps Script.',
    )
  }
}

async function pedir(url) {
  verificarConfiguracion()
  const respuesta = await fetch(url)
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}.`)
  }
  const datos = await respuesta.json()
  if (!datos.ok) {
    throw new Error(datos.error || 'El servidor no pudo procesar la solicitud.')
  }
  return datos
}

/** Envía una validación completa. Devuelve { ok, id, pdf_url }. */
export async function enviarValidacion(payload) {
  verificarConfiguracion()

  const respuesta = await fetch(URL_GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })

  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}.`)
  }

  const datos = await respuesta.json()
  if (!datos.ok) {
    throw new Error(datos.error || 'No se pudo guardar la validación.')
  }
  return datos
}

/** Consolidado para el panel: respuestas + promedios por aspecto y criterio. */
export function obtenerResumen() {
  return pedir(`${URL_GAS}?action=resumen`)
}

/** Una validación con sus 29 valoraciones y el enlace a su PDF. */
export function obtenerRespuesta(id) {
  return pedir(`${URL_GAS}?action=respuesta&id=${encodeURIComponent(id)}`)
}

/** Reintenta la generación del PDF de una respuesta que quedó sin él. */
export async function regenerarPdf(id) {
  verificarConfiguracion()

  const respuesta = await fetch(URL_GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ accion: 'regenerar_pdf', id }),
  })

  const datos = await respuesta.json()
  if (!datos.ok) {
    throw new Error(datos.error || 'No se pudo regenerar el PDF.')
  }
  return datos
}
