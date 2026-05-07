'use client'

import { usePathname } from 'next/navigation'
import HealthChatbot from './HealthChatbot'

export default function ChatbotWrapper() {
  const pathname = usePathname()

  // Hide chatbot on all doctor dashboard pages
  if (pathname?.startsWith('/doctor')) return null

  return <HealthChatbot />
}
