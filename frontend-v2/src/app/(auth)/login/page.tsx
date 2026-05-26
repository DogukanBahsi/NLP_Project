'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Sparkles, BarChart3, Brain, TrendingUp, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const features = [
  { icon: Brain,      label: 'AI Sentiment Analysis',   desc: 'BERT + TF-IDF ile derin duygu analizi'    },
  { icon: BarChart3,  label: 'Real-time Analytics',     desc: 'Anlık trend ve kategori görselleştirmesi' },
  { icon: TrendingUp, label: 'Risk Scoring',            desc: 'Her yorum için itibar riski hesaplaması'  },
  { icon: Shield,     label: 'Multi-Platform Data',     desc: 'Google Maps, Booking, TripAdvisor verisi' },
]

const BLOB_VARIANTS = {
  animate: (i: number) => ({
    x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
    y: [0, 20 * (i % 3 === 0 ? 1 : -1), 0],
    scale: [1, 1.1, 1],
    transition: { duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' },
  }),
}

export default function LoginPage() {
  const { login } = useAuth()
  const router    = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password, remember)
      toast.success('Hoş geldiniz! 🎉')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex overflow-hidden relative">
      {/* Animated background blobs */}
      {[0,1,2,3].map(i => (
        <motion.div
          key={i}
          custom={i}
          variants={BLOB_VARIANTS}
          animate="animate"
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width:  `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            left:   `${[5, 55, 20, 70][i]}%`,
            top:    `${[10, 50, 70, 10][i]}%`,
            background: [
              'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
            ][i],
          }}
        />
      ))}

      {/* LEFT — Branding Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1,  x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex w-[52%] flex-col justify-between p-12 relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">HotelReview<span className="gradient-text">AI</span></span>
        </div>

        {/* Main hero text */}
        <div className="space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ping-slow" />
              AI-Powered Analytics Platform
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
              Otel Yorumlarını<br />
              <span className="gradient-text-brand">Zekâya Dönüştür</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Yüzlerce yorumu saniyeler içinde analiz et. Duygu trendlerini takip et. Riskli yorumları anında tespit et.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1,  x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-indigo-500/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-8">
          {[['10K+','Analiz edilen yorum'],['99%','Uptime'],['7','Desteklenen platform']].map(([val,lbl], i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-2xl font-bold gradient-text">{val}</p>
              <p className="text-xs text-slate-500">{lbl}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">HotelReview<span className="gradient-text">AI</span></span>
          </div>

          {/* Card */}
          <div className="glass rounded-3xl p-8 shadow-card border border-white/[0.06]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Tekrar hoş geldiniz</h2>
              <p className="text-slate-400 text-sm">Hesabınıza giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    className="auth-input w-full pl-10 pr-4 py-3 bg-[#1f2937] border border-white/8 rounded-xl text-white placeholder-slate-600 text-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Şifre</label>
                  <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Şifremi unuttum?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="auth-input w-full pl-10 pr-10 py-3 bg-[#1f2937] border border-white/8 rounded-xl text-white placeholder-slate-600 text-sm transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative w-4 h-4">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center ${
                    remember ? 'bg-indigo-500 border-indigo-500' : 'bg-[#1f2937] border-white/15 group-hover:border-indigo-500/50'
                  }`}>
                    {remember && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-400 select-none">Beni hatırla</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : 'Giriş Yap'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/6" />
                <span className="text-xs text-slate-600">veya</span>
                <div className="h-px flex-1 bg-white/6" />
              </div>

              {/* Social logins */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Google',  icon: 'G', bg: 'bg-[#1f2937] hover:bg-[#2a3548]' },
                  { name: 'GitHub',  icon: '⌥', bg: 'bg-[#1f2937] hover:bg-[#2a3548]' },
                ].map(b => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => toast('Yakında aktif olacak!', { icon: '🔜' })}
                    className={`${b.bg} border border-white/8 rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm text-slate-300 font-medium transition-all duration-200`}
                  >
                    <span className="font-bold text-base leading-none">{b.icon}</span>
                    {b.name}
                  </button>
                ))}
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Kayıt olun
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
