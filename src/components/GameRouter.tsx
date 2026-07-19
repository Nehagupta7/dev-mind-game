import { Navigate, useParams } from 'react-router-dom'
import MemoryMatrix from './MemoryMatrix'
import type { ReactElement } from 'react'

type GameId =
  | 'typing'
  | 'sudoku'
  | 'tictactoe'
  | 'ludo'
  | 'mindmatrix'
  | 'snake'
  | 'chess'

type GameRouteConfig = {
  id: GameId
  name: string
  ready: boolean
  element?: ReactElement
}

const GAME_ROUTES: GameRouteConfig[] = [
  { id: 'typing', name: 'Typing Sprint', ready: false },
  { id: 'sudoku', name: 'Sudoku', ready: false },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', ready: false },
  { id: 'ludo', name: 'Ludo', ready: false },
  { id: 'mindmatrix', name: 'Mind Matrix', ready: true, element: <MemoryMatrix /> },
  { id: 'snake', name: 'Snake', ready: false },
  { id: 'chess', name: 'Chess', ready: false },
]

function ComingSoonGame({ name }: { name: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, #0a0d13 0%, #111827 100%)',
        color: '#eef1f5',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#33e1ff' }}>
          Game locked
        </p>
        <h1 style={{ margin: '12px 0 8px', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05 }}>
          {name} is coming soon
        </h1>
        <p style={{ margin: 0, color: '#8a93a6', fontSize: 16, lineHeight: 1.6 }}>
          This route is wired up already, so clicking Play can safely navigate here now.
        </p>
      </div>
    </div>
  )
}

export default function GameRouter() {
  const { gameId } = useParams()
  const resolvedGameId = gameId ?? 'mindmatrix'
  const game = GAME_ROUTES.find((entry) => entry.id === resolvedGameId)

  if (!game) {
    return <Navigate to="/" replace />
  }

  if (game.ready && game.element) {
    return game.element
  }

  return <ComingSoonGame name={game.name} />
}
