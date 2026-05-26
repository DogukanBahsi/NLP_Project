'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, TrendingUp, AlertTriangle, Star,
  Lightbulb, Activity, CheckSquare
} from 'lucide-react'
import { getDashboardSummary, getTrendData, getExternalRatings } from '@/lib/api'
import Navbar           from '@/components/layout/Navbar'
import StatsCard        from '@/components/dashboard/StatsCard'
import SentimentPieChart from '@/components/dashboard/SentimentPieChart'
import TrendChart       from '@/components/dashboard/TrendChart'
import RiskReviews      from '@/components/dashboard/RiskReviews'
import ReviewsTable     from '@/components/dashboard/ReviewsTable'
import ExternalRatings  from '@/components/dashboard/ExternalRatings'
import HotelMap         from '@/components/dashboard/HotelMap'
import toast            from 'react-hot-toast'

export default function DashboardPage() {
  const [selectedHotel,  setSelectedHotel]  = useState<any>(null)
  const [summary,        setSummary]        = useState<any>(null)
  const [trendData,      setTrendData]      = useState<any[]>([])
  const [extRatings,     setExtRatings]     = useState<any[]>([])
  const [groupBy,        setGroupBy]        = useState('monthly')
  const [timeRange,      setTimeRange]      = useState('all')
  const [loading,        setLoading]        = useState(true)

  const hotelId = selectedHotel?.id ?? null

  const loadSummary = useCallback(async () => {
    try {
      const data = await getDashboardSummary(hotelId)
      setSummary(data)
      if (!selectedHotel && data.analyzed_hotels?.length > 0) {
        // keep all hotels view
      }
    } catch { toast.error('Veriler yüklenemedi.') }
  }, [hotelId])

  const loadTrend = useCallback(async () => {
    const effectiveRange = groupBy === 'daily' ? 'last_month' : timeRange
    try {
      const data = await getTrendData(hotelId ?? undefined, groupBy, effectiveRange)
      setTrendData(data)
    } catch {}
  }, [hotelId, groupBy, timeRange])

  const loadExtRatings = useCallback(async () => {
    if (!hotelId) { setExtRatings([]); return }
    try {
      const data = await getExternalRatings(hotelId)
      setExtRatings(data)
    } catch {}
  }, [hotelId])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadSummary(), loadTrend(), loadExtRatings()])
      .finally(() => setLoading(false))
  }, [loadSummary, loadTrend, loadExtRatings])

  const sd = summary?.sentiment_distribution ?? { pozitif: 0, negatif: 0, 'nötr': 0 }
  const total = summary?.total_reviews ?? 0
  const posRate = total ? Math.round(sd.pozitif / total * 100) : 0
  const negRate = total ? Math.round(sd.negatif / total * 100) : 0

  const STATS = [
    {
      title: 'Toplam Yorum',
      value: total,
      icon: MessageSquare,
      color: 'blue' as const,
      index: 0,
    },
    {
      title: 'Ort. Memnuniyet',
      value: (summary?.average_satisfaction_score ?? 0).toFixed(1),
      icon: Star,
      color: 'yellow' as const,
      suffix: '/10',
      index: 1,
    },
    {
      title: 'Pozitif Oran',
      value: posRate,
      icon: TrendingUp,
      color: 'green' as const,
      suffix: '%',
      index: 2,
    },
    {
      title: 'Riskli Yorum',
      value: summary?.high_risk_reviews?.length ?? 0,
      icon: AlertTriangle,
      color: 'red' as const,
      index: 3,
    },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        selectedHotel={selectedHotel}
        onHotelChange={hotel => { setSelectedHotel(hotel); }}
        analyzedHotels={summary?.analyzed_hotels ?? []}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-xl font-bold text-white">
                {selectedHotel ? selectedHotel.name : 'Tüm Oteller'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedHotel
                  ? 'Otel analiz paneli'
                  : `${summary?.analyzed_hotels?.length ?? 0} otel · Genel bakış`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 ping-slow" />
              <span className="text-xs text-slate-500">Canlı Veri</span>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <StatsCard key={i} {...s} />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TrendChart
                data={trendData}
                groupBy={groupBy}
                timeRange={timeRange}
                onGroupChange={setGroupBy}
                onTimeRangeChange={setTimeRange}
              />
            </div>
            <SentimentPieChart data={sd} total={total} />
          </div>

          {/* Action plan + Risk */}
          {(summary?.action_plan?.length > 0 || summary?.weekly_action_plan) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {/* Weekly Action Plan */}
              <div className="bg-[#111827] border border-green-500/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Haftalık Aksiyon Planı</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">{summary?.weekly_action_plan}</p>
                {summary?.action_plan?.length > 0 && (
                  <div className="space-y-2">
                    {summary.action_plan.slice(0, 4).map((a: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-white">{a.title}</p>
                          {a.description && <p className="text-xs text-slate-600">{a.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top categories */}
              <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Sorun Kategorileri</h3>
                </div>
                <div className="space-y-2.5">
                  {summary?.top_issue_categories?.map((cat: any, i: number) => {
                    const pct = total ? Math.round(cat.count / total * 100) : 0
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">{cat.category}</span>
                          <span className="text-slate-500">{cat.count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Map + Platform ratings + Risk (3 col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {summary?.selected_hotel && <HotelMap hotel={summary.selected_hotel} />}
            {hotelId && (
              <ExternalRatings
                hotelId={hotelId}
                ratings={extRatings}
                onUpdate={loadExtRatings}
              />
            )}
            <RiskReviews reviews={summary?.high_risk_reviews ?? []} />
          </div>

          {/* Reviews table */}
          <ReviewsTable hotelId={hotelId ?? undefined} />
        </div>
      </div>
    </div>
  )
}
