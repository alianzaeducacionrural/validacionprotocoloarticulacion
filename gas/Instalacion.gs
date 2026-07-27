/**
 * Funciones de instalación y mantenimiento.
 * Se ejecutan a mano desde el editor de Apps Script, nunca por HTTP.
 */

/**
 * Muestra un mensaje al terminar una función de instalación.
 *
 * Si el proyecto quedó vinculado a la hoja (Extensiones → Apps Script) y se
 * ejecuta desde su menú «Validación», se ve como una alerta emergente. Si es
 * un proyecto independiente (script.google.com aparte) — o si se ejecuta con
 * el botón «Ejecutar» del editor en cualquiera de los dos casos —, no hay
 * ventana de hoja de cálculo disponible; el mensaje entonces solo queda en el
 * registro de ejecución (Ver → Registros), que es donde hay que mirar.
 */
function informar_(mensaje) {
  Logger.log(mensaje);
  try {
    SpreadsheetApp.getUi().alert(mensaje);
  } catch (err) {
    // Sin UI disponible: el mensaje ya quedó en el registro de ejecución.
  }
}

/**
 * Prepara todo lo que el backend necesita:
 *   1. Crea las hojas `respuestas` y `valoraciones` con sus encabezados.
 *   2. Crea la carpeta de Drive para las actas y guarda su id.
 *
 * Es seguro ejecutarla varias veces: no borra nada ni duplica la carpeta.
 * Después hay que subir los tres logos y registrar sus ids (ver GAS.md).
 */
function crearEstructura() {
  var ss = hoja_();
  var mensajes = [];

  obtenerHoja(ss, HOJAS.RESPUESTAS, ENCABEZADOS_RESPUESTAS);
  obtenerHoja(ss, HOJAS.VALORACIONES, ENCABEZADOS_VALORACIONES);
  mensajes.push('✓ Hojas «respuestas» y «valoraciones» listas.');

  var carpetaId = PROPIEDADES.getProperty('CARPETA_PDF_ID');
  if (carpetaId) {
    try {
      var existente = DriveApp.getFolderById(carpetaId);
      mensajes.push('✓ Carpeta de actas ya configurada: ' + existente.getName());
    } catch (err) {
      carpetaId = null;
    }
  }

  if (!carpetaId) {
    var carpetaProyecto = DriveApp.getFolderById(ID_CARPETA_PROYECTO);
    var carpeta = carpetaProyecto.createFolder('Actas de validación — Protocolo de Articulación');
    PROPIEDADES.setProperty('CARPETA_PDF_ID', carpeta.getId());
    mensajes.push('✓ Carpeta de actas creada dentro del proyecto: ' + carpeta.getUrl());
  }

  mensajes.push('');
  mensajes.push('Falta subir los tres logos a Drive y registrar sus ids en');
  mensajes.push('Configuración del proyecto → Propiedades del script:');
  mensajes.push('  LOGO_ALCALDIA_ID, LOGO_EVIDENCIA_ID, LOGO_COMITE_ID');
  mensajes.push('');
  mensajes.push('Luego ejecuta verificarInstalacion() para comprobar que todo quedó bien.');

  informar_(mensajes.join('\n'));
}

/**
 * Comprueba que la instalación esté completa y que el PDF se pueda generar.
 * Ejecutar después de registrar los ids de los logos.
 */
function verificarInstalacion() {
  var problemas = [];
  var ss = hoja_();

  [HOJAS.RESPUESTAS, HOJAS.VALORACIONES].forEach(function (nombre) {
    if (!ss.getSheetByName(nombre)) {
      problemas.push('✗ Falta la hoja «' + nombre + '». Ejecuta crearEstructura().');
    }
  });

  var carpetaId = PROPIEDADES.getProperty('CARPETA_PDF_ID');
  if (!carpetaId) {
    problemas.push('✗ Falta CARPETA_PDF_ID. Ejecuta crearEstructura().');
  } else {
    try {
      DriveApp.getFolderById(carpetaId);
    } catch (err) {
      problemas.push('✗ CARPETA_PDF_ID apunta a una carpeta que ya no existe.');
    }
  }

  ['LOGO_ALCALDIA_ID', 'LOGO_EVIDENCIA_ID', 'LOGO_COMITE_ID'].forEach(function (clave) {
    var id = PROPIEDADES.getProperty(clave);
    if (!id) {
      problemas.push('✗ Falta la propiedad ' + clave + '.');
      return;
    }
    try {
      DriveApp.getFileById(id).getBlob();
    } catch (err) {
      problemas.push('✗ ' + clave + ' apunta a un archivo que no se puede leer.');
    }
  });

  if (problemas.length > 0) {
    informar_('Instalación incompleta:\n\n' + problemas.join('\n'));
    return;
  }

  // Prueba real de extremo a extremo: pasa por guardarValidacion() con las
  // 29 filas (no solo generarPdf() aislado), para que quede atrapado el
  // mismo tipo de bug que ya se coló una vez: el auto-formato de fecha de
  // Sheets sobre aspecto_id y la codificación UTF-8 del POST. Al final borra
  // todo lo que creó — no es una validación real.
  try {
    var resultado = guardarValidacion({
      identificacion: {
        version_documento: 'Versión de prueba',
        fecha_validacion: Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd'),
        validador_nombre: 'Prueba de instalación',
        validador_entidad: 'Comité de Cafeteros de Caldas',
        validador_cargo: 'Verificación técnica',
      },
      consolidado: { fortalezas: 'Registro de prueba generado por verificarInstalacion().' },
      valoraciones: generarValoracionesDePrueba_(),
    });

    if (!resultado.ok) {
      informar_('✗ La escritura de prueba falló:\n\n' + resultado.error);
      return;
    }

    var guardado = obtenerRespuesta(resultado.id);
    var idsRotos = guardado.valoraciones.filter(function (v) {
      return typeof v.aspecto_id !== 'string' || v.aspecto_id.indexOf('.') === -1;
    });
    var acentosRotos = guardado.valoraciones.some(function (v) {
      return v.observaciones && v.observaciones.indexOf('Ã') !== -1;
    });

    eliminarValidacionDePrueba_(resultado.id);
    if (resultado.pdf_file_id) DriveApp.getFileById(resultado.pdf_file_id).setTrashed(true);

    if (idsRotos.length > 0) {
      informar_(
        '✗ ' + idsRotos.length + ' aspecto_id volvieron corruptos (Sheets los leyó como fecha).\n' +
          'Revisa que guardarValidacion() siga fijando la columna con setNumberFormat(\'@\')\n' +
          'antes de escribir (ver GAS.md, «aspecto_id y el auto-formato de fecha de Sheets»).'
      );
      return;
    }

    if (acentosRotos) {
      informar_(
        '✗ Los acentos llegaron corruptos ("Ã" en vez de una vocal con tilde).\n' +
          'Revisa que doPost() siga usando e.postData.getDataAsString(\'UTF-8\')\n' +
          '(ver GAS.md, «Codificación UTF-8 del POST»).'
      );
      return;
    }

    informar_(
      '✓ Instalación correcta.\n\nSe guardó, se releyó y se borró una validación de prueba ' +
        'completa (29 aspectos, con acentos y un PDF real). Ya puedes conectar el formulario.'
    );
  } catch (err) {
    informar_('✗ La prueba de guardado falló:\n\n' + err);
  }
}

/** 29 valoraciones de prueba con la misma forma que envía el formulario real. */
function generarValoracionesDePrueba_() {
  // Aspectos por criterio de la matriz real (ver src/datos/matriz.js): 3, 4,
  // 3, 3, 3, 3, 3, 2, 3, 2 — suma 29. El texto es de relleno; lo único que
  // importa para esta prueba es la FORMA del aspecto_id ("1.1", "10.2"…).
  var conteoPorCriterio = [3, 4, 3, 3, 3, 3, 3, 2, 3, 2];
  var valoraciones = [];

  conteoPorCriterio.forEach(function (cantidad, indice) {
    var criterioId = indice + 1;
    for (var i = 1; i <= cantidad; i++) {
      valoraciones.push({
        criterio_id: criterioId,
        criterio: 'Criterio de prueba ' + criterioId,
        aspecto_id: criterioId + '.' + i,
        aspecto: 'Aspecto de prueba ' + criterioId + '.' + i,
        valoracion: 4,
        // Acentos y ñ a propósito: si el POST llega mal decodificado, aquí
        // se nota ("áéíóúñ" se corrompería a "Ã¡Ã©Ã­Ã³ÃºÃ±").
        observaciones: i === 1 ? 'Prueba de codificación: áéíóúñ' : '',
        ajustes_requeridos: '',
        responsable: '',
      });
    }
  });

  return valoraciones;
}

/** Borra una validación de prueba: su fila en `respuestas` y sus filas en `valoraciones`. */
function eliminarValidacionDePrueba_(id) {
  var ss = hoja_();

  var hojaRespuestas = ss.getSheetByName(HOJAS.RESPUESTAS);
  var filaRespuesta = buscarFilaPorId_(hojaRespuestas, 'id', id, ENCABEZADOS_RESPUESTAS);
  if (filaRespuesta > 0) hojaRespuestas.deleteRow(filaRespuesta);

  var hojaValoraciones = ss.getSheetByName(HOJAS.VALORACIONES);
  var columnaIdRespuesta = ENCABEZADOS_VALORACIONES.indexOf('id_respuesta') + 1;
  var ids = hojaValoraciones
    .getRange(2, columnaIdRespuesta, Math.max(hojaValoraciones.getLastRow() - 1, 0), 1)
    .getValues();

  // De abajo hacia arriba: borrar una fila no debe correr los índices de las
  // que faltan por revisar.
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      hojaValoraciones.deleteRow(i + 2);
    }
  }
}

/** Fila (1-index) donde `encabezados[columna]` === id, o -1 si no está. */
function buscarFilaPorId_(hoja, columna, id, encabezados) {
  var indiceColumna = encabezados.indexOf(columna) + 1;
  var ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) return -1;

  var valores = hoja.getRange(2, indiceColumna, ultimaFila - 1, 1).getValues();
  for (var i = 0; i < valores.length; i++) {
    if (String(valores[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

/**
 * Repara los `aspecto_id` de la hoja `valoraciones` que Sheets convirtió en
 * fecha antes de que `guardarValidacion()` empezara a fijar la columna como
 * texto (ver Codigo.gs). Afectó a todo lo guardado hasta ahora: "1.1", "2.4"…
 * se leían como día.mes ("2.4" → 2 de abril) y Sheets los reemplazó por una
 * fecha real, perdiendo el id original.
 *
 * La reconstrucción es exacta: día = getDate(), mes = getMonth()+1 — es
 * exactamente la operación inversa de cómo Sheets hizo la conversión. Es
 * seguro ejecutarla varias veces: las filas que ya son texto se dejan igual.
 */
function repararAspectoIdCorruptos() {
  var hoja = hoja_().getSheetByName(HOJAS.VALORACIONES);
  if (!hoja || hoja.getLastRow() < 2) {
    informar_('No hay filas en «valoraciones» para revisar.');
    return;
  }

  var columnaAspectoId = ENCABEZADOS_VALORACIONES.indexOf('aspecto_id') + 1;
  var totalFilas = hoja.getLastRow() - 1;
  var rango = hoja.getRange(2, columnaAspectoId, totalFilas, 1);
  var valores = rango.getValues();

  var reparadas = 0;
  var nuevos = valores.map(function (fila) {
    var valor = fila[0];
    if (valor instanceof Date) {
      reparadas++;
      return [valor.getDate() + '.' + (valor.getMonth() + 1)];
    }
    return [valor];
  });

  rango.setNumberFormat('@');
  rango.setValues(nuevos);

  informar_(
    reparadas > 0
      ? '✓ Se repararon ' + reparadas + ' de ' + totalFilas + ' filas. ' +
          'La columna quedó fijada como texto para que no vuelva a pasar.'
      : 'No se encontraron aspecto_id corruptos: ya estaban en texto.'
  );
}

/**
 * Menú propio en la hoja, para no tener que abrir el editor.
 * Solo se activa si el proyecto está vinculado a la hoja de cálculo — si es
 * un proyecto independiente, Sheets nunca dispara este trigger y no pasa
 * nada (no hace falta quitarlo).
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Validación')
      .addItem('Crear estructura', 'crearEstructura')
      .addItem('Verificar instalación', 'verificarInstalacion')
      .addSeparator()
      .addItem('Generar PDF faltantes', 'regenerarPdfsFaltantes')
      .addItem('Reparar aspecto_id corruptos', 'repararAspectoIdCorruptos')
      .addItem('Limpiar caché de logos', 'limpiarCacheLogos')
      .addToUi();
  } catch (err) {
    // Proyecto independiente sin UI de hoja: no hay menú que crear.
  }
}
