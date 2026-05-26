'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const STEPS = ['Hesap Bilgileri', 'Şifre Oluştur', 'Tamamla']

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'En az 6 karakter',   ok: password.length >= 6  },
    { label: 'Büyük harf',          ok: /[A-Z]/.test(password) },
    { label: 'Küçük harf',          ok: /[a-z]/.test(password) },
    { label: 'Rakam veya sembol',   ok: /[\d\W]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const labels = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü']

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-white/10'}`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-xs ${score >= 3 ? 'text-green-400' : score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
          {labels[Math.max(0, score - 1)]}
        </p>
      )}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${c.ok ? 'bg-green-400' : 'bg-white/15'}`} />
            <span className={`text-xs ${c.ok ? 'text-slate-300' : 'text-slate-600'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const router       = useRouter()

  const [step,     setStep]     = useState(0)
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const nextStep = (e: FormEvent) => {
    e.preventDefault()
    if (step < 1) { setStep(s => s + 1); return }
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (password !== confirm) { toast.error('Şifreler eşleşmiyor.'); return }
    if (password.length < 6)  { toast.error('Şifre en az 6 karakter olmalı.'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      setStep(2)
      setTimeout(() => {
        toast.success('Kayıt başarılı! 🎉')
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      toast.error(err.message || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      {[0,1].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: '500px', height: '500px',
            left: i === 0 ? '-10%' : '60%', top: i === 0 ? '0%' : '40%',
            background: i === 0
              ? 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1,  y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">HotelReview<span className="gradient-text">AI</span></span>
        </div>

        <div className="glass rounded-3xl p-8 shadow-card border border-white/[0.06]">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-indigo-500 text-white shadow-glow-indigo' :
                  'bg-white/8 text-slate-500'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white font-medium' : 'text-slate-600'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${i < step ? 'bg-indigo-500' : 'bg-white/8'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 2 ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Hesap Oluşturuldu!</h3>
                <p className="text-slate-400 text-sm">Yönlendiriliyorsunuz...</p>
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : (
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={nextStep}
                className="space-y-5"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {step === 0 ? 'Hesap Oluştur' : 'Şifre Belirle'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {step === 0 ? 'Ücretsiz hesabınızı oluşturun' : 'Güçlü bir şifre seçin'}
                  </p>
                </div>

                {step === 0 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Ad Soyad</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Adınız Soyadınız"
                          required
                          className="auth-input w-full pl-10 pr-4 py-3 bg-[#1f2937] border border-white/8 rounded-xl text-white placeholder-slate-600 text-sm"
                        />
                      </div>
                    </div>
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
                          className="auth-input w-full pl-10 pr-4 py-3 bg-[#1f2937] border border-white/8 rounded-xl text-white placeholder-slate-600 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="auth-input w-full pl-10 pr-10 py-3 bg-[#1f2937] border border-white/8 rounded-xl text-white placeholder-slate-600 text-sm"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Şifre Tekrar</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`auth-input w-full pl-10 pr-4 py-3 bg-[#1f2937] border rounded-xl text-white placeholder-slate-600 text-sm ${
                            confirm && confirm !== password ? 'border-red-500/50' : 'border-white/8'
                          }`}
                        />
                      </div>
                      {confirm && confirm !== password && (
                        <p className="text-xs text-red-400">Şifreler eşleşmiyor</p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/8 text-slate-300 text-sm font-medium hover:bg-white/8 transition-all"
                    >
                      Geri
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kaydediliyor...</>
                    ) : step === 0 ? 'Devam Et' : 'Hesap Oluştur'}
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Zaten hesabınız var mı?{' '}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Giriş yapın</Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
