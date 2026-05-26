'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react'
import { getReviewsTable } from '@/lib/api'
import { sentimentColor, sentimentBg, sentimentLabel, categoryIcon, truncate } from '@/lib/utils'

interface Props {
  hotelId?: number
}

const SENTIMENTS = [
  { value: '',          label: 'Tümü'    },
  { value: 'pozitif',   label: 'Pozitif' },
  { value: 'negatif',   label: 'Negatif' },
  { value: 'nötr',      label: 'Nötr'    },
]

export default function ReviewsTable({ hotelId }: Props) {
  const [data,      setData]      = useState<any>({ items: [], total: 0, total_pages: 1, page: 1 })
  const [search,    setSearch]    = useState('')
  const [sentiment, setSentiment] = useState('')
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [drawer,    setDrawer]    = useState<any>(null)

  useEffect(() => {
    setPage(1)
  }, [hotelId, search, sentiment])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await getReviewsTable({ hotelId, search, sentiment, page, pageSize: 12 })
        if (!cancelled) setData(res)
      } catch {}
      finally { if (!cancelled) setLoading(false) }
    }
    const t = setTimeout(load, search ? 400 : 0)
    return () => { cancelled = true; clearTimeout(t) }
  }, [hotelId, search, sentiment, page])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1,  y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden"
      >
        {/* Header + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Tüm Yorumlar</h3>
            <span className="text-xs text-slate-600 bg-white/4 px-2 py-0.5 rounded-lg">{data.total}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Sentiment filter */}
            <div className="flex bg-white/4 rounded-lg p-0.5">
              {SENTIMENTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSentiment(s.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    sentiment === s.value ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-600" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Yorumlarda ara..."
                className="pl-8 pr-3 py-1.5 bg-[#1a2235] border border-white/6 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 w-44"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 text-slate-600 hover:text-slate-400">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Yorum', 'Duygu', 'Kategori', 'Risk', 'Skor', 'Tarih', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 shimmer rounded-md" style={{ width: j === 0 ? '200px' : '60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-600 text-sm">
                    Yorum bulunamadı
                  </td>
                </tr>
              ) : (
                data.items.map((r: any, i: number) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-slate-400 leading-relaxed">{truncate(r.comment, 80)}</p>
                      <p className="text-[10px] text-slate-700 mt-0.5">{r.hotel_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ color: sentimentColor(r.sentiment), background: sentimentBg(r.sentiment) }}
                      >
                        {sentimentLabel(r.sentiment)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{categoryIcon(r.issue_category)} {r.issue_category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1 rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(r.risk_score ?? 0) * 100}%`,
                              backgroundColor: r.risk_score >= 0.7 ? '#EF4444' : r.risk_score >= 0.4 ? '#F59E0B' : '#22C55E',
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{r.risk_score?.toFixed(2) ?? '–'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.satisfaction_score != null ? (
                        <span className={r.satisfaction_score >= 0.7 ? 'text-green-400' : r.satisfaction_score >= 0.4 ? 'text-yellow-400' : 'text-red-400'}>
                          {(r.satisfaction_score * 10).toFixed(1)} / 10
                        </span>
                      ) : '–'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {r.review_date ?? r.created_at ?? '–'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDrawer(r)}
                        className="w-6 h-6 rounded-md bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
          <p className="text-xs text-slate-600">
            Sayfa <span className="text-slate-400 font-medium">{data.page}</span> / <span className="text-slate-400 font-medium">{data.total_pages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-7 h-7 rounded-lg bg-white/4 hover:bg-white/8 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
              const p = i + Math.max(1, Math.min(page - 2, data.total_pages - 4))
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    p === page ? 'bg-indigo-500 text-white' : 'bg-white/4 text-slate-500 hover:bg-white/8'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="w-7 h-7 rounded-lg bg-white/4 hover:bg-white/8 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Review Drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end"
            onClick={e => { if (e.target === e.currentTarget) setDrawer(null) }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-md h-full bg-[#0d1626] border-l border-white/8 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Yorum Detayı</h3>
                <button onClick={() => setDrawer(null)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/4 border border-white/6">
                  <p className="text-sm text-slate-300 leading-relaxed">{drawer.comment}</p>
                </div>
                {[
                  ['Otel', drawer.hotel_name],
                  ['Duygu', sentimentLabel(drawer.sentiment)],
                  ['Kategori', `${categoryIcon(drawer.issue_category)} ${drawer.issue_category}`],
                  ['Risk Skoru', drawer.risk_score?.toFixed(3)],
                  ['Memnuniyet', drawer.satisfaction_score ? `${(drawer.satisfaction_score * 10).toFixed(1)} / 10` : '–'],
                  ['Tarih', drawer.review_date ?? drawer.created_at ?? '–'],
                  ['Kaynak', drawer.source],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between items-start">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className="text-xs font-medium text-white text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
                {drawer.action_suggestion && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/15">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Aksiyon Önerisi</p>
                    <p className="text-xs text-indigo-300 leading-relaxed">{drawer.action_suggestion}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
