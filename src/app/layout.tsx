import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/shared/Navbar'
import ChatbotWrapper from '@/components/shared/ChatbotWrapper'

export const metadata: Metadata = { title: 'MediBook', description: 'Book appointments with ease' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: '100vh' }}>{children}</main>
          <ChatbotWrapper />
        </AuthProvider>
      </body>
    </html>
  )
}
