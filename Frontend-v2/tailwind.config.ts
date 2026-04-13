/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#C8962E',
                    50: '#FDF6E7',
                    100: '#FAE9C2',
                    200: '#F5D38A',
                    300: '#EFBC52',
                    400: '#E8A62A',
                    500: '#C8962E',
                    600: '#9B6F1A',
                    700: '#714E0F',
                    800: '#4A3309',
                    900: '#231804',
                },
                surface: {
                    DEFAULT: '#0F1923',
                    light: '#1C2B3A',
                    card: '#243344',
                    border: '#2E4057',
                },
                accent: {
                    DEFAULT: '#2DD4BF',
                    light: '#5EEAD4',
                    dark: '#0F9183',
                },
                neutral: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
                'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
                'display-sm': ['1.875rem', { lineHeight: '1.25' }],
                'display-xs': ['1.5rem', { lineHeight: '1.33' }],
            },
            spacing: {
                18: '4.5rem',
                22: '5.5rem',
                26: '6.5rem',
                88: '22rem',
                92: '23rem',
                96: '24rem',
                100: '25rem',
                104: '26rem',
                112: '28rem',
                120: '30rem',
                128: '32rem',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                glow: '0 0 20px rgba(200, 150, 46, 0.35)',
                'glow-accent': '0 0 20px rgba(45, 212, 191, 0.35)',
                card: '0 4px 24px rgba(0,0,0,0.25)',
                'card-hover': '0 12px 40px rgba(0,0,0,0.4)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient':
                    'linear-gradient(135deg, rgba(15,25,35,0.95) 0%, rgba(15,25,35,0.6) 50%, rgba(15,25,35,0.85) 100%)',
                'card-gradient':
                    'linear-gradient(180deg, transparent 0%, rgba(15,25,35,0.9) 100%)',
                'gold-gradient': 'linear-gradient(135deg, #C8962E 0%, #F5D38A 100%)',
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                shimmer: 'shimmer 2s linear infinite',
                'fade-up': 'fadeUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
