import { useNavigate, Route, Routes } from 'react-router-dom'
import HomePage from './components/HomePage'
import GameRouter from './components/GameRouter'

function App() {
  const navigate = useNavigate()

  return (
    <>
     <Routes>
      <Route path="/" element={<HomePage onPlay={(gameId) => navigate(`/play/${gameId}`)} />} />
      <Route path="/play/:gameId" element={<GameRouter />} />
      <Route path="/play/memory-matrix" element={<GameRouter />} />
    </Routes>
    </>
  )
}

export default App
