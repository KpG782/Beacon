import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        beacon: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#262626',
          accent: '#f97316',
          text: '#e5e5e5',
          muted: '#737373',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Geist', 'sans-serif'],
      },
    },
  },
}

export default config
