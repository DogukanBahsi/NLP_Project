'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, X, CloudUpload, Table2
} from 'lucide-react'
import { getHotels, uploadCsvReviews, uploadMultiSourceCsv } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import toast  from 'react-hot-toast'
import { useEffect } from 'react'

type Mode = 'standard' | 'multi'

export default function UploadPage() {
  const [hotels,       setHotels]       = useState<any[]>([])
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [hotelId,      setHotelId]      = useState<string>('')
  const [mode,         setMode]         = useState<Mode>('standard')
  const [file,         setFile]         = useState<File | null>(null)
  const [dragging,     setDragging]     = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [result,       setResult]       = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getHotels().then(setHotels).catch(() => {})
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) setFile(f)
    else toast.error('Sadece CSV dosyası yüklenebilir.')
  }, [])

  const handleUpload = async () => {
    if (!file)    { toast.error('Dosya seçin.');  return }
    if (!hotelId) { toast.error('Otel seçin.');   return }
    setUploading(true)
    setResult(null)
    try {
      const id  = parseInt(hotelId)
      const res = mode === 'standard'
        ? await uploadCsvReviews(id, file)
        : await uploadMultiSourceCsv(id, file)
      setResult({ ok: true, ...res })
      toast.success(`${res.inserted_count ?? res.added_count ?? '?'} yorum eklendi!`)
    } catch {
      setResult({ ok: false, message: 'Yükleme başarısız. Backend bağlantısını kontrol edin.' })
      toast.error('Yükleme başarısız.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        selectedHotel={selectedHotel}
        onHotelChange={setSelectedHotel}
        analyzedHotels={hotels}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-3xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-white">Yorum Yükle</h1>
            <p className="text-sm text-slate-500 mt-0.5">CSV dosyasıyla toplu yorum içe aktarın</p>
          </motion.div>

          {/* Mode selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#111827] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-3">Yükleme Modu</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'standard', label: 'Standart CSV',      icon: FileText,  desc: 'comment sütunlu basit CSV'              },
                { id: 'multi',    label: 'Çok Kaynaklı CSV',   icon: Table2,    desc: 'source sütunlu, çoklu platform verisi' },
              ] as { id: Mode; label: string; icon: any; desc: string }[]).map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    mode === m.id
                      ? 'bg-indigo-500/10 border-indigo-500/30 shadow-glow-indigo'
                      : 'bg-white/3 border-white/6 hover:border-white/12'
                  }`}
                >
                  <m.icon className={`w-5 h-5 mt-0.5 shrink-0 ${mode === m.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${mode === m.id ? 'text-white' : 'text-slate-400'}`}>{m.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Hotel select */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111827] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-3">Otel Seç</h3>
            <select
              value={hotelId}
              onChange={e => setHotelId(e.target.value)}
              className="w-full bg-[#1f2937] border border-white/8 text-slate-300 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/40 auth-input"
            >
              <option value="">Otel seçin...</option>
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </motion.div>

          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-indigo-500 bg-indigo-500/8 scale-[1.01]'
                  : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/2'
              }`}
            >
              <input ref={inputRef} type="file" accept=".csv" className="hidden"
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]) }} />

              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" /> Dosyayı kaldır
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      dragging ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/4 border border-white/8'
                    }`}>
                      <CloudUpload className={`w-7 h-7 ${dragging ? 'text-indigo-400' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {dragging ? 'Bırakın' : 'CSV dosyası sürükleyin'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">veya tıklayarak seçin</p>
                    </div>
                    <p className="text-xs text-slate-700 bg-white/3 px-3 py-1 rounded-lg">
                      Sadece .csv formatı desteklenir
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || !hotelId || uploading}
            className="btn-gradient w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor ve analiz ediliyor...</>
            ) : (
              <><Upload className="w-4 h-4" /> Yorumları Yükle & Analiz Et</>
            )}
          </button>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1,  y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-5 rounded-2xl border ${
                  result.ok
                    ? 'bg-green-500/6 border-green-500/15'
                    : 'bg-red-500/6 border-red-500/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.ok
                    ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    : <AlertCircle  className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`font-semibold text-sm ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {result.ok ? 'Yükleme Başarılı' : 'Yükleme Başarısız'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">{result.message}</p>
                    {result.ok && (
                      <div className="flex gap-4 mt-3">
                        {result.inserted_count != null && (
                          <div className="text-center">
                            <p className="text-xl font-bold text-green-400">{result.inserted_count}</p>
                            <p className="text-xs text-slate-600">Eklendi</p>
                          </div>
                        )}
                        {result.skipped_count != null && (
                          <div className="text-center">
                            <p className="text-xl font-bold text-yellow-400">{result.skipped_count}</p>
                            <p className="text-xs text-slate-600">Atlandı</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CSV format guide */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111827] border border-white/5 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-3">CSV Format Rehberi</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1.5 font-medium">Standart CSV (zorunlu sütunlar):</p>
                <div className="bg-[#0d1626] rounded-xl p-3 font-mono text-xs text-slate-400 overflow-x-auto">
                  comment,rating,reviewer_name,review_date<br />
                  "Oda çok güzeldi",5,"Ahmet Y.","2024-01-15"
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5 font-medium">Çok Kaynaklı CSV (ek sütun):</p>
                <div className="bg-[#0d1626] rounded-xl p-3 font-mono text-xs text-slate-400 overflow-x-auto">
                  comment,rating,source,review_date<br />
                  "Harika konum",4,"booking","2024-01-20"
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
