'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({ email: true, risk: true, weekly: false })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    toast.success('Ayarlar kaydedildi!')
  }

  const Section = ({ icon: Icon, title, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1,  y: 0 }}
      className="bg-[#111827] border border-white/5 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  )

  const Toggle = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-white/4 last:border-0">
      <div>
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-all duration-200 relative ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar selectedHotel={null} onHotelChange={() => {}} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-2xl mx-auto space-y-5">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-white">Ayarlar</h1>
            <p className="text-sm text-slate-500 mt-0.5">Hesap ve uygulama tercihlerinizi yönetin</p>
          </motion.div>

          <Section icon={User} title="Profil Bilgileri">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ad Soyad', value: user?.name ?? '' },
                { label: 'E-posta',  value: user?.email ?? '' },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs text-slate-400">{f.label}</label>
                  <input
                    defaultValue={f.value}
                    className="w-full bg-[#1f2937] border border-white/8 rounded-xl px-3 py-2 text-sm text-white auth-input"
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Bell} title="Bildirimler">
            <Toggle label="E-posta Bildirimleri"  desc="Haftalık analiz raporları" checked={notifications.email}  onChange={(v: boolean) => setNotifications(n => ({ ...n, email: v }))} />
            <Toggle label="Risk Uyarıları"         desc="Yüksek riskli yorum tespiti" checked={notifications.risk}   onChange={(v: boolean) => setNotifications(n => ({ ...n, risk: v }))} />
            <Toggle label="Haftalık Özet"          desc="Pazar günü özet e-postası" checked={notifications.weekly} onChange={(v: boolean) => setNotifications(n => ({ ...n, weekly: v }))} />
          </Section>

          <Section icon={Shield} title="API & Bağlantı">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm text-white">Backend API</p>
                  <p className="text-xs text-slate-600 font-mono">http://127.0.0.1:8000</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Aktif
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm text-white">SerpAPI</p>
                  <p className="text-xs text-slate-600">Google Maps entegrasyonu</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Bağlı
                </div>
              </div>
            </div>
          </Section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
