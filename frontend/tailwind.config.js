module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fun: ['"Baloo 2"', '"Comic Neue"', 'cursive'],
      },
      colors: {
        pinky: '#FFB6B9',
        yellowy: '#FFD93D',
        bluey: '#A0E7E5',
        greeny: '#B5EAD7',
        purpley: '#C7CEEA',
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',  // iPad Mini and similar tablets
        'ipad': '810px', // iPad and iPad Air 
        'ipad-pro': '1024px', // iPad Pro 11"
        'ipad-pro-large': '1366px', // iPad Pro 12.9"
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
} 