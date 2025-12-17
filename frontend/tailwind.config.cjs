/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0a0f',
          darker: '#050508',
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#0f3460',
          highlight: '#00d4ff',
          success: '#00ff88',
          warning: '#ffaa00',
          danger: '#ff4444',
          text: '#e0e0e0',
          muted: '#8888aa'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
