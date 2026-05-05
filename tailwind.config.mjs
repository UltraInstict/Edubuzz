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
      },
    },
  },
  plugins: [],
};
