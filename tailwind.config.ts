import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        paper: 'var(--paper)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        // SF Pro on Apple devices, matching the App Store screenshots
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        pacifico: ['var(--font-pacifico)', 'cursive'],
      },
    },
  },
  plugins: [],
}

export default config
