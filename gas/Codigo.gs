/**
 * Backend de la Matriz de Validación Técnica del Protocolo de Articulación.
 * Proyecto La Universidad en el Campo — Comité de Cafeteros de Caldas.
 *
 * Guarda cada validación en dos hojas normalizadas y genera un acta en PDF
 * en Drive apenas llega la respuesta.
 *
 * Ver GAS.md para el procedimiento de instalación y despliegue.
 */

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────

var HOJAS = {
  RESPUESTAS: 'respuestas',
  VALORACIONES: 'valoraciones',
};

var TOTAL_ASPECTOS = 29;

/**
 * Id de la hoja de cálculo "Validación protocolo de articulación".
 * https://docs.google.com/spreadsheets/d/1ocRlIG5t0GAVHHe1X66MInjrKel7HLbn-fqOQn_XjjE
 *
 * Se abre siempre por id (`hoja_()`) en vez de con
 * `SpreadsheetApp.getActiveSpreadsheet()`, así el backend funciona igual si
 * el proyecto de Apps Script quedó vinculado a esta hoja (Extensiones → Apps
 * Script) o si es un proyecto independiente (script.google.com aparte).
 */
var ID_HOJA = '1ocRlIG5t0GAVHHe1X66MInjrKel7HLbn-fqOQn_XjjE';

function hoja_() {
  return SpreadsheetApp.openById(ID_HOJA);
}

/**
 * Carpeta de Drive del proyecto (la misma que contiene la hoja de cálculo).
 * https://drive.google.com/drive/folders/1QJdHFH5xZMNMfk2ABnycAWfriImDzR0h
 *
 * `crearEstructura()` crea ahí dentro la subcarpeta de actas en PDF, en vez
 * de sueltas en la raíz de Drive.
 */
var ID_CARPETA_PROYECTO = '1QJdHFH5xZMNMfk2ABnycAWfriImDzR0h';

/**
 * Claves de PropertiesService que hay que configurar una sola vez desde
 * el editor (Configuración del proyecto → Propiedades del script):
 *
 *   CARPETA_PDF_ID   id de la carpeta de Drive donde se guardan las actas
 *   LOGO_ALCALDIA_ID   \
 *   LOGO_EVIDENCIA_ID   > id de cada PNG de logo subido a Drive
 *   LOGO_COMITE_ID     /
 *
 * `crearEstructura()` crea la carpeta y deja su id registrado solo.
 */
var PROPIEDADES = PropertiesService.getScriptProperties();

var ENCABEZADOS_RESPUESTAS = [
  'id',
  'timestamp',
  'version_documento',
  'fecha_validacion',
  'validador_nombre',
  'validador_entidad',
  'validador_cargo',
  'consolidado_fortalezas',
  'consolidado_aspectos_mejorar',
  'consolidado_ajustes_prioritarios',
  'consolidado_recomendaciones',
  'promedio_general',
  'pdf_file_id',
  'pdf_url',
];

var ENCABEZADOS_VALORACIONES = [
  'id_respuesta',
  'criterio_id',
  'criterio',
  'aspecto_id',
  'aspecto',
  'valoracion',
  'observaciones',
  'ajustes_requeridos',
  'responsable',
];

// ─────────────────────────────────────────────────────────────
// ROUTER HTTP
// ─────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var accion = (e && e.parameter && e.parameter.action) || '';

    if (accion === 'resumen') return responder(construirResumen());
    if (accion === 'respuesta') return responder(obtenerRespuesta(e.parameter.id));

    return responder({ ok: false, error: 'Acción no reconocida: ' + accion });
  } catch (err) {
    return responder({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  try {
    // e.postData.contents decodifica los bytes como Latin-1, no como UTF-8:
    // los acentos y la ñ llegan corruptos ("María" → "MarÃ­a"). e.postData no
    // tiene .getBlob() (no es un Blob real, pese a lo que sugieren varios
    // ejemplos en internet) — pero sí expone .getDataAsString(charset)
    // directamente, que es el método soportado para pedir la decodificación.
    var textoCrudo = e.postData.getDataAsString('UTF-8');
    var datos = JSON.parse(textoCrudo);

    if (datos.accion === 'regenerar_pdf') {
      return responder(regenerarPdfDeRespuesta(datos.id));
    }

    return responder(guardarValidacion(datos));
  } catch (err) {
    return responder({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function responder(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ─────────────────────────────────────────────────────────────
// GUARDAR UNA VALIDACIÓN
// ─────────────────────────────────────────────────────────────

function guardarValidacion(datos) {
  var identificacion = datos.identificacion || {};
  var consolidado = datos.consolidado || {};
  var valoraciones = datos.valoraciones || [];

  if (valoraciones.length !== TOTAL_ASPECTOS) {
    return {
      ok: false,
      error:
        'La validación llegó incompleta: se esperaban ' +
        TOTAL_ASPECTOS +
        ' aspectos y llegaron ' +
        valoraciones.length +
        '.',
    };
  }

  var ss = hoja_();
  var hojaRespuestas = obtenerHoja(ss, HOJAS.RESPUESTAS, ENCABEZADOS_RESPUESTAS);
  var hojaValoraciones = obtenerHoja(ss, HOJAS.VALORACIONES, ENCABEZADOS_VALORACIONES);

  var id = generarId();
  var ahora = new Date();
  var promedio = calcularPromedio(valoraciones);

  // Primero los datos, después el PDF: si la generación del acta falla,
  // la validación del usuario NO se pierde.
  hojaRespuestas.appendRow([
    id,
    ahora.toISOString(),
    identificacion.version_documento || '',
    identificacion.fecha_validacion || '',
    identificacion.validador_nombre || '',
    identificacion.validador_entidad || '',
    identificacion.validador_cargo || '',
    consolidado.fortalezas || '',
    consolidado.aspectos_mejorar || '',
    consolidado.ajustes_prioritarios || '',
    consolidado.recomendaciones || '',
    promedio,
    '',
    '',
  ]);

  // Una sola escritura para las 29 filas: 29 appendRow() agotarían la cuota
  // de tiempo de ejecución con varios envíos simultáneos.
  var filas = valoraciones.map(function (v) {
    return [
      id,
      v.criterio_id,
      v.criterio,
      v.aspecto_id,
      v.aspecto,
      v.valoracion,
      v.observaciones || '',
      v.ajustes_requeridos || '',
      v.responsable || '',
    ];
  });

  var filaInicio = hojaValoraciones.getLastRow() + 1;
  var columnaAspectoId = ENCABEZADOS_VALORACIONES.indexOf('aspecto_id') + 1;

  // "1.1", "2.4"... se leen como día.mes: sin forzar texto, Sheets las
  // reinterpreta como fechas reales (p. ej. "2.4" → 2 de abril) y el id se
  // pierde. Hay que fijar el formato ANTES de escribir.
  hojaValoraciones.getRange(filaInicio, columnaAspectoId, filas.length, 1).setNumberFormat('@');

  hojaValoraciones
    .getRange(filaInicio, 1, filas.length, ENCABEZADOS_VALORACIONES.length)
    .setValues(filas);

  var resultado = { ok: true, id: id, promedio_general: promedio };

  try {
    var pdf = generarPdf(id, identificacion, consolidado, valoraciones, promedio);
    guardarDatosPdf(hojaRespuestas, id, pdf.fileId, pdf.url);
    resultado.pdf_url = pdf.url;
    resultado.pdf_file_id = pdf.fileId;
  } catch (err) {
    // El acta se puede regenerar después desde el panel o con
    // regenerarPdfsFaltantes(). La respuesta ya está a salvo.
    console.error('No se pudo generar el PDF de ' + id + ': ' + err);
    resultado.pdf_error = String(err && err.message ? err.message : err);
  }

  return resultado;
}

function calcularPromedio(valoraciones) {
  var suma = 0;
  for (var i = 0; i < valoraciones.length; i++) {
    suma += Number(valoraciones[i].valoracion) || 0;
  }
  return Math.round((suma / valoraciones.length) * 100) / 100;
}

function generarId() {
  var ahora = new Date();
  var marca = Utilities.formatDate(ahora, 'America/Bogota', 'yyyyMMdd-HHmmss');
  var sufijo = Math.random().toString(36).slice(2, 6);
  return marca + '-' + sufijo;
}

function guardarDatosPdf(hojaRespuestas, id, fileId, url) {
  var columnaId = ENCABEZADOS_RESPUESTAS.indexOf('id') + 1;
  var columnaFileId = ENCABEZADOS_RESPUESTAS.indexOf('pdf_file_id') + 1;
  var ultimaFila = hojaRespuestas.getLastRow();

  var ids = hojaRespuestas.getRange(2, columnaId, ultimaFila - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      hojaRespuestas.getRange(i + 2, columnaFileId, 1, 2).setValues([[fileId, url]]);
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// LECTURA — resumen consolidado para el panel
// ─────────────────────────────────────────────────────────────

function construirResumen() {
  var ss = hoja_();
  var respuestas = leerHoja(ss.getSheetByName(HOJAS.RESPUESTAS));
  var valoraciones = leerHoja(ss.getSheetByName(HOJAS.VALORACIONES));

  if (respuestas.length === 0) {
    return {
      ok: true,
      total: 0,
      promedio_general: null,
      respuestas: [],
      aspectos: [],
      criterios: [],
      distribucion: {},
    };
  }

  // Nombre y entidad por respuesta, para atribuir cada comentario.
  var autores = {};
  respuestas.forEach(function (respuesta) {
    autores[respuesta.id] = {
      validador: respuesta.validador_nombre,
      entidad: respuesta.validador_entidad,
    };
  });

  var porAspecto = {};
  var porCriterio = {};
  var distribucionGlobal = { 1: 0, 2: 0, 3: 0, 4: 0 };

  valoraciones.forEach(function (fila) {
    var valor = Number(fila.valoracion);
    if (!valor) return;

    var autor = autores[fila.id_respuesta] || { validador: '—', entidad: '—' };

    if (!porAspecto[fila.aspecto_id]) {
      porAspecto[fila.aspecto_id] = {
        aspecto_id: fila.aspecto_id,
        aspecto: fila.aspecto,
        criterio_id: fila.criterio_id,
        criterio: fila.criterio,
        suma: 0,
        conteo: 0,
        distribucion: { 1: 0, 2: 0, 3: 0, 4: 0 },
        comentarios: [],
      };
    }

    var aspecto = porAspecto[fila.aspecto_id];
    aspecto.suma += valor;
    aspecto.conteo += 1;
    aspecto.distribucion[valor] += 1;
    aspecto.comentarios.push({
      respuesta_id: fila.id_respuesta,
      validador: autor.validador,
      entidad: autor.entidad,
      valoracion: valor,
      observaciones: fila.observaciones,
      ajustes_requeridos: fila.ajustes_requeridos,
      responsable: fila.responsable,
    });

    if (!porCriterio[fila.criterio_id]) {
      porCriterio[fila.criterio_id] = {
        criterio_id: fila.criterio_id,
        criterio: fila.criterio,
        suma: 0,
        conteo: 0,
      };
    }
    porCriterio[fila.criterio_id].suma += valor;
    porCriterio[fila.criterio_id].conteo += 1;

    distribucionGlobal[valor] += 1;
  });

  var aspectos = Object.keys(porAspecto)
    .map(function (clave) {
      var aspecto = porAspecto[clave];
      aspecto.promedio = aspecto.suma / aspecto.conteo;
      delete aspecto.suma;
      return aspecto;
    })
    .sort(ordenarPorIdDeAspecto);

  var criterios = Object.keys(porCriterio)
    .map(function (clave) {
      var criterio = porCriterio[clave];
      criterio.promedio = criterio.suma / criterio.conteo;
      delete criterio.suma;
      return criterio;
    })
    .sort(function (a, b) {
      return Number(a.criterio_id) - Number(b.criterio_id);
    });

  var sumaGeneral = 0;
  var conteoGeneral = 0;
  criterios.forEach(function (criterio) {
    sumaGeneral += criterio.promedio * criterio.conteo;
    conteoGeneral += criterio.conteo;
  });

  return {
    ok: true,
    total: respuestas.length,
    promedio_general: conteoGeneral ? sumaGeneral / conteoGeneral : null,
    respuestas: respuestas.map(function (respuesta) {
      return {
        id: respuesta.id,
        timestamp: respuesta.timestamp,
        version_documento: respuesta.version_documento,
        fecha_validacion: formatearFecha(respuesta.fecha_validacion),
        validador_nombre: respuesta.validador_nombre,
        validador_entidad: respuesta.validador_entidad,
        validador_cargo: respuesta.validador_cargo,
        promedio_general: Number(respuesta.promedio_general),
        pdf_file_id: respuesta.pdf_file_id,
        pdf_url: respuesta.pdf_url,
      };
    }),
    aspectos: aspectos,
    criterios: criterios,
    distribucion: distribucionGlobal,
  };
}

/** Ordena 1.1, 1.2, 2.1… numéricamente, no como texto (10.1 después de 9.3). */
function ordenarPorIdDeAspecto(a, b) {
  var partesA = String(a.aspecto_id).split('.').map(Number);
  var partesB = String(b.aspecto_id).split('.').map(Number);
  return partesA[0] - partesB[0] || partesA[1] - partesB[1];
}

function obtenerRespuesta(id) {
  if (!id) return { ok: false, error: 'Falta el identificador de la respuesta.' };

  var ss = hoja_();
  var respuestas = leerHoja(ss.getSheetByName(HOJAS.RESPUESTAS));
  var valoraciones = leerHoja(ss.getSheetByName(HOJAS.VALORACIONES));

  var respuesta = null;
  for (var i = 0; i < respuestas.length; i++) {
    if (String(respuestas[i].id) === String(id)) {
      respuesta = respuestas[i];
      break;
    }
  }

  if (!respuesta) return { ok: false, error: 'No existe una validación con el id ' + id + '.' };

  respuesta.fecha_validacion = formatearFecha(respuesta.fecha_validacion);
  respuesta.promedio_general = Number(respuesta.promedio_general);

  return {
    ok: true,
    respuesta: respuesta,
    valoraciones: valoraciones
      .filter(function (fila) {
        return String(fila.id_respuesta) === String(id);
      })
      .sort(ordenarPorIdDeAspecto),
  };
}

// ─────────────────────────────────────────────────────────────
// UTILIDADES DE HOJA
// ─────────────────────────────────────────────────────────────

function obtenerHoja(ss, nombre, encabezados) {
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
  }
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(encabezados);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/** Lee una hoja completa como array de objetos usando la fila 1 de claves. */
function leerHoja(hoja) {
  if (!hoja || hoja.getLastRow() < 2) return [];

  var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, hoja.getLastColumn()).getValues();

  return filas.map(function (fila) {
    var objeto = {};
    encabezados.forEach(function (clave, indice) {
      objeto[clave] = fila[indice];
    });
    return objeto;
  });
}

/** Sheets devuelve las fechas como Date; el panel las quiere como AAAA-MM-DD. */
function formatearFecha(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, 'America/Bogota', 'yyyy-MM-dd');
  }
  return valor ? String(valor) : '';
}
