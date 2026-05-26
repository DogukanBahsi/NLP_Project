'use client'
import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { truncate, categoryIcon } from '@/lib/utils'

interface Props {
  reviews: any[]
}

export default function RiskReviews({ reviews }: Props) {
  if (!reviews.length) return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center justify-center h-full">
      <p className="text-slate-600 text-sm">Yüksek riskli yorum yok</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1,  y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-[#111827] border border-white/5 rounded-2xl p-5 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Yüksek Risk</h3>
        </div>
        <span className="text-xs text-slate-600 bg-white/4 px-2 py-0.5 rounded-lg">Top {reviews.length}</span>
      </div>

      <div className="space-y-3">
        {reviews.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1,  x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-red-500/4 border border-red-500/10 hover:border-red-500/20 transition-all group"
          >
            <span className="text-base shrink-0 mt-0.5">{categoryIcon(r.issue_category)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 leading-relaxed">{truncate(r.comment, 100)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium border border-red-500/15">
                  {r.issue_category}
                </span>
                <span className="text-[10px] text-slate-600">
                  Risk: <span className="text-red-400 font-medium">{r.risk_score}</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
