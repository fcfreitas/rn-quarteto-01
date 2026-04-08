import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1A0A2E',
        surface: '#2D1155',
        primary: '#8B35CC',
        'primary-dark': '#5A1F8A',
        'primary-mid': '#6B28A8',
        accent: '#B060FF',
        'text-muted': '#C4A8E8',
        success: '#4ADE80',
        warning: '#FACC15',
        neutral: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
