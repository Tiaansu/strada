import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';
import { StoreProvider } from './StoreProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Strada',
    description: 'A Kanban-inspired task-tracker app.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <StoreProvider>
            <html lang="en">
                <body className={inter.className}>
                    <SessionProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            forcedTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                            <Toaster />
                        </ThemeProvider>
                    </SessionProvider>
                </body>
            </html>
        </StoreProvider>
    );
}
