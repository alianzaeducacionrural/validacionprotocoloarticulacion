import { useState } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { VALOR_MAXIMO } from '../../datos/escala'
import { calcularExtremos, colorDeBarra } from './coloresBarra'
import estilos from './DetallePorAspecto.module.css'

const LARGO_MAXIMO_ETIQUETA = 42

function truncar(texto) {
  if (texto.length <= LARGO_MAXIMO_ETIQUETA) return texto
  return `${texto.slice(0, LARGO_MAXIMO_ETIQUETA).trimEnd()}…`
}

/**
 * Promedio de cada aspecto dentro de un criterio, con un selector de criterio
 * arriba. Mismo criterio de color que BarrasPorCriterio (ver coloresBarra.js),
 * pero calculado dentro del criterio seleccionado, no del formulario completo.
 */
export function DetallePorAspecto({ criterios, aspectos }) {
  const [criterioId, setCriterioId] = useState(criterios[0]?.id)

  const criterioActual = criterios.find((criterio) => criterio.id === criterioId)

  const datos = aspectos
    .filter((aspecto) => Number(aspecto.criterio_id) === criterioId)
    .map((aspecto) => ({
      id: aspecto.aspecto_id,
      nombre: truncar(aspecto.aspecto),
      nombreCompleto: aspecto.aspecto,
      promedio: Number(aspecto.promedio.toFixed(2)),
    }))

  const extremos = calcularExtremos(datos.map((dato) => dato.promedio))

  // 40px por barra: hay dos líneas de eje por etiqueta larga.
  const alto = Math.max(datos.length * 40 + 32, 200)

  return (
    <div className={estilos.contenedor}>
      <div className={estilos.pestanas} role="tablist" aria-label="Criterio">
        {criterios.map((criterio) => (
          <button
            key={criterio.id}
            type="button"
            role="tab"
            aria-selected={criterio.id === criterioId}
            className={`${estilos.pestana} ${criterio.id === criterioId ? estilos.pestanaActiva : ''}`}
            onClick={() => setCriterioId(criterio.id)}
          >
            {criterio.id}
          </button>
        ))}
      </div>

      {criterioActual && <h3 className={estilos.nombreCriterio}>{criterioActual.nombre}</h3>}

      {datos.length === 0 ? (
        <p className={estilos.sinDatos}>Nadie ha valorado este criterio todavía.</p>
      ) : (
        <div style={{ width: '100%', height: alto }}>
          <ResponsiveContainer>
            <BarChart
              data={datos}
              layout="vertical"
              margin={{ left: 0, right: 40, top: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} stroke="#D9DDE3" />
              <XAxis
                type="number"
                domain={[0, VALOR_MAXIMO]}
                ticks={[0, 1, 2, 3, 4]}
                tick={{ fontSize: 11, fill: '#52606D' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={220}
                tick={{ fontSize: 12, fill: '#52606D' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: '#F4F5F7' }}
                formatter={(valor) => [valor, 'Promedio']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.nombreCompleto ?? ''}
                contentStyle={{
                  fontSize: 13,
                  borderRadius: 8,
                  border: '1px solid #D9DDE3',
                  maxWidth: 260,
                }}
              />
              <Bar dataKey="promedio" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                {datos.map((entrada) => (
                  <Cell key={entrada.id} fill={colorDeBarra(entrada.promedio, extremos)} />
                ))}
                <LabelList
                  dataKey="promedio"
                  position="right"
                  style={{ fontSize: 12, fontWeight: 600, fill: '#1F2933' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
