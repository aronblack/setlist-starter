import './globals.css'
import type { Metadata } from 'next'
import MainNav from '@/app/components/MainNav'
import PlayerProvider from '@/app/components/PlayerProvider'

export const metadata: Metadata = {
  title: 'GD Setlists',
  description: 'Explore and build Grateful Dead setlists',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlayerProvider>
          <MainNav />
          <div style={{ paddingTop: 8 }}>
            {children}
          </div>
        </PlayerProvider>
      </body>
    </html>
  )
}
