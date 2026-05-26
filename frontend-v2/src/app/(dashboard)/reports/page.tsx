'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Loader2, Calendar, Hotel } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import toast  from 'react-hot-toast'

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const url = selectedHotel
        ? `http://127.0.0.1:8000/reports/pdf?hotel_id=${selectedHotel.id}`
        : 'http://127.0.0.1:8000/reports/pdf'
      const res  = await fetch(url)
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href  = URL.createObjectURL(blob)
      link.download = `HotelReviewAI_Rapor_${new Date().toISOString().slice(0,10)}.pdf`
      link.click()
      toast.success('PDF rapor indirildi!')
    } catch {
      toast.error('Rapor oluşturulamadı.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar selectedHotel={selectedHotel} onHotelChange={setSelectedHotel} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-white">Raporlar</h1>
            <p className="text-sm text-slate-500 mt-0.5">Analiz raporlarını PDF olarak indirin</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111827] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Analiz Raporu</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Sentiment analizi, risk skorları, kategori dağılımı ve aksiyon planını içeren kapsamlı PDF raporu oluşturun.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Anlık veri</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="flex items-center gap-1"><Hotel className="w-3 h-3" /> {selectedHotel?.name ?? 'Tüm Oteller'}</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-gradient px-8 py-3.5 rounded-xl text-white font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Oluşturuluyor...</>
                : <><Download className="w-4 h-4" /> PDF Raporu İndir</>
              }
            </button>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ['Sentiment Analizi',     'Pozitif/Negatif/Nötr dağılım grafiği'],
              ['Risk Skoru Tablosu',    'En yüksek riskli 10 yorum'],
              ['Kategori Dağılımı',     'Sorun alanları ve frekansları'],
            ].map(([title, desc], i) => (
              <div key={i} className="bg-[#111827] border border-white/5 rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-xs font-medium text-white">{title}</p>
                <p className="text-[10px] text-slate-600 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
