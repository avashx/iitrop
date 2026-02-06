/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mongodb: {
          green: '#00ED64',
          dark: '#001E2B',
          slate: '#3D4F58',
          light: '#E8EDEB',
          bg: '#F9FBFA',
          white: '#FFFFFF',
          hover: '#F1F5F4',
        },
        primary: {
          DEFAULT: '#00ED64',
          50:  '#e4fde9',
          100: '#bcfacc',
          200: '#94f7af',
          300: '#6cf591',
          400: '#44f274',
          500: '#00ED64',
          600: '#00c452',
          700: '#009b41',
          800: '#007330',
          900: '#004a1f',
        },
        slate: {
          850: '#1a2230',
        },
        surface: {
          light: '#ffffff',
          glass: 'rgba(255, 255, 255, 0.7)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'green-glow': '0 4px 12px rgba(0, 237, 100, 0.3)',
      },
      borderRadius: {
        '4xl': '2rem', // for pills
      },
    },
  },
  plugins: [],
}
