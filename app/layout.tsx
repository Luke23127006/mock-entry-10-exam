import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
})

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
    <html lang="vi" className={beVietnamPro.className}>
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
