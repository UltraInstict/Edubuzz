/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0F2545', light: '#1A3A6B' },
        accent:  { DEFAULT: '#1D6FEB', light: '#EBF2FF' },
        success: { DEFAULT: '#0E9F6E', light: '#ECFDF5' },
        warn:    { DEFAULT: '#D97706', light: '#FFFBEB' },
        danger:  { DEFAULT: '#DC2626', light: '#FEF2F2' },
        purple:  { DEFAULT: '#7C3AED', light: '#F3E8FF' },
        ink:     '#0F2545',
        muted:   '#64748B',
        border:  '#E2E8F0',
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans:  ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
