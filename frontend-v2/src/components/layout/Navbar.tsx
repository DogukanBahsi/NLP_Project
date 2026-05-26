'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, X, Loader2, Download, ChevronDown, Hotel, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { searchHotels, importReviews } from '@/lib/api'
import toast from 'react-hot-toast'

interface NavbarProps {
  selectedHotel: any
  onHotelChange: (hotel: any) => void
  analyzedHotels?: any[]
}

export default function Navbar({ selectedHotel, onHotelChange, analyzedHotels = [] }: NavbarProps) {
  const { user } = useAuth()
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<any[]>([])
  const [searching,   setSearching]   = useState(false)
  const [importing,   setImporting]   = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [importTarget, setImportTarget] = useState<any>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setShowResults(true)
    try {
      const data = await searchHotels(query.trim())
      setResults(data?.results ?? [])
    } catch {
      toast.error('Arama başarısız.')
    } finally {
      setSearching(false)
    }
  }

  const handleImport = async (hotel: any) => {
    setImportTarget(hotel)
    setImporting(true)
    const tid = toast.loading(`${hotel.title} yorumları içe aktarılıyor...`)
    try {
      const res = await importReviews(
        hotel.title, hotel.data_id, hotel.rating,
        hotel.latitude, hotel.longitude, hotel.place_id, hotel.address
      )
      toast.dismiss(tid)
      if (res.hotel_id) {
        toast.success(`${res.inserted_count} yorum eklendi!`)
        onHotelChange({ id: res.hotel_id, name: hotel.title })
        setShowResults(false)
        setQuery('')
      } else {
        toast.error(res.message || 'İçe aktarma başarısız.')
      }
    } catch {
      toast.dismiss(tid)
      toast.error('Bağlantı hatası.')
    } finally {
      setImporting(false)
      setImportTarget(null)
    }
  }

  return (
    <header className="h-16 bg-[#0d1626]/80 backdrop-blur-xl border-b border-white/[0.05] flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Hotel selector */}
      <div className="flex items-center gap-2 text-sm">
        {selectedHotel ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Hotel className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-300 font-medium text-sm truncate max-w-[180px]">{selectedHotel.name}</span>
            <button onClick={() => onHotelChange(null)} className="text-indigo-400/60 hover:text-indigo-300">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          analyzedHotels.length > 0 && (
            <select
              className="bg-[#1f2937] border border-white/8 text-slate-300 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500/50 max-w-[200px]"
              onChange={e => {
                const h = analyzedHotels.find(h => String(h.id) === e.target.value)
                onHotelChange(h ?? null)
              }}
              defaultValue=""
            >
              <option value="">Tüm Oteller</option>
              {analyzedHotels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          )
        )}
      </div>

      {/* Search bar */}
      <div ref={wrapperRef} className="flex-1 max-w-lg relative">
        <div className="flex items-center gap-2 bg-[#1a2235] border border-white/[0.07] rounded-xl px-3 py-2 focus-within:border-indigo-500/40 transition-colors">
          {searching ? <Loader2 className="w-4 h-4 text-slate-500 animate-spin" /> : <Search className="w-4 h-4 text-slate-500" />}
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder="Otel ara ve içe aktar..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setShowResults(false) }}
              className="text-slate-600 hover:text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-xs rounded-lg font-medium transition-colors"
          >
            Ara
          </button>
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-white/8 rounded-2xl shadow-card overflow-hidden z-50 max-h-80 overflow-y-auto"
            >
              {results.length === 0 && !searching && (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">Sonuç bulunamadı</div>
              )}
              {results.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1,  x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/4 border-b border-white/4 last:border-0 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Hotel className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white truncate">{h.title}</p>
                        {h.address && (
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{h.address.slice(0, 50)}
                          </p>
                        )}
                        {h.rating && <p className="text-xs text-yellow-400 mt-0.5">★ {h.rating} / 5</p>}
                      </div>
                      <button
                        onClick={() => handleImport(h)}
                        disabled={importing && importTarget?.data_id === h.data_id}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-400 text-xs rounded-lg font-medium transition-all disabled:opacity-50"
                      >
                        {importing && importTarget?.data_id === h.data_id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        {h.data_id ? 'İçe Aktar' : 'Kayıt Yok'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl bg-white/4 hover:bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="text-sm text-slate-300 hidden md:block font-medium">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  )
}
