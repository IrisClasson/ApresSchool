import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ParentDashboard from './pages/ParentDashboard'
import KidView from './pages/KidView'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>⛷️ Ski Mission Control</h1>
          <nav>
            <Link to="/">Parent Dashboard</Link>
            <Link to="/kid">Kid View</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ParentDashboard />} />
            <Route path="/kid" element={<KidView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
