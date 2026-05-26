'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = {
  'pozitif': '#22C55E',
  'negatif': '#EF4444',
  'nötr':    '#8B5CF6',
}

const LABELS = {
  'pozitif': 'Pozitif',
  'negatif': 'Negatif',
  'nötr':    'Nötr',
}

interface Props {
  data: { pozitif: number; negatif: number; nötr: number }
  total: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 shadow-card">
      <p className="text-sm font-semibold" style={{ color: d.payload.fill }}>{d.name}</p>
      <p className="text-white font-bold text-lg">{d.value}</p>
      <p className="text-slate-500 text-xs">{d.payload.pct}%</p>
    </div>
  )
}

export default function SentimentPieChart({ data, total }: Props) {
  const chartData = [
    { name: 'Pozitif', value: data.pozitif, fill: COLORS.pozitif, pct: total ? Math.round(data.pozitif / total * 100) : 0 },
    { name: 'Negatif', value: data.negatif, fill: COLORS.negatif, pct: total ? Math.round(data.negatif / total * 100) : 0 },
    { name: 'Nötr',    value: data['nötr'], fill: COLORS['nötr'], pct: total ? Math.round(data['nötr'] / total * 100) : 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-[#111827] border border-white/5 rounded-2xl p-5 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Duygu Dağılımı</h3>
        <span className="text-xs text-slate-500 bg-white/4 px-2 py-0.5 rounded-lg">{total} yorum</span>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {chartData.map((d, i) => (
          <div key={i} className="text-center">
            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: d.fill }} />
            <p className="text-lg font-bold text-white">{d.pct}%</p>
            <p className="text-xs text-slate-500">{d.name}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
