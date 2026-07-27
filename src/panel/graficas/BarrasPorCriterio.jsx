import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { VALOR_MAXIMO } from '../../datos/escala'
import { calcularExtremos, colorDeBarra } from './coloresBarra'

/**
 * Promedio por criterio, en el mismo orden en que aparecen en el formulario
 * (el backend ya entrega `criterios` ordenado por criterio_id).
 *
 * Accesibilidad: la etiqueta de valor va siempre visible (no solo en tooltip)
 * y la tabla equivalente se ofrece más abajo en la vista, además del CSV.
 */
export function BarrasPorCriterio({ criterios }) {
  const datos = criterios.map((criterio) => ({
    nombre: criterio.criterio,
    promedio: Number(criterio.promedio.toFixed(2)),
  }))

  const extremos = calcularExtremos(datos.map((dato) => dato.promedio))

  // 34px por barra: suficiente para que la etiqueta del eje no se corte.
  const alto = Math.max(datos.length * 34 + 32, 200)

  return (
    <div style={{ width: '100%', height: alto }}>
      <ResponsiveContainer>
        <BarChart data={datos} layout="vertical" margin={{ left: 0, right: 40, top: 8, bottom: 8 }}>
          <XAxis type="number" domain={[0, VALOR_MAXIMO]} hide />
          <YAxis
            type="category"
            dataKey="nombre"
            width={190}
            tick={{ fontSize: 12, fill: '#52606D' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: '#F4F5F7' }}
            formatter={(valor) => [valor, 'Promedio']}
            contentStyle={{
              fontSize: 13,
              borderRadius: 8,
              border: '1px solid #D9DDE3',
            }}
          />
          <Bar dataKey="promedio" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
            {datos.map((entrada) => (
              <Cell key={entrada.nombre} fill={colorDeBarra(entrada.promedio, extremos)} />
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
  )
}
