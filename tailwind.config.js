/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#121212',
                    card: '#1e1e1e',
                    border: '#2e2e2e',
                    text: '#e0e0e0',
                    muted: '#a0a0a0',
                    primary: '#3b82f6',
                    secondary: '#4b5563',
                    accent: '#60a5fa',
                }
            }
        },
    },
    plugins: [],
}
