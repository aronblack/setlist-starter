import './globals.css'
import type { Metadata } from 'next'
import MainNav from '@/app/components/MainNav'

export const metadata: Metadata = {
  title: 'GD Setlists',
  description: 'Explore and build Grateful Dead setlists',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MainNav />
        <div style={{ paddingTop: 8 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
