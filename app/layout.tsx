import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Mock Entry 10 Exam',
  description: '9th-grade English exam practice system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
