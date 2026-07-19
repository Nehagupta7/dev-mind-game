import GameShell from './GameShell'

export default function LudoGame() {
  return (
    <GameShell
      title="Ludo"
      subtitle="Route is in place. This shell can later hold the multiplayer game board."
      badge="Play Route"
      accent="#fbbf24"
    >
      <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 620, textAlign: 'center' }}>
          The home page can already redirect into this route. We just need the actual game logic to replace this placeholder view.
        </p>
        <div
          style={{
            width: 'min(100%, 520px)',
            aspectRatio: '1 / 1',
            borderRadius: 28,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: 18,
          }}
        >
          {['#ef4444', '#3b82f6', '#fbbf24', '#22c55e'].map((color, index) => (
            <div
              key={index}
              style={{
                borderRadius: 20,
                background: `linear-gradient(180deg, ${color}, rgba(255,255,255,0.08))`,
                minHeight: 96,
              }}
            />
          ))}
          <div
            style={{
              gridColumn: '1 / -1',
              borderRadius: 20,
              minHeight: 96,
              border: '1px dashed rgba(255,255,255,0.15)',
              display: 'grid',
              placeItems: 'center',
              color: '#8a93a6',
            }}
          >
            Ludo board placeholder
          </div>
        </div>
      </div>
    </GameShell>
  )
}
