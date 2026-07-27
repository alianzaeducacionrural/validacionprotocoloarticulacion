/**
 * Generación del acta de validación en PDF.
 *
 * Se arma un HTML y se convierte con Utilities.newBlob(...).getAs('application/pdf').
 * Los logos van incrustados como data URI para que el PDF sea autocontenido y
 * no dependa de que Drive sirva las imágenes al abrirlo.
 */

var ESCALA = {
  1: { etiqueta: 'No cumple', color: '#C0392B' },
  2: { etiqueta: 'Cumple parcialmente', color: '#B45309' },
  3: { etiqueta: 'Cumple con ajustes menores', color: '#8A6A00' },
  4: { etiqueta: 'Cumple plenamente', color: '#006C84' },
};

var CAMPOS_CONSOLIDADO_PDF = [
  ['fortalezas', 'Fortalezas del documento'],
  ['aspectos_mejorar', 'Aspectos por mejorar'],
  ['ajustes_prioritarios', 'Ajustes prioritarios'],
  ['recomendaciones', 'Recomendaciones técnicas'],
];

// ─────────────────────────────────────────────────────────────
// LOGOS
// ─────────────────────────────────────────────────────────────

/**
 * Los tres logos en base64, cacheados en PropertiesService.
 *
 * Sin caché habría tres lecturas de Drive en cada envío. Los archivos no
 * cambian, así que se leen una vez y se guardan. Para forzar una relectura
 * (por ejemplo si se reemplaza un logo), ejecuta limpiarCacheLogos().
 */
function obtenerLogosBase64() {
  var ids = {
    alcaldia: PROPIEDADES.getProperty('LOGO_ALCALDIA_ID'),
    evidencia: PROPIEDADES.getProperty('LOGO_EVIDENCIA_ID'),
    comite: PROPIEDADES.getProperty('LOGO_COMITE_ID'),
  };

  var logos = {};
  Object.keys(ids).forEach(function (clave) {
    if (!ids[clave]) {
      throw new Error(
        'Falta la propiedad LOGO_' +
          clave.toUpperCase() +
          '_ID. Sube los logos a Drive y registra sus ids (ver GAS.md).'
      );
    }
    var blob = DriveApp.getFileById(ids[clave]).getBlob();
    logos[clave] = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
  });

  // PropertiesService tope 9 KB por valor; los tres logos en base64 superan eso,
  // así que se guarda uno por propiedad y se recompone al leer.
  Object.keys(logos).forEach(function (clave) {
    guardarPropiedadLarga('LOGO_B64_' + clave.toUpperCase(), logos[clave]);
  });
  PROPIEDADES.setProperty('LOGOS_CACHEADOS', 'si');

  return logos;
}

/** PropertiesService admite hasta 9 KB por valor: se parte en trozos. */
function guardarPropiedadLarga(clave, valor) {
  var TAMANO = 8000;
  var trozos = Math.ceil(valor.length / TAMANO);
  PROPIEDADES.setProperty(clave + '_TROZOS', String(trozos));
  for (var i = 0; i < trozos; i++) {
    PROPIEDADES.setProperty(clave + '_' + i, valor.substr(i * TAMANO, TAMANO));
  }
}

function leerPropiedadLarga(clave) {
  var trozos = Number(PROPIEDADES.getProperty(clave + '_TROZOS'));
  if (!trozos) return null;
  var partes = [];
  for (var i = 0; i < trozos; i++) {
    partes.push(PROPIEDADES.getProperty(clave + '_' + i) || '');
  }
  return partes.join('');
}

function limpiarCacheLogos() {
  ['ALCALDIA', 'EVIDENCIA', 'COMITE'].forEach(function (clave) {
    var nombre = 'LOGO_B64_' + clave;
    var trozos = Number(PROPIEDADES.getProperty(nombre + '_TROZOS')) || 0;
    for (var i = 0; i < trozos; i++) {
      PROPIEDADES.deleteProperty(nombre + '_' + i);
    }
    PROPIEDADES.deleteProperty(nombre + '_TROZOS');
  });
  PROPIEDADES.deleteProperty('LOGOS_CACHEADOS');
  informar_('Caché de logos limpiada. Se releerán de Drive en el próximo envío.');
}

/** Devuelve los logos, desde caché si ya se generó. */
function logos() {
  if (PROPIEDADES.getProperty('LOGOS_CACHEADOS') === 'si') {
    return {
      alcaldia: leerPropiedadLarga('LOGO_B64_ALCALDIA'),
      evidencia: leerPropiedadLarga('LOGO_B64_EVIDENCIA'),
      comite: leerPropiedadLarga('LOGO_B64_COMITE'),
    };
  }
  return obtenerLogosBase64();
}

// ─────────────────────────────────────────────────────────────
// GENERACIÓN
// ─────────────────────────────────────────────────────────────

function generarPdf(id, identificacion, consolidado, valoraciones, promedio) {
  var carpetaId = PROPIEDADES.getProperty('CARPETA_PDF_ID');
  if (!carpetaId) {
    throw new Error('Falta la propiedad CARPETA_PDF_ID. Ejecuta crearEstructura() (ver GAS.md).');
  }

  var html = construirHtmlActa(id, identificacion, consolidado, valoraciones, promedio);
  var blob = Utilities.newBlob(html, 'text/html', 'acta.html').getAs('application/pdf');

  blob.setName(nombreArchivo(id, identificacion));

  var carpeta = DriveApp.getFolderById(carpetaId);
  var archivo = carpeta.createFile(blob);

  // El panel no tiene credenciales, así que el PDF debe ser legible por
  // cualquiera con el enlace. Queda advertido en el README.
  //
  // Si esto falla (p. ej. cuota de Drive para compartir como público), el
  // archivo YA quedó creado — no perdemos su id ni su url por eso. Es peor
  // devolver undefined aquí: guardarDatosPdf() nunca se ejecutaría, la fila
  // se queda sin enlace, y el próximo reintento crea OTRO archivo duplicado
  // en vez de reutilizar este. Queda sin compartir hasta que se reintente
  // (regenerarPdfsFaltantes() no lo tocaría porque ya tiene pdf_file_id;
  // usa "Generar el PDF" del detalle en el panel para forzarlo de nuevo).
  try {
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    console.error('No se pudo compartir el PDF de ' + id + ': ' + err);
  }

  return { fileId: archivo.getId(), url: archivo.getUrl() };
}

function nombreArchivo(id, identificacion) {
  var entidad = (identificacion.validador_entidad || 'sin-entidad')
    .replace(/[^\wáéíóúñÁÉÍÓÚÑ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
  var fecha = identificacion.fecha_validacion || 'sin-fecha';
  return 'Validacion_' + entidad + '_' + fecha + '_' + id + '.pdf';
}

function regenerarPdfDeRespuesta(id) {
  var datos = obtenerRespuesta(id);
  if (!datos.ok) return datos;

  var respuesta = datos.respuesta;
  var identificacion = {
    version_documento: respuesta.version_documento,
    fecha_validacion: respuesta.fecha_validacion,
    validador_nombre: respuesta.validador_nombre,
    validador_entidad: respuesta.validador_entidad,
    validador_cargo: respuesta.validador_cargo,
  };
  var consolidado = {
    fortalezas: respuesta.consolidado_fortalezas,
    aspectos_mejorar: respuesta.consolidado_aspectos_mejorar,
    ajustes_prioritarios: respuesta.consolidado_ajustes_prioritarios,
    recomendaciones: respuesta.consolidado_recomendaciones,
  };

  var pdf = generarPdf(
    id,
    identificacion,
    consolidado,
    datos.valoraciones,
    Number(respuesta.promedio_general)
  );

  var hoja = hoja_().getSheetByName(HOJAS.RESPUESTAS);
  guardarDatosPdf(hoja, id, pdf.fileId, pdf.url);

  return { ok: true, id: id, pdf_file_id: pdf.fileId, pdf_url: pdf.url };
}

/** Recorre las respuestas sin PDF y lo genera. Ejecutar desde el editor. */
function regenerarPdfsFaltantes() {
  var hoja = hoja_().getSheetByName(HOJAS.RESPUESTAS);
  var respuestas = leerHoja(hoja);
  var pendientes = respuestas.filter(function (r) {
    return !r.pdf_file_id;
  });

  if (pendientes.length === 0) {
    informar_('Todas las validaciones tienen su PDF generado.');
    return;
  }

  var generados = 0;
  var errores = [];

  pendientes.forEach(function (respuesta) {
    try {
      regenerarPdfDeRespuesta(respuesta.id);
      generados++;
    } catch (err) {
      errores.push(respuesta.id + ': ' + err);
    }
  });

  informar_(
    'PDF generados: ' + generados + ' de ' + pendientes.length +
      (errores.length ? '\n\nErrores:\n' + errores.join('\n') : '')
  );
}

// ─────────────────────────────────────────────────────────────
// MAQUETA DEL ACTA
// ─────────────────────────────────────────────────────────────

function escaparHtml(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function construirHtmlActa(id, identificacion, consolidado, valoraciones, promedio) {
  var imagenes = logos();

  // Agrupa las 29 valoraciones por criterio conservando el orden de llegada.
  var criterios = [];
  var indicePorId = {};
  valoraciones.forEach(function (v) {
    if (indicePorId[v.criterio_id] === undefined) {
      indicePorId[v.criterio_id] = criterios.length;
      criterios.push({ id: v.criterio_id, nombre: v.criterio, filas: [] });
    }
    criterios[indicePorId[v.criterio_id]].filas.push(v);
  });

  var bloques = criterios
    .map(function (criterio) {
      var filas = criterio.filas
        .map(function (v) {
          var nivel = ESCALA[Number(v.valoracion)] || { etiqueta: '—', color: '#9AA5B1' };
          return (
            '<tr>' +
            '<td class="id">' + escaparHtml(v.aspecto_id) + '</td>' +
            '<td class="aspecto">' + escaparHtml(v.aspecto) + '</td>' +
            '<td class="valoracion"><span class="nivel" style="background:' + nivel.color + '">' +
            escaparHtml(v.valoracion) + '</span><br><span class="nivelTexto">' +
            escaparHtml(nivel.etiqueta) + '</span></td>' +
            '<td class="texto">' + (escaparHtml(v.observaciones) || '<span class="vacio">—</span>') + '</td>' +
            '<td class="texto">' + (escaparHtml(v.ajustes_requeridos) || '<span class="vacio">—</span>') + '</td>' +
            '<td class="texto">' + (escaparHtml(v.responsable) || '<span class="vacio">—</span>') + '</td>' +
            '</tr>'
          );
        })
        .join('');

      return (
        '<div class="criterio">' +
        '<h2>' + escaparHtml(criterio.id) + '. ' + escaparHtml(criterio.nombre) + '</h2>' +
        '<table class="matriz">' +
        '<thead><tr>' +
        '<th class="id">#</th><th>Aspecto revisado</th><th class="valoracion">Valoración</th>' +
        '<th>Observaciones</th><th>Ajustes requeridos</th><th>Responsable</th>' +
        '</tr></thead>' +
        '<tbody>' + filas + '</tbody>' +
        '</table>' +
        '</div>'
      );
    })
    .join('');

  var seccionesConsolidado = CAMPOS_CONSOLIDADO_PDF.map(function (campo) {
    var valor = consolidado[campo[0]];
    return (
      '<div class="consolidadoItem">' +
      '<h3>' + escaparHtml(campo[1]) + '</h3>' +
      '<p>' + (escaparHtml(valor) || '<span class="vacio">Sin registro</span>') + '</p>' +
      '</div>'
    );
  }).join('');

  var nivelPromedio = ESCALA[Math.round(promedio)] || { color: '#9AA5B1' };

  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><style>',
    '@page { size: A4 landscape; margin: 12mm 10mm; }',
    'body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 8.5pt; color: #1F2933; line-height: 1.4; }',
    '.logos { display: flex; align-items: center; gap: 18px; padding-bottom: 8px; border-bottom: 2px solid #1F2933; }',
    '.logos img { height: 30px; }',
    'h1 { font-size: 13pt; margin: 12px 0 2px; }',
    '.subtitulo { font-size: 9pt; color: #52606D; margin-bottom: 12px; }',
    '.ficha { width: 100%; border-collapse: collapse; margin-bottom: 14px; }',
    '.ficha td { padding: 4px 8px; border: 1px solid #D9DDE3; vertical-align: top; }',
    '.ficha .clave { background: #F4F5F7; font-weight: bold; width: 15%; white-space: nowrap; }',
    '.resumen { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #F4F5F7; border-radius: 4px; margin-bottom: 16px; }',
    '.resumenValor { font-size: 16pt; font-weight: bold; color: #fff; padding: 4px 12px; border-radius: 4px; }',
    '.criterio { margin-bottom: 14px; page-break-inside: avoid; }',
    '.criterio h2 { font-size: 10pt; margin: 0 0 4px; padding-bottom: 3px; border-bottom: 1px solid #006C84; color: #00505F; }',
    '.matriz { width: 100%; border-collapse: collapse; }',
    '.matriz th { background: #1F2933; color: #fff; font-size: 7.5pt; text-align: left; padding: 4px 6px; font-weight: 600; }',
    '.matriz td { border: 1px solid #D9DDE3; padding: 4px 6px; vertical-align: top; }',
    '.matriz .id { width: 4%; color: #52606D; font-size: 7.5pt; }',
    '.matriz .aspecto { width: 28%; }',
    '.matriz .valoracion { width: 10%; text-align: center; }',
    '.matriz .texto { width: 19%; font-size: 8pt; }',
    '.nivel { display: inline-block; min-width: 16px; padding: 1px 6px; border-radius: 3px; color: #fff; font-weight: bold; }',
    '.nivelTexto { font-size: 6.5pt; color: #52606D; }',
    '.vacio { color: #9AA5B1; }',
    '.consolidado { page-break-before: always; }',
    '.consolidadoItem { margin-bottom: 12px; padding: 8px 10px; border: 1px solid #D9DDE3; border-radius: 4px; }',
    '.consolidadoItem h3 { font-size: 9pt; margin: 0 0 4px; color: #00505F; }',
    '.consolidadoItem p { margin: 0; white-space: pre-wrap; }',
    '.pie { margin-top: 18px; padding-top: 6px; border-top: 1px solid #D9DDE3; font-size: 7pt; color: #52606D; }',
    '</style></head><body>',

    '<div class="logos">',
    '<img src="' + imagenes.alcaldia + '" alt="Alcaldía de Manizales">',
    '<img src="' + imagenes.evidencia + '" alt="Colombia Evidencia Potencial en Educación">',
    '<img src="' + imagenes.comite + '" alt="Comité de Cafeteros de Caldas">',
    '</div>',

    '<h1>Matriz de validación técnica</h1>',
    '<p class="subtitulo">Protocolo de Articulación de la Educación Media con la Educación Superior — Proyecto La Universidad en el Campo</p>',

    '<table class="ficha">',
    '<tr><td class="clave">Versión</td><td>' + escaparHtml(identificacion.version_documento) + '</td>',
    '<td class="clave">Fecha</td><td>' + escaparHtml(identificacion.fecha_validacion) + '</td>',
    '<td class="clave">Valida</td><td>' + escaparHtml(identificacion.validador_nombre) + '</td></tr>',
    '<tr><td class="clave">Entidad</td><td>' + escaparHtml(identificacion.validador_entidad) + '</td>',
    '<td class="clave">Cargo</td><td colspan="3">' + escaparHtml(identificacion.validador_cargo) + '</td></tr>',
    '</table>',

    '<div class="resumen">',
    '<span class="resumenValor" style="background:' + nivelPromedio.color + '">' + promedio.toFixed(1) + '</span>',
    '<span><strong>Promedio general</strong> sobre 4 · ' + valoraciones.length + ' aspectos valorados<br>',
    '<span style="color:#52606D">Escala: 1 No cumple · 2 Cumple parcialmente · 3 Cumple con ajustes menores · 4 Cumple plenamente</span></span>',
    '</div>',

    bloques,

    '<div class="consolidado">',
    '<h1>Consolidado de la validación</h1>',
    seccionesConsolidado,
    '</div>',

    '<p class="pie">Acta generada automáticamente el ' +
      Utilities.formatDate(new Date(), 'America/Bogota', "d 'de' MMMM 'de' yyyy 'a las' HH:mm") +
      ' · Identificador de la validación: ' + escaparHtml(id) + '</p>',

    '</body></html>',
  ].join('');
}
