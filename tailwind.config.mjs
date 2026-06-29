export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#166534',
          hover: '#14532d',
          light: '#f0fdf4',
          50: '#f0fdf4',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          DEFAULT: '#166534',
          light: '#f0fdf4',
        },
        ink: '#111827',
        muted: '#6b7280',
        navy: '#111827',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
};
