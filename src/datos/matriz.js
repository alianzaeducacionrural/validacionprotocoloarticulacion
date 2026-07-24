/**
 * Matriz de validación técnica del Protocolo de Articulación.
 *
 * FUENTE ÚNICA DE VERDAD. De este archivo dependen el formulario, el backend,
 * la generación del PDF y el panel. Texto transcrito literalmente de
 * "MATRIZ DE VALIDACIÓN TÉCNICA.docx".
 *
 * Los identificadores de aspecto (1.1, 1.2, …) no existen en el Word original:
 * se agregan aquí para poder referenciar cada fila de forma estable. No los
 * cambies una vez haya respuestas guardadas — son la llave con la hoja
 * `valoraciones`.
 */

export const CRITERIOS = [
  {
    id: 1,
    nombre: 'Coherencia conceptual',
    aspectos: [
      { id: '1.1', texto: 'El documento desarrolla claramente el propósito del protocolo.' },
      { id: '1.2', texto: 'Existe coherencia entre los capítulos.' },
      { id: '1.3', texto: 'Los conceptos utilizados son claros y consistentes.' },
    ],
  },
  {
    id: 2,
    nombre: 'Pertinencia pedagógica',
    aspectos: [
      { id: '2.1', texto: 'El protocolo refleja los principios del modelo Escuela Nueva.' },
      { id: '2.2', texto: 'Se evidencia la formación por competencias.' },
      { id: '2.3', texto: 'Los PPP articulan toda la trayectoria educativa.' },
      { id: '2.4', texto: 'La evaluación responde al modelo pedagógico.' },
    ],
  },
  {
    id: 3,
    nombre: 'Coherencia curricular',
    aspectos: [
      { id: '3.1', texto: 'Existe armonización entre básica, media y educación superior.' },
      { id: '3.2', texto: 'El currículo base y el currículo específico están claramente diferenciados.' },
      { id: '3.3', texto: 'La homologación de aprendizajes está suficientemente explicada.' },
    ],
  },
  {
    id: 4,
    nombre: 'Cumplimiento normativo',
    aspectos: [
      { id: '4.1', texto: 'El marco normativo es suficiente y actualizado.' },
      { id: '4.2', texto: 'Las responsabilidades institucionales son claras.' },
      { id: '4.3', texto: 'El protocolo responde a la política pública vigente.' },
    ],
  },
  {
    id: 5,
    nombre: 'Viabilidad operativa',
    aspectos: [
      { id: '5.1', texto: 'Los procedimientos son claros y aplicables.' },
      { id: '5.2', texto: 'Los roles de los actores están bien definidos.' },
      { id: '5.3', texto: 'Los tiempos y procesos son viables.' },
    ],
  },
  {
    id: 6,
    nombre: 'Sistema de acompañamiento',
    aspectos: [
      { id: '6.1', texto: 'El rol del padrino está claramente definido.' },
      { id: '6.2', texto: 'Se establecen rutas para permanencia estudiantil.' },
      { id: '6.3', texto: 'Se contemplan estrategias de inclusión y bienestar.' },
    ],
  },
  {
    id: 7,
    nombre: 'Seguimiento y evaluación',
    aspectos: [
      { id: '7.1', texto: 'Los indicadores permiten hacer seguimiento.' },
      { id: '7.2', texto: 'Los comités están claramente definidos.' },
      { id: '7.3', texto: 'El sistema de monitoreo es suficiente.' },
    ],
  },
  {
    id: 8,
    nombre: 'Instrumentos',
    aspectos: [
      { id: '8.1', texto: 'Los formatos son pertinentes.' },
      { id: '8.2', texto: 'Los anexos apoyan la implementación.' },
    ],
  },
  {
    id: 9,
    nombre: 'Calidad del documento',
    aspectos: [
      { id: '9.1', texto: 'Claridad en la redacción.' },
      { id: '9.2', texto: 'Organización lógica.' },
      { id: '9.3', texto: 'Facilidad de uso por parte de las instituciones.' },
    ],
  },
  {
    id: 10,
    nombre: 'Potencial de implementación',
    aspectos: [
      { id: '10.1', texto: 'El protocolo puede implementarse en las instituciones rurales.' },
      { id: '10.2', texto: 'Tiene potencial de réplica en otros territorios.' },
    ],
  },
]

/** Los 29 aspectos aplanados, cada uno con su criterio de origen. */
export const ASPECTOS = CRITERIOS.flatMap((criterio) =>
  criterio.aspectos.map((aspecto) => ({
    ...aspecto,
    criterioId: criterio.id,
    criterioNombre: criterio.nombre,
  })),
)

export const TOTAL_CRITERIOS = CRITERIOS.length
export const TOTAL_ASPECTOS = ASPECTOS.length

/** Campos del consolidado final del documento. */
export const CAMPOS_CONSOLIDADO = [
  {
    clave: 'fortalezas',
    etiqueta: 'Fortalezas del documento',
    ayuda: '¿Qué está bien resuelto y debería conservarse tal como está?',
  },
  {
    clave: 'aspectos_mejorar',
    etiqueta: 'Aspectos por mejorar',
    ayuda: '¿Qué necesita revisión, aunque no sea urgente?',
  },
  {
    clave: 'ajustes_prioritarios',
    etiqueta: 'Ajustes prioritarios',
    ayuda: '¿Qué debe corregirse antes de aprobar el protocolo?',
  },
  {
    clave: 'recomendaciones',
    etiqueta: 'Recomendaciones técnicas',
    ayuda: 'Sugerencias generales para fortalecer el documento.',
  },
]
