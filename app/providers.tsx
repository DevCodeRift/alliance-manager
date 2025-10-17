'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      baseUrl={typeof window !== 'undefined' ? window.location.origin : undefined}
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}
