import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#f9f4ec',
          200: '#f2e9d6',
          300: '#e8d9bc',
        },
        sage: {
          400: '#8fad8a',
          500: '#739970',
          600: '#5c7a59',
          700: '#476145',
        },
        terracotta: {
          400: '#d4836a',
          500: '#c06a4f',
          600: '#a85540',
        },
        warm: {
          50: '#fef9f0',
          100: '#fdf0dc',
          700: '#7c5c2e',
          900: '#3d2c10',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
export default config
