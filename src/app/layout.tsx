import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Todo App',
    description: 'A simple todo app built with Next.js, TypeScript, Prisma, and MySQL',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <main className="container mx-auto px-4 py-8 max-w-4xl">
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    )
}
