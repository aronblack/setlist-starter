import Providers from './providers'
import './globals.css'

export const metadata = {
  title: 'GD Setlist Builder',
  description: 'Build and share Grateful Dead setlists'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
