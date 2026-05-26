'use client'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title:   string
  value:   string | number
  icon:    LucideIcon
  color:   'blue' | 'green' | 'red' | 'violet' | 'yellow'
  trend?:  { value: number; label: string }
  suffix?: string
  index?:  number
}

const COLOR_MAP = {
  blue:   { bg: 'from-blue-500/10  to-blue-500/0',   icon: 'bg-blue-500/15   text-blue-400',   border: 'border-blue-500/10',   glow: '' },
  green:  { bg: 'from-green-500/10 to-green-500/0',  icon: 'bg-green-500/15  text-green-400',  border: 'border-green-500/10',  glow: '' },
  red:    { bg: 'from-red-500/10   to-red-500/0',    icon: 'bg-red-500/15    text-red-400',    border: 'border-red-500/10',    glow: '' },
  violet: { bg: 'from-violet-500/10 to-violet-500/0',icon: 'bg-violet-500/15 text-violet-400', border: 'border-violet-500/10', glow: '' },
  yellow: { bg: 'from-yellow-500/10 to-yellow-500/0',icon: 'bg-yellow-500/15 text-yellow-400', border: 'border-yellow-500/10', glow: '' },
}

export default function StatsCard({ title, value, icon: Icon, color, trend, suffix, index = 0 }: StatsCardProps) {
  const c = COLOR_MAP[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1,  y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative bg-[#111827] rounded-2xl p-5 border ${c.border} overflow-hidden card-hover`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} pointer-events-none`} />

      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
            <Icon style={{ width: 20, height: 20 }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
              trend.value >= 0
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {trend.value >= 0
                ? <TrendingUp style={{ width: 12, height: 12 }} />
                : <TrendingDown style={{ width: 12, height: 12 }} />
              }
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {value}{suffix}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{title}</p>
        </div>

        {trend && (
          <p className="text-xs text-slate-600">{trend.label}</p>
        )}
      </div>
    </motion.div>
  )
}
