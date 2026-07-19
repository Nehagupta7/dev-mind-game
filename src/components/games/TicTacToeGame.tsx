import GameShell from './GameShell'

export default function TicTacToeGame() {
  return (
    <GameShell
      title="Tic-Tac-Toe"
      subtitle="A quick brain warm-up. This route is ready for the game implementation."
      badge="Play Route"
      accent="#33e1ff"
    >
      <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 620, textAlign: 'center' }}>
          We can plug the full game logic into this route next. For now, the route is live and maps directly from the home page Play button.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(72px, 1fr))', gap: 10 }}>
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              style={{
                width: 76,
                height: 76,
                borderRadius: 16,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 30,
                fontWeight: 800,
                color: index % 2 === 0 ? '#33e1ff' : '#ff7a29',
              }}
            >
              {index % 3 === 0 ? 'X' : index % 3 === 1 ? 'O' : ''}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  )
}
