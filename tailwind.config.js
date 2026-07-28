import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    50: '#fdf8f4',
                    100: '#f8ede3',
                    200: '#edd9c4',
                    300: '#d9b896',
                    400: '#b8875c',
                    500: '#8f5c2e',
                    600: '#733311',
                    700: '#5c280e',
                    800: '#4a200c',
                    900: '#3d1a0a',
                    950: '#220d05',
                    accent: '#d9338f',
                },
            },
            maxWidth: {
                store: '1400px',
            },
            boxShadow: {
                card: '0 1px 2px rgba(0,0,0,0.04)',
                'card-hover': '0 4px 20px rgba(0,0,0,0.08)',
            },
            keyframes: {
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(1rem)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    from: { opacity: '0', transform: 'translateX(100%)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
            },
            animation: {
                slideUp: 'slideUp 0.3s ease-out',
                slideInRight: 'slideInRight 0.28s ease-out',
            },
        },
    },

    plugins: [forms],
};
