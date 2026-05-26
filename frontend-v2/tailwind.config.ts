import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          primary:   '#0F172A',
          secondary: '#111827',
          card:      '#1a2235',
          glass:     'rgba(17,24,39,0.7)',
        },
        brand: {
          blue:   '#3B82F6',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          cyan:   '#22D3EE',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger:  '#EF4444',
          neutral: '#8B5CF6',
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':   'linear-gradient(135deg, #3B82F6, #8B5CF6)',
        'gradient-card':    'linear-gradient(145deg, rgba(59,130,246,0.08), rgba(139,92,246,0.04))',
      },
      boxShadow: {
        'glow-blue':   '0 0 40px rgba(59,130,246,0.25)',
        'glow-violet': '0 0 40px rgba(139,92,246,0.25)',
        'glow-indigo': '0 0 60px rgba(99,102,241,0.3)',
        'card':        '0 8px 32px rgba(0,0,0,0.4)',
        'card-hover':  '0 16px 48px rgba(0,0,0,0.5)',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
