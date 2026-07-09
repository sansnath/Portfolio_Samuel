import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PlayerPage from './pages/PlayerPage'
import TeamPage from './pages/TeamPage'
import TeamComparison from './pages/TeamComparison'
import ClusterPage from './pages/ClusterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="player/:id" element={<PlayerPage />} />
        <Route path="cluster/:id" element={<ClusterPage />} />
        <Route path="team/:name" element={<TeamPage />} />
        <Route path="compare" element={<TeamComparison />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
