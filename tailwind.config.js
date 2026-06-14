/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#030a04',
          900: '#051508',
          800: '#0a2310',
          700: '#0f3318',
          600: '#165c24',
          500: '#1e8a34',
          400: '#25b541',
          300: '#34d058',
          200: '#6ee49e',
          100: '#b0f0c8',
          50:  '#edfdf4',
        },
        carbon: {
          950: '#080c08',
          900: '#0d150e',
          800: '#121e13',
          700: '#1a2b1e',
          600: '#233629',
          500: '#2d4233',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'eco-gradient':    'linear-gradient(135deg, #0a2310 0%, #051508 50%, #0a0f0d 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(26,43,30,0.8) 0%, rgba(13,21,14,0.6) 100%)',
        'green-glow':      'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass':     '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-green':'0 0 30px rgba(34,197,94,0.3)',
        'glow-teal': '0 0 30px rgba(20,184,166,0.3)',
        'card':      '0 4px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':        'float 6s ease-in-out infinite',
        'count-up':     'countUp 1s ease-out forwards',
        'slide-up':     'slideUp 0.4s ease-out forwards',
        'slide-in-right':'slideInRight 0.3s ease-out forwards',
        'fade-in':      'fadeIn 0.4s ease-out forwards',
        'bounce-gentle':'bounceGentle 2s infinite',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
