import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1600px',
      },
    },
    extend: {
      maxWidth: {
        '8xl': '1600px',
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        elevated: 'var(--elevated)',
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: {
            DEFAULT: 'var(--sidebar-primary)',
            foreground: 'var(--sidebar-primary-foreground)',
          },
          accent: {
            DEFAULT: 'var(--sidebar-accent)',
            foreground: 'var(--sidebar-accent-foreground)',
          },
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        category: {
          futebol: 'var(--cat-futebol)',
          show: 'var(--cat-show)',
          teatro: 'var(--cat-teatro)',
          festival: 'var(--cat-festival)',
          esporte: 'var(--cat-esporte)',
          outro: 'var(--cat-outro)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
      },
      boxShadow: {
        soft: '0 1px 2px -1px color-mix(in oklab, var(--foreground) 6%, transparent), 0 8px 28px -14px color-mix(in oklab, var(--foreground) 14%, transparent)',
        glow: '0 0 0 1px color-mix(in oklab, var(--ring) 18%, transparent), 0 18px 42px -18px color-mix(in oklab, var(--primary) 32%, transparent)',
        pop: '0 1px 0 0 color-mix(in oklab, var(--foreground) 5%, transparent), 0 14px 36px -16px color-mix(in oklab, var(--foreground) 24%, transparent)',
        'subtle': '0 1px 0 0 color-mix(in oklab, var(--foreground) 4%, transparent), inset 0 1px 0 0 color-mix(in oklab, var(--background) 60%, transparent)',
      },
      backgroundImage: {
        'grid-faint': "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 0)",
        'noise-hero': "linear-gradient(180deg, color-mix(in oklab, var(--primary) 14%, transparent) 0%, transparent 60%)",
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out',
        'fade-in-up': 'fade-in-up 320ms cubic-bezier(.22,1,.36,1)',
        'fade-in-down': 'fade-in-down 280ms cubic-bezier(.22,1,.36,1)',
        'scale-in': 'scale-in 180ms ease-out',
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(.22,1,.36,1)',
        'slide-in-left': 'slide-in-left 280ms cubic-bezier(.22,1,.36,1)',
        'accordion-down': 'accordion-down 220ms ease-out',
        'accordion-up': 'accordion-up 220ms ease-out',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(.22,1,.36,1)',
        'out-quint': 'cubic-bezier(.22,1,.36,1)',
      },
      willChange: {
        'transform-opacity': 'transform, opacity',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
