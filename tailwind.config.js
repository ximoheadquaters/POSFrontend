/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A593B',
          50: '#E8F5EE',
          100: '#C5E4D4',
          200: '#9ED1B7',
          300: '#6DBD97',
          400: '#4DAE7E',
          500: '#1A593B',
          600: '#164F34',
          700: '#11432B',
          800: '#0D3723',
          900: '#062819',
        },
        secondary: {
          DEFAULT: '#386F55',
          50: '#EBF3EF',
          100: '#CDE0D6',
          200: '#ACCBB8',
          300: '#86B398',
          400: '#68A180',
          500: '#386F55',
          600: '#31624A',
          700: '#29533E',
          800: '#214432',
          900: '#163023',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Aptos', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subsection': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'container': '1280px',
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
      },
    },
  },
  plugins: [],
}
