import GameShell from './GameShell'

export default function SnakeGame() {
  return (
    <GameShell
      title="Snake"
      subtitle="Fast reflexes, clean route mapping, and a place for the full arcade game."
      badge="Play Route"
      accent="#34d399"
    >
      <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 620, textAlign: 'center' }}>
          The Snake route is connected. We can drop in the actual gameplay board later without changing the navigation.
        </p>
        <div
          style={{
            width: 'min(100%, 520px)',
            aspectRatio: '1.6 / 1',
            borderRadius: 22,
            background:
              'linear-gradient(180deg, rgba(52,211,153,0.12), rgba(52,211,153,0.02)), rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 6,
            padding: 14,
          }}
        >
          {Array.from({ length: 32 }, (_, index) => (
            <div
              key={index}
              style={{
                borderRadius: 8,
                background:
                  index === 4 || index === 5 || index === 6 ? '#34d399' : 'rgba(255,255,255,0.06)',
              }}
            />
          ))}
        </div>
      </div>
    </GameShell>
  )
}
