'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from '@/app/components/AuthButton'

function NavLink(props: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === props.href || pathname.startsWith(props.href + '/')
  return (
    <Link
      href={props.href}
      style={{
        padding: '8px 10px',
        borderRadius: 6,
        textDecoration: 'none',
        color: active ? '#111' : '#333',
        background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
        fontWeight: active ? 600 : 500,
      }}
    >
      {props.label}
    </Link>
  )
}

export default function MainNav() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <nav
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 0',
        }}
      >
        <Link href="/" style={{ fontWeight: 700, textDecoration: 'none', color: '#111' }}>
          GD Setlists
        </Link>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <NavLink href="/explore" label="Explore" />
          <NavLink href="/builder/studio" label="Builder" />
          <NavLink href="/setlists" label="Setlists" />
          <NavLink href="/profile" label="Profile" />
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}