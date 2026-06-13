/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf8f3',
          100: '#f9ecdd',
          200: '#f1d4ad',
          300: '#e6b274',
          400: '#d9903f',
          500: '#c9782a',
          600: '#b05e22',
          700: '#8c4720',
          800: '#733a22',
          900: '#5f3120',
        },
        ink: {
          50:  '#f8f6f2',
          100: '#ebe5d8',
          200: '#d6cab1',
          300: '#b9a783',
          400: '#9a8459',
          500: '#7d6a47',
          600: '#5f503a',
          700: '#473c2e',
          800: '#322a22',
          900: '#1f1a15',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        serif: ['"Songti SC"', '"SimSun"', 'serif'],
        mono: ['"SF Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
