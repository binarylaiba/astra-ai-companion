/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': 'var(--color-bg-dark)',
        'space-navy': '#111827',
        'neon-cyan': 'var(--color-neon-primary)',
        'neon-purple': 'var(--color-neon-secondary)',
        'neon-blue': 'var(--color-neon-accent)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'rgba(255, 255, 255, 0.05)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-cyan': '0 0 15px rgba(34, 211, 238, 0.5)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.5)',
        'glow-cyan-lg': '0 12px 40px 0 rgba(34, 211, 238, 0.15)',
      }
    },
  },
  plugins: [],
}
