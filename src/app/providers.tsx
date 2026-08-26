'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    }))

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4500,
                        style: {
                            background: '#FFFDF5',
                            color: '#171717',
                            border: '1.5px solid #FFD54F',
                            boxShadow: '0 10px 25px rgba(255, 213, 79, 0.25)',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '13px',
                            padding: '14px 20px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#F59E0B',
                                secondary: '#FFFDF5',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#FFFDF5',
                            },
                        },
                    }}
                />
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}
