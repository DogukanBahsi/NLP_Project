'use client'
import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { motion } from 'framer-motion'

interface Props {
  data:      any[]
  groupBy:   string
  timeRange: string
  onGroupChange:     (v: string) => void
  onTimeRangeChange: (v: string) => void
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1626] border border-white/10 rounded-xl p-3 shadow-card min-w-[160px]">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: p.color }} className="text-xs">{p.name}</span>
          <span className="font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ data, groupBy, timeRange, onGroupChange, onTimeRangeChange }: Props) {
  const groupOpts = [
    { value: 'daily',   label: 'Günlük'  },
    { value: 'weekly',  label: 'Haftalık' },
    { value: 'monthly', label: 'Aylık'   },
  ]
  const rangeOpts = [
    { value: 'last_week',  label: '7 Gün'  },
    { value: 'last_month', label: '30 Gün' },
    { value: 'last_year',  label: '1 Yıl'  },
    { value: 'all',        label: 'Tümü'   },
  ]

  const xInterval = groupBy === 'daily' ? Math.max(0, Math.floor(data.length / 7) - 1) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1,  y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[#111827] border border-white/5 rounded-2xl p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-semibold text-white">Yorum Trendi</h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/4 rounded-lg p-0.5">
            {groupOpts.map(o => (
              <button
                key={o.value}
                onClick={() => onGroupChange(o.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  groupBy === o.value ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex bg-white/4 rounded-lg p-0.5">
            {rangeOpts.map(o => (
              <button
                key={o.value}
                onClick={() => onTimeRangeChange(o.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeRange === o.value ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="period"
              tick={{ fill: '#4B5563', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            <YAxis
              tick={{ fill: '#4B5563', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="positive" name="Pozitif" fill="#22C55E" opacity={0.8} radius={[3,3,0,0]} />
            <Bar dataKey="negative" name="Negatif" fill="#EF4444" opacity={0.8} radius={[3,3,0,0]} />
            <Bar dataKey="neutral"  name="Nötr"    fill="#8B5CF6" opacity={0.8} radius={[3,3,0,0]} />
            <Line
              type="monotone"
              dataKey="avg_score"
              name="Ort. Skor"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
              yAxisId={0}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
