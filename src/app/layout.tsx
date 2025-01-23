'use client'

import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('=== Root Layout Mounting ===')
  
  return (
    <html lang="en" className="h-full bg-gray-50">
      <head>
        <title>Bidaaya - Student Project Management Platform</title>
        <meta name="description" content="Connect students with real-world projects and internship opportunities." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full antialiased">
        <AuthProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
