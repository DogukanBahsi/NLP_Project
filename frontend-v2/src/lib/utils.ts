import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function scoreColor(score: number): string {
  if (score >= 0.8) return '#22C55E'
  if (score >= 0.6) return '#F59E0B'
  return '#EF4444'
}

export function sentimentColor(s: string): string {
  if (s === 'pozitif') return '#22C55E'
  if (s === 'negatif') return '#EF4444'
  return '#8B5CF6'
}

export function sentimentBg(s: string): string {
  if (s === 'pozitif') return 'rgba(34,197,94,0.1)'
  if (s === 'negatif') return 'rgba(239,68,68,0.1)'
  return 'rgba(139,92,246,0.1)'
}

export function sentimentLabel(s: string): string {
  if (s === 'pozitif') return 'Pozitif'
  if (s === 'negatif') return 'Negatif'
  return 'Nötr'
}

export function categoryIcon(cat: string): string {
  const map: Record<string, string> = {
    temizlik: '🧹', oda: '🛏️', yemek: '🍽️',
    resepsiyon: '🛎️', wifi: '📶', fiyat: '💰', genel: '⭐',
  }
  return map[cat] ?? '📋'
}

export function truncate(str: string, max = 120): string {
  return str.length <= max ? str : str.slice(0, max) + '…'
}
