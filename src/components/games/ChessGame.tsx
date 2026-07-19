import GameShell from './GameShell'

export default function ChessGame() {
  return (
    <GameShell
      title="Chess"
      subtitle="Strategic route is live. This component is ready for a proper board later."
      badge="Play Route"
      accent="#c084fc"
    >
      <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 620, textAlign: 'center' }}>
          The Chess route now exists as its own component file, so we can add a full board without touching routing again.
        </p>
        <div
          style={{
            width: 'min(100%, 520px)',
            aspectRatio: '1 / 1',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
          }}
        >
          {Array.from({ length: 64 }, (_, index) => {
            const row = Math.floor(index / 8)
            const col = index % 8
            const light = (row + col) % 2 === 0
            return (
              <div
                key={index}
                style={{
                  background: light ? '#d8b4fe' : '#5b21b6',
                  display: 'grid',
                  placeItems: 'center',
                  color: light ? '#111827' : '#f8fafc',
                  fontWeight: 800,
                }}
              >
                {(row === 0 || row === 7) && (col === 0 || col === 7) ? 'R' : ''}
              </div>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
