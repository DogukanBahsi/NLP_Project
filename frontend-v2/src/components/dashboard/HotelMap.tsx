'use client'
import { motion } from 'framer-motion'
import { MapPin, ExternalLink } from 'lucide-react'

interface Props {
  hotel: { name: string; latitude?: number; longitude?: number; address?: string }
}

export default function HotelMap({ hotel }: Props) {
  const hasCoords = hotel?.latitude && hotel?.longitude

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1,  y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Konum</h3>
        </div>
        {hasCoords && (
          <a
            href={`https://maps.google.com/?q=${hotel.latitude},${hotel.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Google Maps'te Aç
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {hasCoords ? (
        <div className="relative">
          <iframe
            src={`https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`}
            className="w-full h-52 border-0"
            loading="lazy"
            title={`${hotel.name} Harita`}
          />
          <div className="absolute inset-0 pointer-events-none border border-white/5" />
        </div>
      ) : (
        <div className="h-52 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/4 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Konum verisi yok</p>
            <p className="text-xs text-slate-700 mt-0.5">Otel içe aktarılırken GPS otomatik kaydedilir</p>
          </div>
        </div>
      )}

      {hotel?.address && (
        <div className="px-5 py-3 border-t border-white/5">
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
            {hotel.address}
          </p>
        </div>
      )}
    </motion.div>
  )
}
