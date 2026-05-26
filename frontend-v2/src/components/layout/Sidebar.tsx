'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, Upload, FileText, Settings,
  LogOut, Sparkles, ChevronLeft, ChevronRight, User,
  TrendingUp, Hotel
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/analytics',  label: 'Analytics',   icon: BarChart3       },
  { href: '/upload',     label: 'Yorum Yükle', icon: Upload          },
  { href: '/reports',    label: 'Raporlar',    icon: FileText        },
  { href: '/settings',   label: 'Ayarlar',     icon: Settings        },
]

export default function Sidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Çıkış yapıldı.')
    router.push('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-screen flex flex-col bg-[#0d1626] border-r border-white/[0.05] overflow-hidden sticky top-0 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.05]">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1,  x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white whitespace-nowrap">
                HotelReview<span className="gradient-text">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all ${collapsed ? 'mx-auto mt-2' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative overflow-hidden ${
                  active
                    ? 'sidebar-item-active text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-xl"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <item.icon className={`w-4.5 h-4.5 shrink-0 relative z-10 ${active ? 'text-indigo-400' : ''}`} style={{ width: 18, height: 18 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-sm font-medium whitespace-nowrap overflow-hidden relative z-10 ${active ? 'text-white' : ''}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-white/[0.05] pt-3 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all w-full group"
        >
          <LogOut style={{ width: 18, height: 18 }} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Çıkış Yap</span>}
        </button>

        {user && (
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/3 ${collapsed ? 'justify-center' : ''}`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                <User style={{ width: 14, height: 14 }} className="text-indigo-400" />
              </div>
            )}
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-600 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  )
}
