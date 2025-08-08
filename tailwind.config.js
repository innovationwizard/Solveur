/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sora': ['Sora', 'sans-serif'],
      },
      colors: {
        // Digital Architect's Toolkit - Color Palette
        primary: {
          50: '#F8FAFC',   // Slate 50 - Soft off-white
          100: '#F1F5F9',  // Slate 100
          200: '#E2E8F0',  // Slate 200
          300: '#CBD5E1',  // Slate 300
          400: '#94A3B8',  // Slate 400
          500: '#64748B',  // Slate 500
          600: '#475569',  // Slate 600
          700: '#334155',  // Slate 700
          800: '#1E293B',  // Slate 800
          900: '#0F172A',  // Slate 900 - Deep charcoal
        },
        accent: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#007AFF',  // Primary accent blue
          600: '#0056CC',
          700: '#004499',
          800: '#003366',
          900: '#002244',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Sora, sans-serif',
            color: '#0F172A',
            h1: {
              fontFamily: 'Sora, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
            },
            h2: {
              fontFamily: 'Sora, sans-serif',
              fontWeight: '600',
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
            },
            h3: {
              fontFamily: 'Sora, sans-serif',
              fontWeight: '600',
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
            },
            h4: {
              fontFamily: 'Sora, sans-serif',
              fontWeight: '600',
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
            },
            p: {
              fontFamily: 'Sora, sans-serif',
              fontWeight: '400',
              lineHeight: '1.6',
              color: '#475569',
            },
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'accent': '0 4px 12px rgba(0, 122, 255, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}