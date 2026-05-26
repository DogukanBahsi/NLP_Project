'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, RefreshCw, Plus, Trash2, Edit3, X, CheckCircle2 } from 'lucide-react'
import { autoFetchPlatformRatings, upsertExternalRating, deleteExternalRating } from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  hotelId:  number
  ratings:  any[]
  onUpdate: () => void
}

function RatingBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: pct >= 80 ? '#22C55E' : pct >= 60 ? '#F59E0B' : '#EF4444' }}
      />
    </div>
  )
}

export default function ExternalRatings({ hotelId, ratings, onUpdate }: Props) {
  const [fetching,  setFetching]  = useState(false)
  const [editModal, setEditModal] = useState<any>(null)
  const [form,      setForm]      = useState({ platform: '', rating: '', max_rating: '', review_count: '', url: '' })

  const handleAutoFetch = async () => {
    setFetching(true)
    try {
      const res = await autoFetchPlatformRatings(hotelId)
      toast.success(`${res.saved_count} platform puanı güncellendi!`)
      onUpdate()
    } catch {
      toast.error('Platform puanları alınamadı.')
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    if (!form.platform || !form.rating) { toast.error('Platform ve puan zorunlu.'); return }
    try {
      await upsertExternalRating(hotelId, {
        platform:     form.platform,
        rating:       parseFloat(form.rating),
        max_rating:   form.max_rating  ? parseFloat(form.max_rating)  : undefined,
        review_count: form.review_count ? parseInt(form.review_count) : undefined,
        url:          form.url || undefined,
      })
      toast.success('Kaydedildi!')
      setEditModal(null)
      onUpdate()
    } catch {
      toast.error('Kayıt başarısız.')
    }
  }

  const handleDelete = async (platform: string) => {
    if (!confirm(`${platform} puanı silinsin mi?`)) return
    try {
      await deleteExternalRating(hotelId, platform)
      toast.success('Silindi!')
      onUpdate()
    } catch {
      toast.error('Silme başarısız.')
    }
  }

  const openAdd = () => {
    setForm({ platform: '', rating: '', max_rating: '', review_count: '', url: '' })
    setEditModal('new')
  }

  const openEdit = (r: any) => {
    setForm({
      platform:     r.platform,
      rating:       String(r.rating ?? ''),
      max_rating:   String(r.max_rating ?? ''),
      review_count: String(r.review_count ?? ''),
      url:          r.url ?? '',
    })
    setEditModal(r.platform)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1,  y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-[#111827] border border-white/5 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Platform Puanları</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFetch}
              disabled={fetching}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs rounded-lg font-medium transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} />
              {fetching ? 'Güncelleniyor...' : 'Otomatik Getir'}
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/8 text-slate-300 text-xs rounded-lg font-medium transition-all"
            >
              <Plus className="w-3 h-3" />
              Ekle
            </button>
          </div>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Platform puanı yok</p>
            <button onClick={handleAutoFetch} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">
              Otomatik getir
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ratings.map((r, i) => (
              <motion.div
                key={r.platform}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1,  scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: r.color + '33', color: r.color }}
                    >
                      {r.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-300">{r.label}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-slate-500 hover:text-white">
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(r.platform)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-slate-500 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-xl font-bold text-white">{r.rating ?? '–'}</span>
                  <span className="text-xs text-slate-600">/ {r.max_rating}</span>
                </div>
                <RatingBar value={r.rating ?? 0} max={r.max_rating} color={r.color} />
                {r.review_count && (
                  <p className="text-[10px] text-slate-600 mt-1.5">{r.review_count.toLocaleString()} değerlendirme</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setEditModal(null) }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1,   y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-card"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">
                  {editModal === 'new' ? 'Platform Puanı Ekle' : 'Düzenle'}
                </h3>
                <button onClick={() => setEditModal(null)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'platform',     label: 'Platform',      ph: 'tripadvisor, booking...' },
                  { key: 'rating',       label: 'Puan',          ph: '4.5'    },
                  { key: 'max_rating',   label: 'Maks. Puan',    ph: '5 veya 10' },
                  { key: 'review_count', label: 'Yorum Sayısı',  ph: '1200'  },
                  { key: 'url',          label: 'URL (opsiyonel)', ph: 'https://...' },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">{f.label}</label>
                    <input
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      disabled={editModal !== 'new' && f.key === 'platform'}
                      className="auth-input w-full px-3 py-2 bg-[#1f2937] border border-white/8 rounded-xl text-white placeholder-slate-600 text-sm disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/8 text-slate-400 text-sm hover:bg-white/8 transition-all">
                  İptal
                </button>
                <button onClick={handleSave} className="btn-gradient flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
