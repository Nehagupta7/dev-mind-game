import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type GameShellProps = {
  title: string
  subtitle: string
  badge: string
  accent: string
  children: ReactNode
}

export default function GameShell({ title, subtitle, badge, accent, children }: GameShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at top, rgba(51,225,255,0.14), transparent 28%),' +
          'radial-gradient(circle at right, rgba(255,122,41,0.12), transparent 26%),' +
          'linear-gradient(180deg, #0a0d13 0%, #111827 100%)',
        color: '#eef1f5',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 980 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent }}>
              {badge}
            </p>
            <h1 style={{ margin: '10px 0 6px', fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 1.05 }}>{title}</h1>
            <p style={{ margin: 0, color: '#8a93a6', fontSize: 15, lineHeight: 1.6 }}>{subtitle}</p>
          </div>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: '#0a0d13',
              background: 'linear-gradient(135deg, #33e1ff, #ff7a29)',
              padding: '12px 18px',
              borderRadius: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Back to Home
          </Link>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
