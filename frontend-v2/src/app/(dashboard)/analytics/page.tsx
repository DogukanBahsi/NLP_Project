'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line, Legend
} from 'recharts'
import { BarChart3, Brain, Lightbulb, TrendingUp } from 'lucide-react'
import { getDashboardSummary, getNlpSummary, getModelMetrics, getTrendData } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import toast  from 'react-hot-toast'

const CATEGORY_COLORS: Record<string, string> = {
  temizlik: '#3B82F6', oda: '#8B5CF6', yemek: '#F59E0B',
  resepsiyon: '#22C55E', wifi: '#6366F1', fiyat: '#EF4444', genel: '#94A3B8',
}

export default function AnalyticsPage() {
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [summary,       setSummary]       = useState<any>(null)
  const [nlp,           setNlp]           = useState<any>(null)
  const [metrics,       setMetrics]       = useState<any>(null)
  const [trend,         setTrend]         = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)

  const hotelId = selectedHotel?.id ?? null

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDashboardSummary(hotelId).then(setSummary).catch(() => {}),
      getNlpSummary(hotelId).then(setNlp).catch(() => {}),
      getModelMetrics().then(setMetrics).catch(() => {}),
      getTrendData(hotelId ?? undefined, 'monthly', 'all').then(setTrend).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [hotelId])

  const radarData = summary?.top_issue_categories?.map((c: any) => ({
    category: c.category,
    count: c.count,
    fullMark: summary?.total_reviews,
  })) ?? []

  const barData = summary?.top_issue_categories?.map((c: any) => ({
    name: c.category,
    count: c.count,
    fill: CATEGORY_COLORS[c.category] ?? '#6366F1',
  })) ?? []

  const sentimentData = [
    { name: 'Pozitif', value: summary?.sentiment_distribution?.pozitif ?? 0,  fill: '#22C55E' },
    { name: 'Negatif', value: summary?.sentiment_distribution?.negatif ?? 0,  fill: '#EF4444' },
    { name: 'Nötr',    value: summary?.sentiment_distribution?.['nötr'] ?? 0, fill: '#8B5CF6' },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        selectedHotel={selectedHotel}
        onHotelChange={setSelectedHotel}
        analyzedHotels={summary?.analyzed_hotels ?? []}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-[1600px] mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Derinlemesine NLP & sentiment analizi</p>
          </motion.div>

          {/* NLP Summary */}
          {nlp && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#111827] border border-indigo-500/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">AI NLP Özeti</h2>
                  <p className="text-xs text-slate-500">{nlp.hotel_name}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Genel Durum',     content: nlp.general_status,     color: 'from-indigo-500/10' },
                  { label: 'En Büyük Sorun',  content: nlp.top_complaint,      color: 'from-red-500/8'     },
                  { label: 'En Çok Övülen',   content: nlp.top_praise,         color: 'from-green-500/8'   },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} to-transparent border border-white/5`}>
                    <p className="text-xs font-medium text-slate-400 mb-2">{item.label}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.content || '–'}</p>
                  </div>
                ))}
              </div>
              {nlp.recommendation && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/6 border border-green-500/15 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{nlp.recommendation}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111827] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Sorun Kategorisi Dağılımı</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      labelStyle={{ color: '#F8FAFC' }}
                      itemStyle={{ color: '#94A3B8' }}
                    />
                    <Bar dataKey="count" name="Yorum" radius={[6,6,0,0]}>
                      {barData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#111827] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Kategori Radar</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#4B5563', fontSize: 11 }} />
                    <Radar name="Yorum" dataKey="count" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Trend line */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111827] border border-white/5 rounded-2xl p-5 lg:col-span-2"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Aylık Ortalama Skor Trendi</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="period" tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                    />
                    <Line type="monotone" dataKey="avg_score" name="Ort. Skor" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
                    <Line type="monotone" dataKey="positive" name="Pozitif"  stroke="#22C55E" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="negative" name="Negatif"  stroke="#EF4444" strokeWidth={1.5} dot={false} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Model metrics */}
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#111827] border border-white/5 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Model Performansı</h3>
                <span className="text-xs text-slate-600 ml-auto bg-white/4 px-2 py-0.5 rounded-lg">
                  TF-IDF + Logistic Regression
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Accuracy',    value: metrics.accuracy,           color: '#22C55E' },
                  { label: 'F1 Score',    value: metrics.f1_weighted,        color: '#3B82F6' },
                  { label: 'Precision',   value: metrics.precision_weighted, color: '#8B5CF6' },
                  { label: 'Recall',      value: metrics.recall_weighted,    color: '#F59E0B' },
                ].map((m, i) => m.value != null && (
                  <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
                    <p className="text-2xl font-bold" style={{ color: m.color }}>
                      {(m.value * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                    <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
