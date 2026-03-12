import { useParams, useNavigate, Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import { persons } from './data'
import PersonView from './PersonView'

function AppContent() {
  const { personId, coverage } = useParams()
  const navigate = useNavigate()

  const activePerson = persons.find(p => p.id === personId)
  if (!activePerson) return <Navigate to={`/${persons[0].id}/casco-complete`} replace />

  const activeCoverage = coverage === 'casco-partielle' ? 'cascoPartielle' : 'cascoComplete'

  // Redirect to casco-complete if no coverage in URL
  if (!coverage) return <Navigate to={`/${personId}/casco-complete`} replace />

  return (
    <div className="app">
      <h1 className="app-title">Comparatif Assurances Auto</h1>
      <p className="app-subtitle">Famille Porret — Offres AXA, Mobilière, Vaudoise, Zurich</p>

      <div className="person-tabs">
        {persons.map(p => (
          <button
            key={p.id}
            className={`person-tab ${personId === p.id ? 'active' : ''}`}
            onClick={() => navigate(`/${p.id}/casco-complete`)}
          >
            {p.name}
            <span className="tab-vehicle">{p.vehicle}</span>
          </button>
        ))}
      </div>

      {activePerson.showCP && (
        <div className="coverage-toggle">
          <button
            className={`coverage-btn ${activeCoverage === 'cascoComplete' ? 'active' : ''}`}
            onClick={() => navigate(`/${personId}/casco-complete`)}
          >
            Casco Complète
          </button>
          <button
            className={`coverage-btn ${activeCoverage === 'cascoPartielle' ? 'active' : ''}`}
            onClick={() => navigate(`/${personId}/casco-partielle`)}
          >
            Casco Partielle
          </button>
        </div>
      )}

      <PersonView person={activePerson} coverage={activeCoverage} />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/:personId/:coverage?" element={<AppContent />} />
      <Route path="*" element={<Navigate to={`/${persons[0].id}/casco-complete`} replace />} />
    </Routes>
  )
}

export default App
