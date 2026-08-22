/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mocha: {
          rosewater: "#f5e0dc",
          flamingo: "#f2cdcd",
          pink: "#f5c2e7",
          mauve: "#cba6f7",
          red: "#f38ba8",
          maroon: "#eba0ac",
          peach: "#fab387",
          yellow: "#f9e2af",
          green: "#a6e3a1",
          teal: "#94e2d5",
          sky: "#89dceb",
          sapphire: "#74c7ec",
          blue: "#89b4fa",
          lavender: "#b4befe",
          text: "#cdd6f4",
          subtext1: "#bac2de",
          subtext0: "#a6adc8",
          overlay2: "#9399b2",
          overlay1: "#7f849c",
          overlay0: "#6c7086",
          surface2: "#585b70",
          surface1: "#45475a",
          surface0: "#313244",
          base: "#1e1e2e",
          mantle: "#181825",
          crust: "#11111b",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-mauve': 'glowMauve 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glowMauve: {
          '0%': { boxShadow: '0 0 15px rgba(203, 166, 247, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(203, 166, 247, 0.45)' },
        }
      }
    },
  },
  plugins: [],
}
