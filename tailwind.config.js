/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(142, 76%, 96%)",
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 50%)",
          foreground: "hsl(38, 92%, 96%)",
        },
        error: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 84%, 96%)",
        },
        info: {
          DEFAULT: "hsl(217, 91%, 60%)",
          foreground: "hsl(217, 91%, 96%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionDelay: {
        '100': '100ms',
        '200': '200ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addComponents, theme }) {
      addComponents({
        // React Grid Layout styles converted to Tailwind
        '.react-grid-layout': {
          position: 'relative',
          transition: 'height 200ms ease',
        },
        '.react-grid-item': {
          transition: 'all 200ms ease',
          transitionProperty: 'left, top, width, height',
          borderRadius: theme('borderRadius.lg'),
          '& img': {
            pointerEvents: 'none',
            userSelect: 'none',
          },
          '& > .react-resizable-handle': {
            position: 'absolute',
            width: '20px',
            height: '20px',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: '3px',
              bottom: '3px',
              width: '8px',
              height: '8px',
              borderRight: '2px solid rgba(0, 0, 0, 0.4)',
              borderBottom: '2px solid rgba(0, 0, 0, 0.4)',
              borderRadius: '0 0 4px 0',
            },
          },
          '&.react-draggable-dragging': {
            transition: 'none',
            zIndex: '100',
            willChange: 'transform',
            opacity: '0.9',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          '&.dropping': {
            visibility: 'hidden',
          },
          '&.react-grid-placeholder': {
            background: 'rgb(59 130 246 / 0.2)',
            opacity: '0.5',
            transitionDuration: '100ms',
            zIndex: '2',
            userSelect: 'none',
            border: '2px dashed rgb(59 130 246)',
            borderRadius: theme('borderRadius.lg'),
          },
          '&.resizing': {
            transition: 'none',
            zIndex: '100',
            willChange: 'width, height',
          },
          '&.static': {
            background: '#f8f9fa',
            cursor: 'default',
          },
        },
        '.drag-handle': {
          cursor: 'move',
          userSelect: 'none',
          fontWeight: '600',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            background: 'rgb(37 99 235)',
          },
        },
      })
    },
  ],
}

