import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './components/Home'
import DiagramView from './components/DiagramView'
import './App.css'

const DEFAULT_TITLE = 'My Diagrams | Mermaid diagrams for ML & system design'

function App() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      document.title = DEFAULT_TITLE
    }
  }, [location.pathname])

  return (
    <div className="app">
      <div className="glass-panel">
        <header className="site-header">
          <div className="site-header-inner">
            <Link to="/" className="site-title">~/diagrams</Link>
            <span className="site-tagline">mermaid · ml · system design</span>
          </div>
          <a href="https://github.com/Codebystella/My-Diagrams" target="_blank" rel="noopener noreferrer" className="site-cta">repo</a>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/diagram/:id" element={<DiagramView />} />
          </Routes>
        </main>
        <footer className="site-footer">
          <a href="https://github.com/Codebystella/My-Diagrams" target="_blank" rel="noopener noreferrer">source</a>
          {' · '}
          <a href="https://nowpayments.io/donation/stellaray777" target="_blank" rel="noopener noreferrer">support this project</a>
        </footer>
      </div>
    </div>
  )
}

export default App
