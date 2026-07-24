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

  // Prueba real de extremo a extremo: genera un acta de muestra y la borra.
  try {
    var muestra = generarPdf(
      'PRUEBA-INSTALACION',
      {
        version_documento: 'Versión de prueba',
        fecha_validacion: Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd'),
        validador_nombre: 'Prueba de instalación',
        validador_entidad: 'Comité de Cafeteros de Caldas',
        validador_cargo: 'Verificación técnica',
      },
      { fortalezas: 'Documento de prueba generado por verificarInstalacion().' },
      [
        {
          criterio_id: 1,
          criterio: 'Coherencia conceptual',
          aspecto_id: '1.1',
          aspecto: 'El documento desarrolla claramente el propósito del protocolo.',
          valoracion: 4,
          observaciones: 'Prueba',
          ajustes_requeridos: '',
          responsable: '',
        },
      ],
      4
    );

    DriveApp.getFileById(muestra.fileId).setTrashed(true);

    informar_(
      '✓ Instalación correcta.\n\nSe generó un acta de prueba y se envió a la papelera.\n' +
        'Ya puedes desplegar la Web App y conectar el formulario.'
    );
  } catch (err) {
    informar_('✗ La generación del PDF falló:\n\n' + err);
  }
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
      .addItem('Limpiar caché de logos', 'limpiarCacheLogos')
      .addToUi();
  } catch (err) {
    // Proyecto independiente sin UI de hoja: no hay menú que crear.
  }
}
