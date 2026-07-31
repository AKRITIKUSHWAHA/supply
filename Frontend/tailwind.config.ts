import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // High-end primary palette
        // High-end primary palette — Warm Vibrant Golden-Amber Yellow
        primary: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Aurora Violet
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Cyber Cyan
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Vibrant Emerald
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Warm Amber
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Coral Rose
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Dark Obsidian Sidebar
        sidebar: {
          bg:         '#090d16',
          surface:    '#111827',
          hover:      '#1f2937',
          active:     '#d97706',
          border:     '#1e293b',
          text:       '#94a3b8',
          textActive: '#ffffff',
        },
        // Modern SaaS Surfaces - Rich contrast
        surface: {
          bg:      '#fbfcf8',
          card:    '#ffffff',
          border:  '#e2e8f0',
          hover:   '#fffbeb',
        },
        dark: {
          bg:     '#090d16',
          card:   '#111827',
          border: '#1f2937',
          hover:  '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'card':       '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-md':    '0 12px 28px -4px rgba(217, 119, 6, 0.15), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        'card-lg':    '0 24px 48px -12px rgba(217, 119, 6, 0.20), 0 8px 24px -4px rgba(15, 23, 42, 0.08)',
        'glow-primary': '0 0 25px rgba(245, 158, 11, 0.40)',
        'glow-cyan':    '0 0 25px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
        'glow-rose':    '0 0 25px rgba(244, 63, 94, 0.30)',
      },
      backgroundImage: {
        'gradient-aurora':  'linear-gradient(135deg, #f59e0b 0%, #eab308 50%, #d97706 100%)',
        'gradient-primary': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0e1424 0%, #070a12 100%)',
        'gradient-mesh':    'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.04) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.04) 0px, transparent 50%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'fade-in':    'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
