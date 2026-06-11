export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#2d6a4f',
          hover: '#245a42',
          light: '#e8f4f0',
        },
        accent: {
          DEFAULT: '#2d6a4f',
          light: '#e8f4f0',
        },
        ink: '#1a1a1a',
        muted: '#666666',
        navy: '#1a1a1a',
        border: '#e0e0e0',
      },
    },
  },
  plugins: [],
};
